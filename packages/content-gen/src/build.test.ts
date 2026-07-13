import { fileURLToPath } from "node:url";
import {
	articlesSchema,
	collectionsSchema,
	graphSchema,
	pagesSchema,
	pathsSchema,
	searchIndexSchema,
} from "content-schema";
import { describe, expect, it } from "vitest";
import { generateContent } from "./build.ts";

const FIXTURE_VAULT = fileURLToPath(
	new URL("../test/fixtures/vault", import.meta.url),
);

const PRIVATE_MARKERS = [
	"SECRET_MEMO_MARKER",
	"SECRET_LITERATURE_MARKER",
	"SECRET_DRAFT_MARKER",
	"UNPUBLISHED_ESSAY_MARKER",
	"UNPUBLISHED_ALBUM_MARKER",
	"MALFORMED_ITEM_MARKER",
	"source_ref",
	"Literature/",
	"Memo/",
];

describe("generateContent（fixture vault）", () => {
	const result = generateContent(FIXTURE_VAULT);

	it("全 6 出力が content-schema の zod スキーマを通過する", () => {
		expect(articlesSchema.safeParse(result.articles).success).toBe(true);
		expect(graphSchema.safeParse(result.graph).success).toBe(true);
		expect(searchIndexSchema.safeParse(result.searchIndex).success).toBe(true);
		expect(collectionsSchema.safeParse(result.collections).success).toBe(true);
		expect(pathsSchema.safeParse(result.paths).success).toBe(true);
		expect(pagesSchema.safeParse(result.pages).success).toBe(true);
	});

	it("非公開ノート・非公開ゾーンの内容がどの出力にも一切含まれない", () => {
		const serialized = JSON.stringify(result);
		for (const marker of PRIVATE_MARKERS) {
			expect(serialized).not.toContain(marker);
		}
	});

	it("publish:true かつ公開ゾーンのノートだけが articles に載る", () => {
		const slugs = result.articles.map((a) => a.slug).sort();
		expect(slugs).toEqual(
			[
				"jazz-jackets",
				"narrative-and-reality",
				"path-narrative-inquiry",
				"writing-with-fragments",
				"因果と偶然",
			].sort(),
		);
	});

	it("articles は slug 昇順で安定ソートされている", () => {
		const slugs = result.articles.map((a) => a.slug);
		expect(slugs).toEqual([...slugs].sort());
	});

	it("Permanent/note/ 配下は channel:note、それ以外の essay は channel:native になる", () => {
		const jazz = result.articles.find((a) => a.slug === "jazz-jackets");
		const essay = result.articles.find(
			(a) => a.slug === "writing-with-fragments",
		);
		expect(jazz?.channel).toBe("note");
		expect(essay?.channel).toBe("native");
	});

	it("garden→essay の wikilink はレイヤーをまたいで解決され /essays/ を指す", () => {
		const narrative = result.articles.find(
			(a) => a.slug === "narrative-and-reality",
		);
		expect(narrative?.outboundLinks).toContain("writing-with-fragments");
		expect(narrative?.bodyHtml).toContain(
			'href="/essays/writing-with-fragments"',
		);
	});

	it("非公開ノートへの wikilink はリンクにならずテキスト化される", () => {
		const narrative = result.articles.find(
			(a) => a.slug === "narrative-and-reality",
		);
		expect(narrative?.outboundLinks).not.toContain("private-draft");
		expect(narrative?.bodyHtml).not.toContain('data-wikilink="private-draft"');
		expect(narrative?.bodyHtml).toContain("下書きの断片");
	});

	it("backlinks は全ノートの outboundLinks を正しく逆引きしている（レイヤー横断）", () => {
		const bySlug = new Map(result.articles.map((a) => [a.slug, a]));
		for (const article of result.articles) {
			for (const target of article.outboundLinks) {
				expect(bySlug.get(target)?.backlinks).toContain(article.slug);
			}
		}
		// writing-with-fragments（essay）が narrative-and-reality（garden）へリンクしているので、
		// 層をまたいで narrative-and-reality の backlinks に essay が含まれる。
		expect(bySlug.get("narrative-and-reality")?.backlinks).toContain(
			"writing-with-fragments",
		);
	});

	it("graph は Garden 層のノードだけを含む（Map は Garden 専用）", () => {
		const nodeIds = result.graph.nodes.map((n) => n.id).sort();
		expect(nodeIds).toEqual(
			["narrative-and-reality", "path-narrative-inquiry", "因果と偶然"].sort(),
		);
		expect(result.graph.nodes.every((n) => n.layer === "garden")).toBe(true);
	});

	it("graph.topics は Garden ノートが持つ topics の和集合のみ（Essay 由来の topics は含まない）", () => {
		const topicIds = result.graph.topics.map((t) => t.id).sort();
		expect(topicIds).toEqual(["美学", "物語論"].sort());
	});

	it("graph.edges の note kind は Garden ノード同士のリンクのみ含む", () => {
		const gardenIds = new Set(result.graph.nodes.map((n) => n.id));
		const noteEdges = result.graph.edges.filter((e) => e.kind === "note");
		for (const edge of noteEdges) {
			expect(gardenIds.has(edge.source)).toBe(true);
			expect(gardenIds.has(edge.target)).toBe(true);
		}
		// writing-with-fragments（essay、graph ノードではない）からのリンクは辺として現れない。
		expect(noteEdges.some((e) => e.source === "writing-with-fragments")).toBe(
			false,
		);
	});

	it("MOC ノートは .EXE、通常の Garden ノートは .DAT の擬似ファイル名を持つ", () => {
		const moc = result.graph.nodes.find(
			(n) => n.id === "path-narrative-inquiry",
		);
		const normal = result.graph.nodes.find(
			(n) => n.id === "narrative-and-reality",
		);
		expect(moc?.file.endsWith(".EXE")).toBe(true);
		expect(normal?.file.endsWith(".DAT")).toBe(true);
	});

	it("paths は MOC ノートの outboundLinks を順序付き steps として持つ", () => {
		expect(result.paths).toHaveLength(1);
		const path = result.paths[0];
		expect(path.slug).toBe("path-narrative-inquiry");
		expect(path.steps).toEqual(["narrative-and-reality", "因果と偶然"]);
	});

	it("paths.topics は MOC 自身の空 topics ではなく steps の topics の和集合になる", () => {
		const path = result.paths[0];
		expect(path.topics).toEqual(["美学", "物語論"]);
	});

	it("pages.now / pages.about は Fleeting/now.md・about.md から生成される", () => {
		expect(result.pages.now.bodyHtml).toContain("物語と現実の違い");
		expect(result.pages.now.topics).toEqual(["物語論"]);
		expect(result.pages.about.bodyHtml).toContain("思考アーカイブ");
	});

	it("collections は publish:true かつ必須項目が揃ったアイテムだけを含む", () => {
		expect(result.collections.items).toHaveLength(1);
		expect(result.collections.items[0].slug).toBe("book-invisible-cities");
	});

	it("collections アイテムは source_ref フィールドを一切持たない（構造的サニタイズ）", () => {
		for (const item of result.collections.items) {
			expect(Object.hasOwn(item, "source_ref")).toBe(false);
		}
	});

	it("search-index はプレーンテキストのみを持ち wikilink 記法・HTML タグを含まない", () => {
		expect(result.searchIndex.items).toHaveLength(5);
		for (const item of result.searchIndex.items) {
			expect(item.text).not.toMatch(/\[\[|\]\]|<[a-z]/i);
		}
	});
});
