package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"entgo.io/ent/schema/mixin"
)

// User holds the schema definition for the User entity.
type User struct {
	ent.Schema
}

// Fields of the User.
func (User) Fields() []ent.Field {
	return []ent.Field{
		field.String("username").Optional(),
		field.String("display_name").Optional(),
		field.String("avatar").Optional(),
		field.String("bio").Optional(),
		field.Enum("provider").
			Values("github", "google", "microsoft"),
		field.String("provider_account_id"),
		field.Enum("role").
			Values("user", "admin").
			Default("user"),
		// 用户状态
		field.Enum("status").
			Values("active", "banned").
			Default("active"),
		// 是否公开用户收藏显示
		field.Bool("is_favorites_public").
			Default(true),
		// 是否公开用户喜欢的作品显示
		field.Bool("is_likes_public").
			Default(true),
	}
}

func (User) Mixin() []ent.Mixin {
	return []ent.Mixin{
		mixin.Time{},
	}
}

// Edges of the User.
func (User) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("artworks", Artwork.Type),
		edge.To("liked_artworks", Artwork.Type),
		edge.To("favorites", Artwork.Type),
		edge.To("following", User.Type).
			From("followers"),
	}
}

func (User) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("username").
			Unique(),
		index.Fields("provider", "provider_account_id").
			Unique(),
	}
}
