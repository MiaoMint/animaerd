package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/mixin"
	"github.com/MiaoMint/animaerd/ent/schema/schematype"
)

// Workflow holds the schema definition for the Workflow entity.
type Workflow struct {
	ent.Schema
}

// Fields of the Workflow.
func (Workflow) Fields() []ent.Field {
	return []ent.Field{
		field.String("name"),
		field.Enum("type").
			Values("image_to_image", "text_to_image", "comment_to_image"),
		field.String("json"),
		field.Bool("enabled").
			Default(true),
	}
}

// Edges of the Workflow.
func (Workflow) Edges() []ent.Edge {
	return nil
}

func (Workflow) Mixin() []ent.Mixin {
	return []ent.Mixin{
		mixin.Time{},
		schematype.SoftDeleteMixin{},
	}
}
