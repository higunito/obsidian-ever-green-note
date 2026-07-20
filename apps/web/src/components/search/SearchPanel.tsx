"use client";

import { Tag } from "@web/components/notes";
import { buildSearchIndex, runSearch } from "@web/lib/search";
import { useFlashNavigate } from "@web/lib/use-flash-navigate";
import { internalHref } from "@web/lib/wikilink";
import type { SearchItem } from "@web/types/content";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface SearchPanelProps {
	items: readonly SearchItem[];
	initialQuery: string;
}

const POPULAR_TOPIC_LIMIT = 8;

function popularTopics(items: readonly SearchItem[]): string[] {
	const counts = new Map<string, number>();
	for (const item of items) {
		for (const topic of item.topics) {
			counts.set(topic, (counts.get(topic) ?? 0) + 1);
		}
	}
	return Array.from(counts.entries())
		.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
		.slice(0, POPULAR_TOPIC_LIMIT)
		.map(([topic]) => topic);
}

function layerLabel(layer: SearchItem["layer"]): string {
	return layer === "essay" ? "ARTICLE" : "FRAGMENTS";
}

/**
 * SC-010 Search 本体（design §4.4、spec SC-010、F-SRCH-001）。
 * search-index.json をクライアント側で minisearch により検索する（サーバー通信なし）。
 * `?q=` は History API で直接書き換え、Next のナビゲーションを経由しない（サーバー再フェッチを
 * 避け、search-index.json の読み込みをこのページ訪問時の 1 回だけに保つ、design §12.1）。
 */
export function SearchPanel({ items, initialQuery }: SearchPanelProps) {
	const [query, setQuery] = useState(initialQuery);
	const index = useMemo(() => buildSearchIndex(items), [items]);
	const topics = useMemo(() => popularTopics(items), [items]);
	const results = useMemo(
		() => runSearch(index, items, query),
		[index, items, query],
	);
	const { flashingKey, navigate } = useFlashNavigate();

	useEffect(() => {
		const url = query ? `/search?q=${encodeURIComponent(query)}` : "/search";
		window.history.replaceState(null, "", url);
	}, [query]);

	return (
		// 十字キーの対象（親の SpatialNavRegion に含まれる。spec SC-010 §10.4）：検索結果一覧・
		// 人気トピック。入力欄フォーカス中は矢印キーの横取りをしない（design §9.6.2）。
		<div className="flex flex-col gap-4">
			<label className="flex items-center gap-2 border border-arch-border bg-arch-panel px-3 py-2 font-mon text-sm text-arch-text focus-within:border-arch-cyan">
				<span className="text-arch-cyan">SEARCH &gt;_</span>
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="キーワードを入力"
					// biome-ignore lint/a11y/noAutofocus: 検索専用ページの主要な入力欄のため自動フォーカスする
					autoFocus
					data-roving-default="true"
					className="flex-1 bg-transparent font-mon text-sm text-arch-text outline-none placeholder:text-arch-muted"
				/>
			</label>

			{query.trim() === "" ? (
				<div className="flex flex-col gap-2">
					<p className="font-min text-[13px] text-arch-muted">
						title / summary / topics / 本文から検索します。
					</p>
					{topics.length > 0 ? (
						<div className="flex flex-wrap items-center gap-1.5">
							<span className="font-mon text-[9px] text-arch-muted">
								人気トピック:
							</span>
							{topics.map((topic) => (
								<button
									key={topic}
									type="button"
									onClick={() => setQuery(topic)}
									className="border border-arch-border-faint bg-arch-cyan-faint px-[5px] py-px font-dot text-[10px] text-arch-muted transition-colors hover:text-arch-cyan"
								>
									{topic}
								</button>
							))}
						</div>
					) : null}
				</div>
			) : results.length === 0 ? (
				<p className="p-8 text-center font-min text-[13px] text-arch-muted">
					該当する記録が見つかりません
				</p>
			) : (
				<ul className="flex flex-col gap-3">
					{results.map((result) => {
						const href = internalHref({
							slug: result.slug,
							layer: result.layer,
						});
						const flashing = flashingKey === href;
						return (
							<li key={result.slug}>
								<Link
									href={href}
									onClick={(e) => {
										e.preventDefault();
										navigate(href, href);
									}}
									className={`block border border-arch-border bg-[rgba(11,26,43,0.7)] p-3 transition-all hover:border-arch-cyan hover:bg-[rgba(20,50,58,0.95)] ${flashing ? "arch-animated" : ""}`}
									style={{
										animation: flashing ? "navFlash 0.3s steps(1) 1" : "none",
									}}
								>
									<div className="mb-1.5 flex items-center gap-2">
										<span className="border border-arch-border-faint px-1 py-px font-mon text-[9px] text-arch-muted">
											{layerLabel(result.layer)}
										</span>
										<span className="font-dot text-xs text-arch-text">
											{result.title}
										</span>
									</div>
									<p className="mb-2 font-min text-[12px] leading-relaxed text-arch-muted">
										{result.excerpt.before}
										{result.excerpt.match ? (
											<mark className="bg-arch-cyan-faint text-arch-cyan">
												{result.excerpt.match}
											</mark>
										) : null}
										{result.excerpt.after}
									</p>
									<div className="flex flex-wrap gap-1">
										{result.topics.map((topic) => (
											<Tag key={topic} label={topic} />
										))}
									</div>
								</Link>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
