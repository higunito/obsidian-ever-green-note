import type { DoorItem } from "@web/components/doors";
import type { Article } from "@web/types/content";

// Three Doors 選定アルゴリズム（design §5.5）。
// 母集団：publish 済み Garden ノートのうち growing/evergreen（seed は母集団が尽きたときのみ許可）。
// トピック単位で重複しないよう 3 件を選び、各トピックの代表ノートは backlink 数→updated の新しさで決める。

const DOOR_COUNT = 3;

interface DoorCandidate {
	slug: string;
	title: string;
	topics: readonly string[];
	backlinkCount: number;
	updated: string;
}

function toCandidates(articles: readonly Article[]): DoorCandidate[] {
	const gardenArticles = articles.filter((a) => a.layer === "garden");
	const grown = gardenArticles.filter((a) => a.status !== "seed");
	const population = grown.length > 0 ? grown : gardenArticles;
	return population.map((a) => ({
		slug: a.slug,
		title: a.title,
		topics: a.topics,
		backlinkCount: a.backlinks.length,
		updated: a.updated,
	}));
}

function pickRepresentative(
	candidates: readonly DoorCandidate[],
): DoorCandidate | undefined {
	return [...candidates].sort((a, b) => {
		if (b.backlinkCount !== a.backlinkCount)
			return b.backlinkCount - a.backlinkCount;
		return b.updated.localeCompare(a.updated);
	})[0];
}

function shuffle<T>(items: T[], random: () => number): void {
	for (let i = items.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		const tmp = items[i];
		items[i] = items[j];
		items[j] = tmp;
	}
}

/**
 * 3 つの入口を選ぶ（design §5.5）。`random` は 0 以上 1 未満の一様乱数を返す関数を渡す
 * （SSR では {@link seededRandom} による日替わりシード、クライアントの引き直しでは `Math.random`）。
 * `excludeSlugs` は直近表示した slug（design §5.5 手順4、呼び出し側がセッション/クッキーで保持）。
 */
export function selectThreeDoors(
	articles: readonly Article[],
	random: () => number,
	excludeSlugs: readonly string[] = [],
): DoorItem[] {
	const all = toCandidates(articles);
	const filtered = all.filter((c) => !excludeSlugs.includes(c.slug));
	// 除外しすぎて母集団が尽きたら、直近除外を諦めて全体から選び直す。
	const pool = filtered.length > 0 ? filtered : all;

	const topics = Array.from(new Set(pool.flatMap((c) => c.topics)));
	shuffle(topics, random);

	const doors: DoorItem[] = [];
	const usedSlugs = new Set<string>();
	for (const topic of topics) {
		if (doors.length >= DOOR_COUNT) break;
		const topicCandidates = pool.filter(
			(c) => c.topics.includes(topic) && !usedSlugs.has(c.slug),
		);
		const rep = pickRepresentative(topicCandidates);
		if (!rep) continue;
		usedSlugs.add(rep.slug);
		doors.push({
			topic,
			slug: rep.slug,
			layer: "garden",
			noteTitle: rep.title,
		});
	}
	return doors;
}

/** SSR 用の日替わりシード（JST ではなく UTC 日付だが、日替わりの用途としては十分）。 */
export function dailySeed(date: Date = new Date()): string {
	return date.toISOString().slice(0, 10);
}

/**
 * 文字列シードから決定論的な乱数生成器を作る（mulberry32 系）。
 * 外部乱数ライブラリを使わず、SSR で同一日なら同一結果を再現するためだけに使う。
 */
export function seededRandom(seed: string): () => number {
	let h = 1779033703 ^ seed.length;
	for (let i = 0; i < seed.length; i++) {
		h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
		h = (h << 13) | (h >>> 19);
	}
	return () => {
		h = Math.imul(h ^ (h >>> 16), 2246822519);
		h = Math.imul(h ^ (h >>> 13), 3266489917);
		h ^= h >>> 16;
		return (h >>> 0) / 4294967296;
	};
}
