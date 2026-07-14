import {
	type BacklinkEntry,
	type LocalMapNeighbor,
	type StackColumn,
	type StackFileEntry,
	StackNavigationProvider,
	StackView,
} from "@web/components/garden";
import { getContentStore } from "@web/lib/content";
import { parseStackState } from "@web/lib/stack";
import type { Article, Graph } from "@web/types/content";
import { notFound } from "next/navigation";

interface GardenDetailPageProps {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ stack?: string }>;
}

function getLocalMapNeighbors(slug: string, graph: Graph): LocalMapNeighbor[] {
	const neighborIds = new Set<string>();
	for (const edge of graph.edges) {
		if (edge.kind !== "note") continue;
		if (edge.source === slug) neighborIds.add(edge.target);
		if (edge.target === slug) neighborIds.add(edge.source);
	}
	return graph.nodes
		.filter((n) => neighborIds.has(n.id))
		.map((n) => ({ slug: n.id, file: n.file, title: n.title }));
}

// SC-004 Garden ノート詳細（Stack View、design §5.2、spec SC-004）。
export default async function GardenDetailPage({
	params,
	searchParams,
}: GardenDetailPageProps) {
	const { slug } = await params;
	const { stack: stackParam } = await searchParams;

	const store = getContentStore();
	const [articles, graph] = await Promise.all([
		store.getArticles(),
		store.getGraph(),
	]);

	const articlesBySlug = new Map<string, Article>(
		articles.map((a) => [a.slug, a]),
	);
	const current = articlesBySlug.get(slug);
	if (current?.layer !== "garden") notFound();

	const gardenSlugs = new Set(
		articles.filter((a) => a.layer === "garden").map((a) => a.slug),
	);
	const fileBySlug = new Map(graph.nodes.map((n) => [n.id, n.file]));

	const state = parseStackState(slug, stackParam, gardenSlugs);

	const spineEntries: StackFileEntry[] = state.spine.map((s) => {
		const a = articlesBySlug.get(s);
		return {
			slug: s,
			file: fileBySlug.get(s) ?? "UNKNOWN.DAT",
			title: a?.title ?? s,
		};
	});

	const columns: StackColumn[] = state.stack.map((s) => {
		// gardenSlugs で検証済みの stack のみから来るため articlesBySlug に必ず存在する。
		const article = articlesBySlug.get(s) as Article;
		const backlinks: BacklinkEntry[] = article.backlinks.flatMap((bl) => {
			const target = articlesBySlug.get(bl);
			return target
				? [{ slug: bl, title: target.title, layer: target.layer }]
				: [];
		});
		return {
			article,
			file: fileBySlug.get(s) ?? "UNKNOWN.DAT",
			backlinks,
			localMapNeighbors: getLocalMapNeighbors(s, graph),
		};
	});

	return (
		<StackNavigationProvider state={state} articles={articles}>
			<StackView state={state} spineEntries={spineEntries} columns={columns} />
		</StackNavigationProvider>
	);
}
