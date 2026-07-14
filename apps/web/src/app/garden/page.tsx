import { LensFilter } from "@web/components/garden";
import { NoteCard } from "@web/components/notes";
import { Footer, NavBack } from "@web/components/system";
import { getContentStore } from "@web/lib/content";
import {
	applyGardenFilters,
	buildGardenIndexHref,
	type GardenSearchParams,
	hasActiveGardenFilter,
	parseGardenFilters,
} from "@web/lib/garden-filters";
import Link from "next/link";
import { Suspense } from "react";

interface GardenIndexPageProps {
	searchParams: Promise<GardenSearchParams>;
}

function viewTabClass(active: boolean): string {
	return `font-mon text-[10px] tracking-[0.08em] transition-colors ${
		active ? "text-arch-cyan" : "text-arch-muted hover:text-arch-cyan"
	}`;
}

// SC-002 Garden 入口（Index / Map 切替、design §5.4、spec SC-002）。
// Map View の実体化は Phase 7（本 Phase では ?view=map はプレースホルダー表示）。
export default async function GardenIndexPage({
	searchParams,
}: GardenIndexPageProps) {
	const sp = await searchParams;
	const view = sp.view === "map" ? "map" : "index";
	const filters = parseGardenFilters(sp);

	const store = getContentStore();
	const articles = await store.getArticles();
	const gardenArticles = articles.filter((a) => a.layer === "garden");
	const allTopics = Array.from(
		new Set(gardenArticles.flatMap((a) => a.topics)),
	).sort();
	const filtered = applyGardenFilters(gardenArticles, filters).sort((a, b) =>
		b.updated.localeCompare(a.updated),
	);
	const isFiltered = hasActiveGardenFilter(filters);

	return (
		<>
			<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-5">
				<div className="flex flex-wrap items-center gap-3">
					<NavBack label="◀ HOME" href="/" />
					<h1 className="font-dot text-sm text-arch-text">
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

				<Suspense fallback={null}>
					<LensFilter topics={allTopics} />
				</Suspense>

				{view === "map" ? (
					<p className="p-8 text-center font-min text-[13px] text-arch-muted">
						MAP は Phase 7 で実装します。
					</p>
				) : filtered.length === 0 ? (
					<div className="p-8 text-center font-min text-[13px] text-arch-muted">
						<p>該当する記録がありません</p>
						{isFiltered ? (
							<Link
								href="/garden"
								className="mt-2 inline-block font-mon text-[10px] text-arch-cyan underline"
							>
								フィルタを解除
							</Link>
						) : null}
					</div>
				) : (
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{filtered.map((note) => (
							<NoteCard key={note.slug} note={note} />
						))}
					</div>
				)}
			</main>
			<Footer />
		</>
	);
}
