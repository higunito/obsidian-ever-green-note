// Garden の Lens フィルタ（design §5.4、spec SC-002 §2.3）。topic/status は OR、更新時期は期間指定。
// 選択状態は URL クエリ（`?topic=&status=&period=`）に保持し、Index/Map で共通適用する（design §11.1）。

import type { Article, GraphNode, NoteStatus } from "@web/types/content";

export type GardenPeriod = "7d" | "30d" | "90d";

// design/spec は「更新時期：期間指定」とだけ定め、粒度は実装時に決定（このプリセットが唯一の情報源）。
export const GARDEN_PERIOD_OPTIONS: readonly {
	value: GardenPeriod;
	label: string;
}[] = [
	{ value: "7d", label: "1週間以内" },
	{ value: "30d", label: "1ヶ月以内" },
	{ value: "90d", label: "3ヶ月以内" },
];

export const GARDEN_STATUS_OPTIONS: readonly NoteStatus[] = [
	"seed",
	"growing",
	"evergreen",
];

export interface GardenFilters {
	topics: readonly string[];
	statuses: readonly NoteStatus[];
	period?: GardenPeriod;
}

const STATUS_VALUES = new Set<string>(GARDEN_STATUS_OPTIONS);
const PERIOD_VALUES = new Set<string>(
	GARDEN_PERIOD_OPTIONS.map((o) => o.value),
);

export interface GardenSearchParams {
	view?: string;
	topic?: string;
	status?: string;
	period?: string;
}

export function parseGardenFilters(
	searchParams: GardenSearchParams,
): GardenFilters {
	const topics = (searchParams.topic ?? "")
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
	const statuses = (searchParams.status ?? "")
		.split(",")
		.map((s) => s.trim())
		.filter((s): s is NoteStatus => STATUS_VALUES.has(s));
	const period = PERIOD_VALUES.has(searchParams.period ?? "")
		? (searchParams.period as GardenPeriod)
		: undefined;
	return { topics, statuses, period };
}

export function hasActiveGardenFilter(filters: GardenFilters): boolean {
	return (
		filters.topics.length > 0 || filters.statuses.length > 0 || !!filters.period
	);
}

function periodCutoff(period: GardenPeriod, now: Date): Date {
	const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
	const cutoff = new Date(now);
	cutoff.setDate(cutoff.getDate() - days);
	return cutoff;
}

/**
 * Map（graph.json）のノードに Lens フィルタを適用する（spec SC-003 §3.4）。
 * GraphNode は `updated` を持たないため、period フィルタは対象外（topic/status のみで判定）。
 */
export function gardenFilterMatchesNode(
	node: Pick<GraphNode, "topics" | "status">,
	filters: GardenFilters,
): boolean {
	if (
		filters.topics.length > 0 &&
		!node.topics.some((t) => filters.topics.includes(t))
	)
		return false;
	if (
		filters.statuses.length > 0 &&
		(!node.status || !filters.statuses.includes(node.status))
	)
		return false;
	return true;
}

/** Lens フィルタを OR/期間条件で適用する（design §5.4）。並び順は呼び出し側の責務。 */
export function applyGardenFilters(
	articles: readonly Article[],
	filters: GardenFilters,
	now: Date = new Date(),
): Article[] {
	const cutoff = filters.period ? periodCutoff(filters.period, now) : undefined;
	return articles.filter((a) => {
		if (
			filters.topics.length > 0 &&
			!a.topics.some((t) => filters.topics.includes(t))
		)
			return false;
		if (
			filters.statuses.length > 0 &&
			(!a.status || !filters.statuses.includes(a.status))
		)
			return false;
		if (cutoff && new Date(a.updated) < cutoff) return false;
		return true;
	});
}

/** `/garden` へのリンクを、指定した view と現在のフィルタを保ったまま組み立てる（View 切替用）。 */
export function buildGardenIndexHref(params: {
	view: "index" | "map";
	filters: GardenFilters;
}): string {
	const qs = new URLSearchParams();
	if (params.view === "map") qs.set("view", "map");
	if (params.filters.topics.length > 0)
		qs.set("topic", params.filters.topics.join(","));
	if (params.filters.statuses.length > 0)
		qs.set("status", params.filters.statuses.join(","));
	if (params.filters.period) qs.set("period", params.filters.period);
	const query = qs.toString();
	return query ? `/garden?${query}` : "/garden";
}
