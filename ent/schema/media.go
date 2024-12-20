package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"entgo.io/ent/schema/mixin"
)

// Media holds the schema definition for the Media entity.
type Media struct {
	ent.Schema
}

// Fields of the Media.
func (Media) Fields() []ent.Field {
	return []ent.Field{
		field.String("url"),
		field.String("key"),
		field.Int("size"),
		field.Int("width"),
		field.Int("height"),
		field.String("primary_corlor"),
		field.String("hash"),
	}
}

// Edges of the Media.
func (Media) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("artworks", Artwork.Type),
	}
}

func (Media) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("hash").Unique(),
		index.Fields("key").Unique(),
	}
}

func (Media) Mixin() []ent.Mixin {
	return []ent.Mixin{
		mixin.Time{},
	}
}
