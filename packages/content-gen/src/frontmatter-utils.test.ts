import { describe, expect, it } from "vitest";
import {
	normalizeDateOnly,
	stringOrUndefined,
	toBoolean,
	toNoteStatus,
	toStringArray,
} from "./frontmatter-utils.ts";

describe("toStringArray", () => {
	it("null/undefined は空配列にする（YAML の空リスト対策）", () => {
		expect(toStringArray(null)).toEqual([]);
		expect(toStringArray(undefined)).toEqual([]);
	});

	it("配列はトリムして返す", () => {
		expect(toStringArray([" 美学 ", "物語論", "", "  "])).toEqual([
			"美学",
			"物語論",
		]);
	});

	it("単一の文字列も配列化する", () => {
		expect(toStringArray("音楽")).toEqual(["音楽"]);
	});
});

describe("stringOrUndefined", () => {
	it("空文字・空白のみは undefined にする", () => {
		expect(stringOrUndefined("")).toBeUndefined();
		expect(stringOrUndefined("   ")).toBeUndefined();
	});

	it("非文字列は undefined にする", () => {
		expect(stringOrUndefined(123)).toBeUndefined();
		expect(stringOrUndefined(null)).toBeUndefined();
	});

	it("有効な文字列はトリムして返す", () => {
		expect(stringOrUndefined("  タイトル  ")).toBe("タイトル");
	});
});

describe("normalizeDateOnly", () => {
	it("文字列の日時から日付部分だけを取り出す", () => {
		expect(normalizeDateOnly("2026-06-13 21:19")).toBe("2026-06-13");
		expect(normalizeDateOnly("2026-06-13")).toBe("2026-06-13");
	});

	it("引用符なし日時（js-yaml が Date にする場合）は UTC で日付部分を取り出す", () => {
		// js-yaml の timestamp 型解決は naive な日時を UTC として Date 化する。
		const date = new Date(Date.UTC(2026, 5, 13, 21, 19));
		expect(normalizeDateOnly(date)).toBe("2026-06-13");
	});

	it("値が無ければ空文字にする", () => {
		expect(normalizeDateOnly(undefined)).toBe("");
		expect(normalizeDateOnly(null)).toBe("");
	});
});

describe("toNoteStatus", () => {
	it("有効な値のみ通す", () => {
		expect(toNoteStatus("seed")).toBe("seed");
		expect(toNoteStatus("growing")).toBe("growing");
		expect(toNoteStatus("evergreen")).toBe("evergreen");
	});

	it("無効な値は undefined にする", () => {
		expect(toNoteStatus("")).toBeUndefined();
		expect(toNoteStatus(undefined)).toBeUndefined();
		expect(toNoteStatus("draft")).toBeUndefined();
	});
});

describe("toBoolean", () => {
	it("真偽値の true だけを true とみなす（publish の既定は false）", () => {
		expect(toBoolean(true)).toBe(true);
		expect(toBoolean(false)).toBe(false);
		expect(toBoolean(undefined)).toBe(false);
		expect(toBoolean("true")).toBe(false);
	});
});
