package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"entgo.io/ent/schema/mixin"
	"github.com/MiaoMint/animaerd/ent/schema/schematype"
)

// Comment holds the schema definition for the Comment entity.
type Comment struct {
	ent.Schema
}

// Fields of the Comment.
func (Comment) Fields() []ent.Field {
	return []ent.Field{
		field.Int("id"),
		field.Text("content").
			NotEmpty(),
		// 表示评论深度，根评论为0，回复为1
		field.Int("depth").
			Default(0).
			NonNegative(),
	}
}

// Edges of the Comment.
func (Comment) Edges() []ent.Edge {
	return []ent.Edge{
		// 父评论关系
		edge.To("children", Comment.Type).
			From("parent").
			Unique(),
		// 评论所属用户
		edge.From("author", User.Type).
			Ref("comments").
			Unique().
			Required(),
		// like 评论
		edge.To("likes", User.Type),
		// 评论所属作品
		edge.From("artwork", Artwork.Type).
			Ref("comments"),
		// 关联生成的作品（如果回复的内容是可以生成图片的时候就会生成图片）
		edge.To("generated_artwork", Artwork.Type).
			Unique(),
	}
}

// Indexes of the Comment
func (Comment) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("depth").
			Edges("parent"),
	}
}

func (Comment) Mixin() []ent.Mixin {
	return []ent.Mixin{
		mixin.Time{},
		schematype.SoftDeleteMixin{},
	}
}
