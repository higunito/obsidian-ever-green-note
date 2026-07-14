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

// ここから下はアプリ側の派生型（content-schema に生成 JSON の対応する型がないもの）。
// Projects/ は v1 では生成 JSON を持たない（design §4 に schema なし、spec SC-008 は 0 件表示のみ）。
// `ProjectCard`（Phase 4）が将来の実データを描画できるよう、最小限のプレゼンテーション型だけ先に定義する。
export interface ProjectItem {
	slug: string;
	title: string;
	summary: string;
	tags: readonly string[];
	url?: string;
}
