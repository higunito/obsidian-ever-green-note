import { describe, expect, it } from "vitest";
import { basenameNoExt, slugify, uniqueSlug } from "./slug.ts";

describe("basenameNoExt", () => {
	it("拡張子とディレクトリ部分を取り除く", () => {
		expect(basenameNoExt("engineering/aws_scrap.md")).toBe("aws_scrap");
		expect(basenameNoExt("narrative-and-reality.md")).toBe(
			"narrative-and-reality",
		);
	});
});

describe("slugify", () => {
	it("空白・アンダースコアをハイフンに正規化する", () => {
		expect(slugify("hello world_test")).toBe("hello-world-test");
	});

	it("日本語はそのまま保持する", () => {
		expect(slugify("因果と偶然")).toBe("因果と偶然");
	});

	it("前後の余分なハイフンを取り除く", () => {
		expect(slugify("  --foo--  ")).toBe("foo");
	});
});

describe("uniqueSlug", () => {
	it("未使用なら候補をそのまま返す", () => {
		expect(uniqueSlug("narrative-and-reality", new Set())).toBe(
			"narrative-and-reality",
		);
	});

	it("衝突時は -2, -3 ... を付けて一意化する", () => {
		const used = new Set(["narrative-and-reality", "narrative-and-reality-2"]);
		expect(uniqueSlug("narrative-and-reality", used)).toBe(
			"narrative-and-reality-3",
		);
	});
});
