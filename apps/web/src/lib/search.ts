// クライアント側全文検索（design §4.4、spec SC-012、F-SRCH-001）。
// search-index.json（title/summary/topics/本文プレーン）を minisearch でインデックス化する。
// ライブラリ選定は spec 13.3 が実装時の裁量としているため minisearch を採用した。

import type { ArticleLayer, SearchItem } from "@web/types/content";
import MiniSearch from "minisearch";

interface SearchDocument extends SearchItem {
	/** MiniSearch の一意 id。slug をそのまま使う（articles 側の slug は一意）。 */
	id: string;
}

export function buildSearchIndex(
	items: readonly SearchItem[],
): MiniSearch<SearchDocument> {
	const index = new MiniSearch<SearchDocument>({
		idField: "id",
		fields: ["title", "summary", "topics", "text"],
		storeFields: ["slug", "layer"],
		searchOptions: {
			prefix: true,
			fuzzy: 0.2,
			boost: { title: 3, summary: 2, topics: 2 },
		},
	});
	index.addAll(items.map((item) => ({ ...item, id: item.slug })));
	return index;
}

export interface SearchExcerpt {
	before: string;
	/** マッチ箇所（ハイライト対象）。マッチが見つからない場合は空文字。 */
	match: string;
	after: string;
}

export interface SearchResultItem {
	slug: string;
	layer: ArticleLayer;
	title: string;
	summary: string;
	topics: readonly string[];
	excerpt: SearchExcerpt;
}

const EXCERPT_RADIUS = 40;

/**
 * 本文プレーンテキストからクエリ語の周辺を抜粋する（spec 13.2「ハイライト付き抜粋」）。
 * minisearch のトークン一致とは独立に、クエリ文字列そのものの最初の出現箇所を単純検索する
 * （日本語は空白区切りでないため、形態素解析なしでも安定するようトークン一致より単純部分一致を優先した）。
 */
export function buildExcerpt(text: string, query: string): SearchExcerpt {
	const terms = query
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.sort((a, b) => b.length - a.length);
	const lower = text.toLowerCase();

	let matchIndex = -1;
	let matchLength = 0;
	for (const term of terms) {
		const idx = lower.indexOf(term.toLowerCase());
		if (idx !== -1 && (matchIndex === -1 || idx < matchIndex)) {
			matchIndex = idx;
			matchLength = term.length;
		}
	}

	if (matchIndex === -1) {
		const head = text.slice(0, EXCERPT_RADIUS * 2);
		return {
			before: head,
			match: "",
			after: text.length > head.length ? "…" : "",
		};
	}

	const start = Math.max(0, matchIndex - EXCERPT_RADIUS);
	const end = Math.min(text.length, matchIndex + matchLength + EXCERPT_RADIUS);
	return {
		before: (start > 0 ? "…" : "") + text.slice(start, matchIndex),
		match: text.slice(matchIndex, matchIndex + matchLength),
		after:
			text.slice(matchIndex + matchLength, end) +
			(end < text.length ? "…" : ""),
	};
}

/** クエリでインデックスを検索し、抜粋込みの結果を関連度順に返す（空クエリは呼び出し側で扱う）。 */
export function runSearch(
	index: MiniSearch<SearchDocument>,
	items: readonly SearchItem[],
	query: string,
): SearchResultItem[] {
	if (!query.trim()) return [];
	const itemsBySlug = new Map(items.map((item) => [item.slug, item]));
	return index.search(query).flatMap((result) => {
		const item = itemsBySlug.get(String(result.id));
		if (!item) return [];
		return [
			{
				slug: item.slug,
				layer: item.layer,
				title: item.title,
				summary: item.summary,
				topics: item.topics,
				excerpt: buildExcerpt(item.text, query),
			},
		];
	});
}
