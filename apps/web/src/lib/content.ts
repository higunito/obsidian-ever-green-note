import "server-only";
import type { Article, Graph, PathItem, SearchIndex } from "@web/types/content";
import {
	articlesSchema,
	fixtureArticles,
	fixtureGraph,
	fixturePaths,
	fixtureSearchIndex,
	graphSchema,
	pathsSchema,
	searchIndexSchema,
} from "content-schema";
import { z } from "zod";

// コンテンツ取得はこの ContentStore 経由に限定する（.claude/rules/coding.md）。
// コンポーネントは Remote/Local の実体を意識しない。GitHub へは決してアクセスしない（design §6.2）。
export interface ContentStore {
	getArticles(): Promise<Article[]>;
	getArticleBySlug(slug: string): Promise<Article | undefined>;
	getGraph(): Promise<Graph>;
	getSearchIndex(): Promise<SearchIndex>;
	getPaths(): Promise<PathItem[]>;
	getPathBySlug(slug: string): Promise<PathItem | undefined>;
}

/**
 * 開発用ストア。`CONTENT_BASE_URL` 未設定時に content-schema の fixtures を返す。
 * fixtures は生成時に zod 検証済みのため、ここでは再検証しない。
 */
class LocalStore implements ContentStore {
	async getArticles(): Promise<Article[]> {
		return fixtureArticles;
	}
	async getArticleBySlug(slug: string): Promise<Article | undefined> {
		return fixtureArticles.find((a) => a.slug === slug);
	}
	async getGraph(): Promise<Graph> {
		return fixtureGraph;
	}
	async getSearchIndex(): Promise<SearchIndex> {
		return fixtureSearchIndex;
	}
	async getPaths(): Promise<PathItem[]> {
		return fixturePaths;
	}
	async getPathBySlug(slug: string): Promise<PathItem | undefined> {
		return fixturePaths.find((p) => p.slug === slug);
	}
}

const latestSchema = z.object({ buildId: z.string() });

/**
 * 本番用ストア。R2 公開 URL（`CONTENT_BASE_URL`）から JSON を読むだけ（design §6.2）。
 * `latest.json`（no-cache）で最新 build-id を取り、`content/<build-id>/*.json` を fetch する。
 * `next: { tags: ['content'] }` を付け、revalidateTag('content') でキャッシュを更新する。
 * 外部境界のため取得した JSON は zod で検証してから返す（不正なら例外）。
 */
class RemoteStore implements ContentStore {
	constructor(private readonly baseUrl: string) {}

	private async resolveBuildId(): Promise<string> {
		const res = await fetch(`${this.baseUrl}/latest.json`, {
			cache: "no-store",
		});
		if (!res.ok)
			throw new Error(`latest.json の取得に失敗しました: ${res.status}`);
		return latestSchema.parse(await res.json()).buildId;
	}

	private async fetchJson<T>(file: string, schema: z.ZodType<T>): Promise<T> {
		const buildId = await this.resolveBuildId();
		const res = await fetch(`${this.baseUrl}/content/${buildId}/${file}`, {
			next: { tags: ["content"] },
		});
		if (!res.ok) throw new Error(`${file} の取得に失敗しました: ${res.status}`);
		return schema.parse(await res.json());
	}

	async getArticles(): Promise<Article[]> {
		return this.fetchJson("articles.json", articlesSchema);
	}
	async getArticleBySlug(slug: string): Promise<Article | undefined> {
		return (await this.getArticles()).find((a) => a.slug === slug);
	}
	async getGraph(): Promise<Graph> {
		return this.fetchJson("graph.json", graphSchema);
	}
	async getSearchIndex(): Promise<SearchIndex> {
		return this.fetchJson("search-index.json", searchIndexSchema);
	}
	async getPaths(): Promise<PathItem[]> {
		return this.fetchJson("paths.json", pathsSchema);
	}
	async getPathBySlug(slug: string): Promise<PathItem | undefined> {
		return (await this.getPaths()).find((p) => p.slug === slug);
	}
}

let store: ContentStore | undefined;

/**
 * 環境変数で実体を自動切替する（`CONTENT_BASE_URL` があれば Remote、無ければ Local）。
 * lib/content.ts 以外は本関数の戻り値だけを見て、ストアの種別を意識しない。
 */
export function getContentStore(): ContentStore {
	if (!store) {
		const baseUrl = process.env.CONTENT_BASE_URL;
		store = baseUrl
			? new RemoteStore(baseUrl.replace(/\/$/, ""))
			: new LocalStore();
	}
	return store;
}
