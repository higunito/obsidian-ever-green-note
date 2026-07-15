import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { PageContent } from "content-schema";
import matter from "gray-matter";
import {
	normalizeDateOnly,
	toBoolean,
	toStringArray,
} from "./frontmatter-utils.ts";
import { renderMarkdown } from "./markdown.ts";
import type { WikilinkResolver } from "./wikilink.ts";

const EMPTY_PAGE: PageContent = { updated: "", bodyHtml: "", topics: [] };

/**
 * About は `Fleeting/about.md`（publish:true）から生成する（design §4.6）。
 * 未整備（ファイル無し・publish:false）の場合は空のページ内容にする。
 */
function loadPage(
	vaultDir: string,
	fileName: string,
	resolve: WikilinkResolver,
): PageContent {
	const absPath = join(vaultDir, "Fleeting", fileName);
	if (!existsSync(absPath)) return EMPTY_PAGE;

	const raw = readFileSync(absPath, "utf8");
	const { data, content } = matter(raw);
	if (!toBoolean(data.publish)) return EMPTY_PAGE;

	const { html } = renderMarkdown(content, resolve);
	return {
		updated: normalizeDateOnly(data.updated),
		bodyHtml: html,
		topics: toStringArray(data.topics),
	};
}

export function loadPages(
	vaultDir: string,
	resolve: WikilinkResolver,
): { about: PageContent } {
	return {
		about: loadPage(vaultDir, "about.md", resolve),
	};
}
