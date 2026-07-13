import { fnv1a } from "./hash.ts";

export interface Point {
	x: number;
	y: number;
}

/** design §9.5 で固定する中心座標。 */
export const MAP_CENTER: Point = { x: 450, y: 300 };

/** topic 円周配置の半径。figma-make プロトタイプの TOPIC_POS 実測値（中心からの距離 ≈210px）に近い値を採用。 */
const TOPIC_RADIUS = 220;

/** ノートを主 topic 周辺に置く際の距離レンジ（ノート同士が topic ノードに重ならない程度）。 */
const NODE_MIN_DISTANCE = 40;
const NODE_MAX_DISTANCE = 110;

/** 簡易衝突緩和で確保する最小ノード間距離。 */
const MIN_NODE_SEPARATION = 34;
const RELAXATION_ITERATIONS = 4;

/**
 * 全 topics を円周上に等間隔配置する（design §9.5 手順 1）。
 * 入力順に依存させないよう topic id 昇順にソートしてから角度を割り当てる。
 */
export function computeTopicPositions(
	topicIds: readonly string[],
): Map<string, Point> {
	const sorted = [...topicIds].sort();
	const positions = new Map<string, Point>();
	sorted.forEach((id, index) => {
		const angle = (index / sorted.length) * Math.PI * 2;
		positions.set(id, {
			x: MAP_CENTER.x + TOPIC_RADIUS * Math.cos(angle),
			y: MAP_CENTER.y + TOPIC_RADIUS * Math.sin(angle),
		});
	});
	return positions;
}

/**
 * ノートを主 topic（topics[0]）周辺に決定論的オフセットで配置する（design §9.5 手順 2）。
 * 主 topic が無い（MOC 等）場合は中心付近に配置する。
 * オフセットは slug のハッシュから角度・距離を導出するため、実行順やタイミングに依存しない。
 */
export function computeNodeBasePosition(
	slug: string,
	primaryTopicPos: Point | undefined,
): Point {
	const base = primaryTopicPos ?? MAP_CENTER;
	const angle = (fnv1a(`${slug}:angle`) % 360) * (Math.PI / 180);
	const distanceRange = NODE_MAX_DISTANCE - NODE_MIN_DISTANCE;
	const distance =
		NODE_MIN_DISTANCE + (fnv1a(`${slug}:distance`) % distanceRange);
	return {
		x: base.x + distance * Math.cos(angle),
		y: base.y + distance * Math.sin(angle),
	};
}

/**
 * 近接するノードを互いに押し離す簡易反発緩和（design §9.5「近接衝突は簡易反発で緩和」）。
 * `points` を破壊的に更新する。入力配列の並び順は呼び出し側で決定論的に固定しておくこと（slug 昇順を想定）。
 */
export function relaxCollisions(points: Point[]): void {
	for (let iteration = 0; iteration < RELAXATION_ITERATIONS; iteration++) {
		for (let i = 0; i < points.length; i++) {
			for (let j = i + 1; j < points.length; j++) {
				const a = points[i];
				const b = points[j];
				const dx = b.x - a.x;
				const dy = b.y - a.y;
				const dist = Math.hypot(dx, dy) || 0.0001;
				if (dist >= MIN_NODE_SEPARATION) continue;
				const push = (MIN_NODE_SEPARATION - dist) / 2;
				const ux = dx / dist;
				const uy = dy / dist;
				a.x -= ux * push;
				a.y -= uy * push;
				b.x += ux * push;
				b.y += uy * push;
			}
		}
	}
}

export function round(point: Point): Point {
	return { x: Math.round(point.x), y: Math.round(point.y) };
}
