"use client";

import { NoteCard } from "@web/components/notes";
import { Nav, NavBack, SpatialNavRegion } from "@web/components/system";
import type { GardenFilters } from "@web/lib/garden-filters";
import { buildGardenIndexHref } from "@web/lib/garden-filters";
import { useBackButton } from "@web/lib/use-back-button";
import type { Article, Graph } from "@web/types/content";
import Link from "next/link";
import { Suspense, useCallback, useState } from "react";
import { InvestigationMap, type PendingNavigation } from "./InvestigationMap";
import { LensFilter } from "./LensFilter";

function EmptyState({ clearHref }: { clearHref?: string }) {
	return (
		<div className="p-8 text-center font-min text-[calc(13px*var(--font-scale))] text-arch-muted">
			<p>該当する記録がありません</p>
			{clearHref ? (
				<Link
					href={clearHref}
					className="mt-2 inline-block font-mon text-[calc(10px*var(--font-scale))] text-arch-cyan underline"
				>
					フィルタを解除
				</Link>
			) : null}
		</div>
	);
}

function viewTabClass(active: boolean): string {
	return `font-mon text-[calc(10px*var(--font-scale))] tracking-[0.08em] transition-colors ${
		active ? "text-arch-cyan" : "text-arch-muted hover:text-arch-cyan"
	}`;
}

interface GardenScreenProps {
	view: "index" | "map";
	filters: GardenFilters;
	allTopics: readonly string[];
	clearFiltersHref: string;
	isFiltered: boolean;
	visibleMapNodeCount: number;
	graph: Graph;
	/** InvestigationMap のツールチップ summary 表示用。 */
	gardenArticles: readonly Article[];
	/** Index View 用（フィルタ適用・ソート済み）。 */
	filtered: readonly Article[];
}

/**
 * SC-002/SC-003 Garden 画面のインタラクティブ部分（design §9.6.2 v1.18）。
 * ヘッダー（`Nav`/`NavBack`/View 切替）・Lens フィルタ・Index グリッド／`InvestigationMap` を
 * まとめて 1 つの `SpatialNavRegion` に収め、Map 表示中でも上下キーで外側へ到達できるようにする
 * （以前は Map 用に別領域を持ち、外側が無効化されていたため到達できなかった）。
 * 遷移確認モーダルの開閉状態はここで保持し、モーダル表示中だけこの領域を無効化する
 * （`InvestigationMap` 側は完全な制御下のコンポーネントにする）。
 */
export function GardenScreen({
	view,
	filters,
	allTopics,
	clearFiltersHref,
	isFiltered,
	visibleMapNodeCount,
	graph,
	gardenArticles,
	filtered,
}: GardenScreenProps) {
	const [pendingNav, setPendingNav] = useState<PendingNavigation | null>(null);

	// B ボタン（design §9.6.3）：モーダル表示中はまずモーダルを閉じる。閉じていれば既定の SC-001 へ。
	const closeModalBeforeBack = useCallback(() => {
		if (pendingNav === null) return false;
		setPendingNav(null);
		return true;
	}, [pendingNav]);
	useBackButton("/home", { onBeforeBack: closeModalBeforeBack });

	return (
		<SpatialNavRegion
			className="flex flex-1 flex-col gap-4"
			enabled={!(view === "map" && pendingNav !== null)}
		>
			<div className="flex flex-wrap items-center gap-3">
				<NavBack label="◀ HOME" href="/home" />
				<h1 className="font-dot text-arch-sm text-arch-text">
					FRAGMENTS / Garden
				</h1>
				<div className="ml-auto flex gap-3">
					<Link
						href={buildGardenIndexHref({ view: "index", filters })}
						className={viewTabClass(view === "index")}
					>
						INDEX
					</Link>
					<Link
						href={buildGardenIndexHref({ view: "map", filters })}
						className={viewTabClass(view === "map")}
					>
						MAP
					</Link>
				</div>
			</div>
			<Nav />

			<Suspense fallback={null}>
				<LensFilter topics={allTopics} />
			</Suspense>

			{view === "map" ? (
				visibleMapNodeCount === 0 ? (
					<EmptyState clearHref={isFiltered ? clearFiltersHref : undefined} />
				) : (
					<InvestigationMap
						graph={graph}
						articles={gardenArticles}
						filters={filters}
						pendingNav={pendingNav}
						setPendingNav={setPendingNav}
					/>
				)
			) : filtered.length === 0 ? (
				<EmptyState clearHref={isFiltered ? clearFiltersHref : undefined} />
			) : (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{filtered.map((note, i) => (
						<NoteCard key={note.slug} note={note} defaultFocus={i === 0} />
					))}
				</div>
			)}
		</SpatialNavRegion>
	);
}
