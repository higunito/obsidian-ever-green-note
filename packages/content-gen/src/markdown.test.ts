import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./markdown.ts";
import type { WikilinkResolver } from "./wikilink.ts";

const resolver: WikilinkResolver = (name) => {
	if (name === "因果と偶然")
		return { slug: "causality-and-chance", layer: "garden" };
	if (name === "断片から書くということ")
		return { slug: "writing-with-fragments", layer: "article" };
	return undefined;
};

describe("renderMarkdown", () => {
	it("解決できる wikilink はレイヤーに応じた href を持つリンクになる", () => {
		const { html, outboundLinks } = renderMarkdown(
			"[[因果と偶然]]について。",
			resolver,
		);
		expect(html).toContain(
			'<a href="/garden/causality-and-chance" data-wikilink="causality-and-chance">因果と偶然</a>',
		);
		expect(outboundLinks).toEqual(["causality-and-chance"]);
	});

	it("article へのリンクは /articles/ を使う", () => {
		const { html } = renderMarkdown("[[断片から書くということ]]", resolver);
		expect(html).toContain('href="/articles/writing-with-fragments"');
	});

	it("表示名付き wikilink（[[name|display]]）は表示名を使う", () => {
		const { html } = renderMarkdown("[[因果と偶然|この話]]", resolver);
		expect(html).toContain(">この話</a>");
		expect(html).not.toContain("因果と偶然<");
	});

	it("解決できない wikilink はリンクにせずテキスト化する（サニタイズ）", () => {
		const { html, text, outboundLinks } = renderMarkdown(
			"[[非公開の下書き|下書き]]を参照。",
			resolver,
		);
		expect(html).not.toContain("<a ");
		expect(html).toContain("下書きを参照");
		expect(text).not.toContain("[[");
		expect(text).not.toContain("]]");
		expect(outboundLinks).toEqual([]);
	});

	it("同じリンクが複数回出ても outboundLinks は重複排除される", () => {
		const { outboundLinks } = renderMarkdown(
			"[[因果と偶然]]、また[[因果と偶然]]。",
			resolver,
		);
		expect(outboundLinks).toEqual(["causality-and-chance"]);
	});

	it("プレーンテキストは HTML タグと wikilink 記法を含まない", () => {
		const { text } = renderMarkdown("**強調**と[[因果と偶然]]の話。", resolver);
		expect(text).toBe("強調と因果と偶然の話。");
	});
});
