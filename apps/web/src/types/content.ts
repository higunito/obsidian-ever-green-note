// 生成 JSON の型は content-schema を単一の情報源とし、apps/web は二重定義しない
// （.claude/rules/coding.md）。アプリ側で使う型はこのハブ経由で参照する。

export type {
	Article,
	ArticleChannel,
	ArticleLayer,
	Articles,
	CollectionItem,
	CollectionKind,
	Collections,
	Graph,
	GraphEdge,
	GraphEdgeKind,
	GraphNode,
	GraphTopic,
	NoteStatus,
	PageContent,
	Pages,
	PathItem,
	Paths,
	SearchIndex,
	SearchItem,
} from "content-schema";
