import type { Root } from "mdast";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import {
	applyWikilinks,
	type WikilinkResolver,
	type WikilinkTarget,
} from "./wikilink.ts";

export interface MarkdownResult {
	/** remark-rehype → rehype-stringify を経た HTML（wikilink 解決済み）。 */
	html: string;
	/** HTML タグ・`[[ ]]` 記法を含まないプレーンテキスト（search-index 用）。 */
	text: string;
	/** 解決できた wikilink の遷移先 slug（出現順・重複排除）。 */
	outboundLinks: string[];
}

const mdParser = unified().use(remarkParse).use(remarkGfm);
const toHast = unified().use(remarkRehype);
const stringifyHtml = unified().use(rehypeStringify);

/**
 * Markdown 本文を HTML とプレーンテキストに変換する。
 * wikilink 解決は 1 回の mdast パースの中で完結させ（HTML 化とテキスト抽出で二重にリンクを収集しない）、
 * 決定論性を保つため日時・乱数など非決定な入力は使わない。
 */
export function renderMarkdown(
	source: string,
	resolve: WikilinkResolver,
): MarkdownResult {
	const tree = mdParser.parse(source) as Root;
	mdParser.runSync(tree);

	const outboundLinks: string[] = [];
	const seen = new Set<string>();
	applyWikilinks(tree, resolve, (target: WikilinkTarget) => {
		if (!seen.has(target.slug)) {
			seen.add(target.slug);
			outboundLinks.push(target.slug);
		}
	});

	const text = extractPlainText(tree);

	const hastTree = toHast.runSync(tree);
	const html = stringifyHtml.stringify(hastTree).trim();

	return { html, text, outboundLinks };
}

function extractPlainText(tree: Root): string {
	let out = "";
	visit(tree, "text", (node) => {
		out += node.value;
	});
	return out;
}
