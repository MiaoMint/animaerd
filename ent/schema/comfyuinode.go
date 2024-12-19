package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/mixin"
)

// ComfyUINode holds the schema definition for the ComfyUINode entity.
type ComfyUINode struct {
	ent.Schema
}

// Fields of the ComfyUINode.
func (ComfyUINode) Fields() []ent.Field {
	return []ent.Field{
		field.String("name"),
		field.String("endpoint"),
		field.Bool("enabled").Default(true),
	}
}

func (ComfyUINode) Mixin() []ent.Mixin {
	return []ent.Mixin{
		mixin.Time{},
	}
}

// Edges of the ComfyUINode.
func (ComfyUINode) Edges() []ent.Edge {
	return nil
}
