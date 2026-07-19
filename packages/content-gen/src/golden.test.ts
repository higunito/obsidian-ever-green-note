import { fileURLToPath } from "node:url";
import {
	articlesSchema,
	graphSchema,
	pathsSchema,
	searchIndexSchema,
} from "content-schema";
import { describe, expect, it } from "vitest";
import { generateContent } from "./build.ts";

const REFERENCE_VAULT = fileURLToPath(
	new URL("../../../reference/obsidian", import.meta.url),
);

/**
 * `reference/obsidian` は実 Vault の断面（読み取り専用）。現時点では Fleeting/ が無く、
 * Permanent/ 配下のノートも全て publish:false のため、生成結果は「空だが妥当な JSON」になるはずである。
 * ここでは (1) スナップショットで出力の安定性を、(2) 非公開データが一切出力に含まれないことを保証する。
 */
describe("generateContent（reference/obsidian ゴールデンテスト）", () => {
	const result = generateContent(REFERENCE_VAULT);

	it("全 4 出力が content-schema の zod スキーマを通過する", () => {
		expect(articlesSchema.safeParse(result.articles).success).toBe(true);
		expect(graphSchema.safeParse(result.graph).success).toBe(true);
		expect(searchIndexSchema.safeParse(result.searchIndex).success).toBe(true);
		expect(pathsSchema.safeParse(result.paths).success).toBe(true);
	});

	it("公開ゾーンに publish:true のノートが無いため、記事・グラフ・検索・パスは空になる", () => {
		expect(result.articles).toEqual([]);
		expect(result.graph).toEqual({ topics: [], nodes: [], edges: [] });
		expect(result.searchIndex).toEqual({ items: [] });
		expect(result.paths).toEqual([]);
	});

	it("出力全体のスナップショット（将来ノートが publish:true になった際の回帰検知用）", () => {
		expect(result).toMatchSnapshot();
	});
});
