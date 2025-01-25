package comfynode

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/MiaoMint/animaerd/ent"
	"github.com/MiaoMint/animaerd/ent/comfyuinode"
	"github.com/gofiber/fiber/v2/log"
)

type ComfyNodeManager struct {
	client *ent.Client
	nodes  map[int]*NodeStatus
	mu     sync.RWMutex
}

type NodeStatus struct {
	ID        int
	Name      string
	Endpoint  string
	Enabled   bool
	IsAlive   bool
	LastCheck string
	Queue     int // Number of tasks in queue
}

// NewManager creates a new ComfyUI node manager
func NewManager(client *ent.Client) *ComfyNodeManager {
	log.Info("Creating ComfyNodeManager")
	m := &ComfyNodeManager{
		client: client,
		nodes:  make(map[int]*NodeStatus),
	}
	go m.startHealthCheck()
	return m
}

// startHealthCheck periodically checks the health of all nodes
func (m *ComfyNodeManager) startHealthCheck() {
	m.checkAllNodes() // Initial check
	ticker := time.NewTicker(30 * time.Second)
	for range ticker.C {
		m.checkAllNodes()
	}
}

// checkAllNodes updates the status of all nodes
func (m *ComfyNodeManager) checkAllNodes() {
	ctx := context.Background()
	nodes, err := m.client.ComfyUINode.Query().
		Where(comfyuinode.Enabled(true)).
		All(ctx)
	log.Info("Checking node health")

	if err != nil {
		return
	}

	m.mu.Lock()
	defer m.mu.Unlock()

	for _, node := range nodes {
		status := m.checkNodeHealth(node)
		m.nodes[node.ID] = status
	}
}

// checkNodeHealth checks the health of a single node
func (m *ComfyNodeManager) checkNodeHealth(node *ent.ComfyUINode) *NodeStatus {
	status := &NodeStatus{
		ID:        node.ID,
		Name:      node.Name,
		Endpoint:  node.Endpoint,
		Enabled:   node.Enabled,
		LastCheck: time.Now().UTC().String(),
	}

	// Try to get queue status from ComfyUI node
	resp, err := http.Get(fmt.Sprintf("%s/queue", node.Endpoint))
	if err != nil {
		status.IsAlive = false
		return status
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		status.IsAlive = false
		return status
	}

	var queueData struct {
		QueueRunning []interface{} `json:"queue_running"`
		QueuePending []interface{} `json:"queue_pending"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&queueData); err != nil {
		status.IsAlive = false
		return status
	}

	status.IsAlive = true
	status.Queue = len(queueData.QueueRunning) + len(queueData.QueuePending)
	return status
}

// GetAvailableNode returns the best node for processing based on queue size
func (m *ComfyNodeManager) GetAvailableNode() *NodeStatus {
	m.mu.RLock()
	defer m.mu.RUnlock()

	var bestNode *NodeStatus
	lowestQueue := -1

	for _, node := range m.nodes {
		if !node.IsAlive || !node.Enabled {
			continue
		}

		if lowestQueue == -1 || node.Queue < lowestQueue {
			bestNode = node
			lowestQueue = node.Queue
		}
	}

	return bestNode
}

// GetNodeStatus returns the current status of a specific node
func (m *ComfyNodeManager) GetNodeStatus(nodeID int) *NodeStatus {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.nodes[nodeID]
}

// GetAllNodeStatus returns the status of all nodes
func (m *ComfyNodeManager) GetAllNodeStatus() []*NodeStatus {
	m.mu.RLock()
	defer m.mu.RUnlock()

	statuses := make([]*NodeStatus, 0, len(m.nodes))
	for _, status := range m.nodes {
		statuses = append(statuses, status)
	}
	return statuses
}

type Task struct {
	NodeID     int                    `json:"node_id"`
	PromptID   string                 `json:"prompt_id"`
	Number     int                    `json:"number"`
	NodeErrors map[string]interface{} `json:"node_errors"`
}

// run json workflow task return prompt id
func (m *ComfyNodeManager) AddTask(task string) (*Task, error) {
	m.mu.RLock()
	node := m.GetAvailableNode()
	m.mu.RUnlock()
	if node == nil {
		return nil, fmt.Errorf("no available node")
	}

	prompt := fmt.Sprintf(`{"client_id":"%s","prompt": %s}`, "animaerd", task)

	resp, err := http.Post(fmt.Sprintf("%s/api/prompt", node.Endpoint), "application/json", strings.NewReader(prompt))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("task failed")
	}

	var taskData Task

	if err := json.NewDecoder(resp.Body).Decode(&taskData); err != nil {
		return nil, err
	}

	taskData.NodeID = node.ID

	return &taskData, nil
}

// 查询 task 数据
func (m *ComfyNodeManager) GetTask(task *Task) (map[string]interface{}, error) {
	m.mu.RLock()
	node := m.GetNodeStatus(task.NodeID)
	m.mu.RUnlock()
	if node == nil {
		return nil, fmt.Errorf("no available node")
	}

	resp, err := http.Get(fmt.Sprintf("%s/api/history/%s", node.Endpoint, task.PromptID))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("get task failed")
	}

	taskData := make(map[string]interface{})

	if err := json.NewDecoder(resp.Body).Decode(&taskData); err != nil {
		return nil, err
	}

	return taskData, nil
}

// 获取图片
func (m *ComfyNodeManager) GetImage(nodeID int, filename string) ([]byte, string, error) {
	m.mu.RLock()
	node := m.GetNodeStatus(nodeID)
	m.mu.RUnlock()
	if node == nil {
		return nil, "", fmt.Errorf("no available node")
	}

	resp, err := http.Get(fmt.Sprintf("%s/api/view?filename=%s", node.Endpoint, filename))
	if err != nil {
		return nil, "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, "", fmt.Errorf("get image failed")
	}

	contentType := resp.Header.Get("Content-Type")
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, "", fmt.Errorf("failed to read file: %v", err)
	}

	return body, contentType, nil
}
