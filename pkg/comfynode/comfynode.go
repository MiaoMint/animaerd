package comfynode

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/MiaoMint/animaerd/ent"
	"github.com/MiaoMint/animaerd/ent/comfyuinode"
)

type Manager struct {
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
	LastCheck time.Time
	Queue     int // Number of tasks in queue
}

// NewManager creates a new ComfyUI node manager
func NewManager(client *ent.Client) *Manager {
	m := &Manager{
		client: client,
		nodes:  make(map[int]*NodeStatus),
	}
	go m.startHealthCheck()
	return m
}

// startHealthCheck periodically checks the health of all nodes
func (m *Manager) startHealthCheck() {
	ticker := time.NewTicker(30 * time.Second)
	for range ticker.C {
		m.checkAllNodes()
	}
}

// checkAllNodes updates the status of all nodes
func (m *Manager) checkAllNodes() {
	ctx := context.Background()
	nodes, err := m.client.ComfyUINode.Query().
		Where(comfyuinode.Enabled(true)).
		All(ctx)
	
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
func (m *Manager) checkNodeHealth(node *ent.ComfyUINode) *NodeStatus {
	status := &NodeStatus{
		ID:        node.ID,
		Name:      node.Name,
		Endpoint:  node.Endpoint,
		Enabled:   node.Enabled,
		LastCheck: time.Now(),
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
		QueueRemaining int `json:"queue_remaining"`
	}
	
	if err := json.NewDecoder(resp.Body).Decode(&queueData); err != nil {
		status.IsAlive = false
		return status
	}

	status.IsAlive = true
	status.Queue = queueData.QueueRemaining
	return status
}

// GetAvailableNode returns the best node for processing based on queue size
func (m *Manager) GetAvailableNode() *NodeStatus {
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
func (m *Manager) GetNodeStatus(nodeID int) *NodeStatus {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.nodes[nodeID]
}

// GetAllNodeStatus returns the status of all nodes
func (m *Manager) GetAllNodeStatus() []*NodeStatus {
	m.mu.RLock()
	defer m.mu.RUnlock()

	statuses := make([]*NodeStatus, 0, len(m.nodes))
	for _, status := range m.nodes {
		statuses = append(statuses, status)
	}
	return statuses
}

