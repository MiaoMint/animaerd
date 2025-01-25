package handler

import (
	"github.com/MiaoMint/animaerd/dto"
	"github.com/MiaoMint/animaerd/ent"
	"github.com/MiaoMint/animaerd/ent/comfyuinode"
	"github.com/MiaoMint/animaerd/ext"
	"github.com/MiaoMint/animaerd/pkg/comfynode"
	"github.com/MiaoMint/animaerd/pkg/result"
	"github.com/gofiber/fiber/v2"
)

// GetComfyUiNodeList retrieves all ComfyUI nodes
func GetComfyUiNodeList(c *fiber.Ctx) error {
	entClient := ext.EntClient()
	nodes, err := entClient.ComfyUINode.Query().
		Order(ent.Asc(comfyuinode.FieldName)).
		All(c.Context())
	comfy := ext.ComfyNodeManager()

	if err != nil {
		return c.JSON(result.NewErrorResult("Failed to fetch nodes", 500))
	}

	var list []dto.ComfyUiNodeResponse
	for _, node := range nodes {
		comfyStatus := comfy.GetNodeStatus(node.ID)

		if comfyStatus == nil {
			comfyStatus = &comfynode.NodeStatus{
				IsAlive:   false,
				LastCheck: "",
				Queue:     0,
			}
		}

		list = append(list, dto.ComfyUiNodeResponse{
			ID:          node.ID,
			Name:        node.Name,
			Endpoint:    node.Endpoint,
			Enabled:     node.Enabled,
			CreatedTime: node.CreateTime.String(),
			IsAlive:     comfyStatus.IsAlive,
			LastCheck:   comfyStatus.LastCheck,
			Queue:       comfyStatus.Queue,
		})
	}

	return c.JSON(result.NewSuccessResult(list))
}

// GetComfyUiNode retrieves a single ComfyUI node by ID
func GetComfyUiNode(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.JSON(result.NewErrorResult("Invalid node ID", 400))
	}

	entClient := ext.EntClient()
	node, err := entClient.ComfyUINode.Get(c.Context(), id)
	if err != nil {
		if ent.IsNotFound(err) {
			return c.JSON(result.NewErrorResult("Node not found", 404))
		}
		return c.JSON(result.NewErrorResult("Failed to fetch node", 500))
	}

	return c.JSON(result.NewSuccessResult(node))
}

// CreateComfyUiNode creates a new ComfyUI node
func CreateComfyUiNode(c *fiber.Ctx) error {
	var node dto.CreateComfyUiNodeRequest

	if err := c.BodyParser(&node); err != nil {
		return c.JSON(result.NewErrorResult("Invalid request body", 400))
	}

	entClient := ext.EntClient()
	created, err := entClient.ComfyUINode.Create().
		SetName(node.Name).
		SetEndpoint(node.Endpoint).
		SetEnabled(true).
		Save(c.Context())

	if err != nil {
		return c.JSON(result.NewErrorResult("Failed to create node", 500))
	}

	return c.JSON(result.NewSuccessResult(created))
}

// UpdateComfyUiNode updates an existing ComfyUI node
func UpdateComfyUiNode(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.JSON(result.NewErrorResult("Invalid node ID", 400))
	}

	var node dto.UpdateComfyUiNodeRequest

	if err := c.BodyParser(&node); err != nil {
		return c.JSON(result.NewErrorResult("Invalid request body", 400))
	}

	entClient := ext.EntClient()
	updated, err := entClient.ComfyUINode.UpdateOneID(id).
		SetNillableName(node.Name).
		SetNillableEndpoint(node.Endpoint).
		SetNillableEnabled(node.Enabled).Save(c.Context())

	if err != nil {
		if ent.IsNotFound(err) {
			return c.JSON(result.NewErrorResult("Node not found", 404))
		}
		return c.JSON(result.NewErrorResult("Failed to update node", 500))
	}

	return c.JSON(result.NewSuccessResult(updated))
}

// DeleteComfyUiNode deletes a ComfyUI node
func DeleteComfyUiNode(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.JSON(result.NewErrorResult("Invalid node ID", 400))
	}

	entClient := ext.EntClient()
	err = entClient.ComfyUINode.DeleteOneID(id).Exec(c.Context())
	if err != nil {
		if ent.IsNotFound(err) {
			return c.JSON(result.NewErrorResult("Node not found", 404))
		}
		return c.JSON(result.NewErrorResult("Failed to delete node", 500))
	}

	return c.JSON(result.NewSuccessResult(nil))
}
