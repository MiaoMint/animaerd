package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/mixin"
	"github.com/MiaoMint/animaerd/ent/schema/schematype"
)

// Style holds the schema definition for the Style entity.
type Style struct {
	ent.Schema
}

// Fields of the Style.
func (Style) Fields() []ent.Field {
	return []ent.Field{
		field.String("name"),
		field.String("icon"),
	}
}

// Edges of the Style.
func (Style) Edges() []ent.Edge {
	return []ent.Edge{
		// 绑定对应的 workflow
		edge.To("workflows", Workflow.Type).Unique(),
	}
}

func (Style) Mixin() []ent.Mixin {
	return []ent.Mixin{
		mixin.Time{},
		schematype.SoftDeleteMixin{},
	}
}
