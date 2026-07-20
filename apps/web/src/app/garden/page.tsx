import { GardenScreen } from "@web/components/garden";
import { Footer } from "@web/components/system";
import { getContentStore } from "@web/lib/content";
import {
	applyGardenFilters,
	buildGardenIndexHref,
	type GardenSearchParams,
	gardenFilterMatchesNode,
	hasActiveGardenFilter,
	parseGardenFilters,
} from "@web/lib/garden-filters";

interface GardenIndexPageProps {
	searchParams: Promise<GardenSearchParams>;
}

// SC-002 Garden 入口（Index / Map 切替、design §5.4、spec SC-002）＋ SC-003 調査マップ（design §9.3・§9.5、spec SC-003）。
// キーボード操作（十字キー・B ボタン）は `GardenScreen`（クライアント）が一元的に担う（design §9.6.2 v1.18）。
export default async function GardenIndexPage({
	searchParams,
}: GardenIndexPageProps) {
	const sp = await searchParams;
	const view = sp.view === "map" ? "map" : "index";
	const filters = parseGardenFilters(sp);

	const store = getContentStore();
	const [articles, graph] = await Promise.all([
		store.getArticles(),
		store.getGraph(),
	]);
	const gardenArticles = articles.filter((a) => a.layer === "garden");
	const allTopics = Array.from(
		new Set(gardenArticles.flatMap((a) => a.topics)),
	).sort();
	const filtered = applyGardenFilters(gardenArticles, filters).sort((a, b) =>
		b.updated.localeCompare(a.updated),
	);
	const isFiltered = hasActiveGardenFilter(filters);
	const clearFiltersHref = buildGardenIndexHref({
		view,
		filters: { topics: [], statuses: [], period: undefined },
	});
	const visibleMapNodeCount = graph.nodes.filter((n) =>
		gardenFilterMatchesNode(n, filters),
	).length;

	return (
		<>
			<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-5">
				<GardenScreen
					view={view}
					filters={filters}
					allTopics={allTopics}
					clearFiltersHref={clearFiltersHref}
					isFiltered={isFiltered}
					visibleMapNodeCount={visibleMapNodeCount}
					graph={graph}
					gardenArticles={gardenArticles}
					filtered={filtered}
				/>
			</main>
			<Footer />
		</>
	);
}
