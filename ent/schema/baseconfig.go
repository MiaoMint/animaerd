package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/mixin"
)

// BaseConfig holds the schema definition for the BaseConfig entity.
type BaseConfig struct {
	ent.Schema
}

// Fields of the BaseConfig.
func (BaseConfig) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").Unique(),
		field.Text("value"),
	}
}

// Edges of the BaseConfig.
func (BaseConfig) Edges() []ent.Edge {
	return nil
}

// Mixin of the BaseConfig.
func (BaseConfig) Mixin() []ent.Mixin {
	return []ent.Mixin{
		mixin.Time{},
	}
}
