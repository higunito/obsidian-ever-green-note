import { describe, expect, it } from "vitest";
import {
	articlesSchema,
	collectionsSchema,
	fixtureArticles,
	fixtureCollections,
	fixtureGraph,
	fixturePages,
	fixturePaths,
	fixtureSearchIndex,
	graphSchema,
	pagesSchema,
	pathsSchema,
	searchIndexSchema,
} from "./index.ts";

describe("fixtures がスキーマ検証を通過する", () => {
	it("articles.json", () => {
		expect(articlesSchema.safeParse(fixtureArticles).success).toBe(true);
	});

	it("graph.json", () => {
		expect(graphSchema.safeParse(fixtureGraph).success).toBe(true);
	});

	it("search-index.json", () => {
		expect(searchIndexSchema.safeParse(fixtureSearchIndex).success).toBe(true);
	});

	it("collections.json", () => {
		expect(collectionsSchema.safeParse(fixtureCollections).success).toBe(true);
	});

	it("paths.json", () => {
		expect(pathsSchema.safeParse(fixturePaths).success).toBe(true);
	});

	it("pages.json", () => {
		expect(pagesSchema.safeParse(fixturePages).success).toBe(true);
	});
});

describe("fixtures の相互整合性（後続 Phase が前提にする不変条件）", () => {
	const articleSlugs = new Set(fixtureArticles.map((a) => a.slug));

	it("garden と essay の両レイヤーを含む", () => {
		const layers = new Set(fixtureArticles.map((a) => a.layer));
		expect(layers).toEqual(new Set(["garden", "essay"]));
	});

	it("outboundLinks は必ず既知の slug を指す", () => {
		for (const article of fixtureArticles) {
			for (const link of article.outboundLinks) {
				expect(articleSlugs.has(link)).toBe(true);
			}
		}
	});

	it("backlinks は outboundLinks の逆引きと一致する（生成時アルゴリズムの前提）", () => {
		const expectedBacklinks = new Map<string, Set<string>>();
		for (const article of fixtureArticles) {
			for (const link of article.outboundLinks) {
				if (!expectedBacklinks.has(link))
					expectedBacklinks.set(link, new Set());
				expectedBacklinks.get(link)?.add(article.slug);
			}
		}
		for (const article of fixtureArticles) {
			const expected = expectedBacklinks.get(article.slug) ?? new Set();
			expect(new Set(article.backlinks)).toEqual(expected);
		}
	});

	it("MOC ノート（tags: moc）は topics に自分自身を含まない運用（design.md §5.3）", () => {
		const moc = fixtureArticles.find((a) => a.tags.includes("moc"));
		expect(moc).toBeDefined();
		expect(moc?.topics).toEqual([]);
	});

	it("graph.json のノードは articles.json の garden レイヤーと一致する", () => {
		const gardenSlugs = new Set(
			fixtureArticles.filter((a) => a.layer === "garden").map((a) => a.slug),
		);
		expect(new Set(fixtureGraph.nodes.map((n) => n.id))).toEqual(gardenSlugs);
	});

	it("graph.json の edge は既知の node/topic のみを参照する", () => {
		const nodeIds = new Set(fixtureGraph.nodes.map((n) => n.id));
		const topicIds = new Set(fixtureGraph.topics.map((t) => t.id));
		for (const edge of fixtureGraph.edges) {
			expect(nodeIds.has(edge.source)).toBe(true);
			if (edge.kind === "note") {
				expect(nodeIds.has(edge.target)).toBe(true);
			} else {
				expect(topicIds.has(edge.target)).toBe(true);
			}
		}
	});

	it("graph.json の topic.count はノード側の topics 出現数と一致する", () => {
		const counts = new Map<string, number>();
		for (const node of fixtureGraph.nodes) {
			for (const topic of node.topics) {
				counts.set(topic, (counts.get(topic) ?? 0) + 1);
			}
		}
		for (const topic of fixtureGraph.topics) {
			expect(topic.count).toBe(counts.get(topic.id) ?? 0);
		}
	});

	it("search-index.json は publish 対象の全記事を1件ずつカバーする", () => {
		expect(new Set(fixtureSearchIndex.items.map((i) => i.slug))).toEqual(
			articleSlugs,
		);
	});

	it("search-index.json の text は wikilink 記法（[[ ]]）を含まない", () => {
		for (const item of fixtureSearchIndex.items) {
			expect(item.text).not.toMatch(/\[\[.*?\]\]/);
		}
	});

	it("collections.json は非公開参照 source_ref を含まない（サニタイズ契約）", () => {
		for (const item of fixtureCollections.items) {
			expect(Object.hasOwn(item, "source_ref")).toBe(false);
		}
	});

	it("paths.json の steps は既知の garden slug を順序付きで指す", () => {
		const gardenSlugs = new Set(
			fixtureArticles.filter((a) => a.layer === "garden").map((a) => a.slug),
		);
		for (const path of fixturePaths) {
			expect(path.steps.length).toBeGreaterThan(0);
			for (const step of path.steps) {
				expect(gardenSlugs.has(step)).toBe(true);
			}
		}
	});

	it("pages.json の about は bodyHtml を持つ", () => {
		expect(fixturePages.about.bodyHtml.length).toBeGreaterThan(0);
	});
});
