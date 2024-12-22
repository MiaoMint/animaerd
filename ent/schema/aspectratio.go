package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/field"
)

// AspectRatio holds the schema definition for the AspectRatio entity.
type AspectRatio struct {
	ent.Schema
}

// Fields of the AspectRatio.
func (AspectRatio) Fields() []ent.Field {
	return []ent.Field{
		field.String("ratio"),
		field.Int("width"),
		field.Int("height"),
	}
}

// Edges of the AspectRatio.
func (AspectRatio) Edges() []ent.Edge {
	return nil
}
