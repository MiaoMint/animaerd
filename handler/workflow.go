package handler

import (
	"github.com/MiaoMint/animaerd/dto"
	"github.com/MiaoMint/animaerd/ent"
	"github.com/MiaoMint/animaerd/ent/workflow"
	"github.com/MiaoMint/animaerd/ext"
	"github.com/MiaoMint/animaerd/pkg/result"
	"github.com/gofiber/fiber/v2"
)

// GetWorkflowList returns all workflows
func GetWorkflowList(c *fiber.Ctx) error {
	workflows, err := ext.EntClient().Workflow.
		Query().
		All(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).
			JSON(result.NewErrorResult(err.Error(), fiber.StatusInternalServerError))
	}

	var list []dto.WorkflowResponse
	for _, workflow := range workflows {
		list = append(list, dto.WorkflowResponse{
			ID:              workflow.ID,
			Name:            workflow.Name,
			Type:            workflow.Type.String(),
			JSON:            workflow.JSON,
			ImageResultNode: workflow.ImageResultNode,
			Enabled:         workflow.Enabled,
			CreateTime:      workflow.CreateTime.String(),
		})
	}

	return c.JSON(result.NewSuccessResult(list))
}

// GetWorkflow returns a specific workflow by ID
func GetWorkflow(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).
			JSON(result.NewErrorResult(err.Error(), fiber.StatusBadRequest))
	}

	workflow, err := ext.EntClient().Workflow.Get(c.Context(), id)
	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).
				JSON(result.NewErrorResult("Workflow not found", fiber.StatusNotFound))
		}
		return c.Status(fiber.StatusInternalServerError).
			JSON(result.NewErrorResult(err.Error(), fiber.StatusInternalServerError))
	}

	return c.JSON(result.NewSuccessResult(dto.WorkflowResponse{
		ID:              workflow.ID,
		Name:            workflow.Name,
		Type:            workflow.Type.String(),
		JSON:            workflow.JSON,
		ImageResultNode: workflow.ImageResultNode,
		Enabled:         workflow.Enabled,
		CreateTime:      workflow.CreateTime.String(),
	}))
}

// CreateWorkflow creates a new workflow
func CreateWorkflow(c *fiber.Ctx) error {
	var req dto.WorkflowCreateRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).
			JSON(result.NewErrorResult(err.Error(), fiber.StatusBadRequest))
	}

	workflow, err := ext.EntClient().Workflow.Create().
		SetName(req.Name).
		SetType(workflow.Type(req.Type)).
		SetJSON(req.JSON).
		SetImageResultNode(req.ImageResultNode).
		Save(c.Context())

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).
			JSON(result.NewErrorResult(err.Error(), fiber.StatusInternalServerError))
	}

	return c.Status(fiber.StatusCreated).
		JSON(result.NewSuccessResult(workflow))
}

// UpdateWorkflow updates an existing workflow
func UpdateWorkflow(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).
			JSON(result.NewErrorResult(err.Error(), fiber.StatusBadRequest))
	}

	var req dto.WorkflowUpdateRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).
			JSON(result.NewErrorResult(err.Error(), fiber.StatusBadRequest))
	}

	update := ext.EntClient().Workflow.UpdateOneID(id).
		SetNillableName(req.Name).
		SetNillableJSON(req.JSON).
		SetNillableImageResultNode(req.ImageResultNode).
		SetNillableEnabled(req.Enabled)

	if req.Type != nil {
		update.SetType(workflow.Type(*req.Type))
	}

	workflow, err := update.Save(c.Context())
	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).
				JSON(result.NewErrorResult("Workflow not found", fiber.StatusNotFound))
		}
		return c.Status(fiber.StatusInternalServerError).
			JSON(result.NewErrorResult(err.Error(), fiber.StatusInternalServerError))
	}

	return c.JSON(result.NewSuccessResult(workflow))
}

// DeleteWorkflow soft deletes a workflow
func DeleteWorkflow(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).
			JSON(result.NewErrorResult(err.Error(), fiber.StatusBadRequest))
	}

	err = ext.EntClient().Workflow.DeleteOneID(id).Exec(c.Context())
	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).
				JSON(result.NewErrorResult("Workflow not found", fiber.StatusNotFound))
		}
		return c.Status(fiber.StatusInternalServerError).
			JSON(result.NewErrorResult(err.Error(), fiber.StatusInternalServerError))
	}

	return c.JSON(result.NewSuccessResult(nil))
}
