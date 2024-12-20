package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"entgo.io/ent/schema/mixin"
	"github.com/MiaoMint/animaerd/ent/schema/schematype"
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
		schematype.SoftDeleteMixin{},
	}
}

// Edges of the Image.
func (Artwork) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tags", Tag.Type).
			Ref("artworks"),
		edge.From("owner", User.Type).
			Ref("artworks").
			Required().
			Unique(),
		edge.From("likes", User.Type).
			Ref("liked_artworks"),
		edge.From("media", Media.Type).
			Ref("artworks").
			Required().
			Unique(),
		edge.To("comments", Comment.Type),
		edge.From("comment_generate", Comment.Type).
			Ref("generated_artwork").
			Unique(),
	}
}

func (Artwork) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("title"),
		index.Fields("description"),
	}
}
