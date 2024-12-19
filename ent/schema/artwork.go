package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"entgo.io/ent/schema/mixin"
)

// Artwork holds the schema definition for the Artwork entity.
type Artwork struct {
	ent.Schema
}

// Fields of the Image.
func (Artwork) Fields() []ent.Field {
	return []ent.Field{
		field.String("title").Optional(),
		field.Text("description").Optional(),
		field.Bool("is_ai").Default(false),
	}
}

func (Artwork) Mixin() []ent.Mixin {
	return []ent.Mixin{
		mixin.Time{},
	}
}

// Edges of the Image.
func (Artwork) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tags", Tag.Type).
			Ref("artworks"),
		edge.From("owner", User.Type).
			Ref("artworks").
			Unique(),
		edge.From("likes", User.Type).
			Ref("liked_artworks"),
		edge.From("favorites", User.Type).
			Ref("favorites"),
		edge.From("media", Media.Type).
			Ref("artworks").
			Unique(),
	}
}

func (Artwork) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("title"),
		index.Fields("description"),
	}
}
