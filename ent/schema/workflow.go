package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/mixin"
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

func (Workflow) Mixin() []ent.Mixin {
	return []ent.Mixin{
		mixin.Time{},
	}
}

// Edges of the Workflow.
func (Workflow) Edges() []ent.Edge {
	return nil
}
