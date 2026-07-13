import { describe, expect, it } from "vitest";
import {
	computeNodeBasePosition,
	computeTopicPositions,
	MAP_CENTER,
	relaxCollisions,
} from "./coordinates.ts";

describe("computeTopicPositions", () => {
	it("中心 (450,300) を中心とした円周上に等間隔で配置する", () => {
		const positions = computeTopicPositions(["音楽", "美学", "物語論", "記憶"]);
		expect(positions.size).toBe(4);
		for (const pos of positions.values()) {
			const dist = Math.hypot(pos.x - MAP_CENTER.x, pos.y - MAP_CENTER.y);
			expect(dist).toBeCloseTo(220, 0);
		}
	});

	it("入力の順序に依存しない（内部で id 昇順にソートする）", () => {
		const a = computeTopicPositions(["音楽", "美学"]);
		const b = computeTopicPositions(["美学", "音楽"]);
		expect(a.get("美学")).toEqual(b.get("美学"));
		expect(a.get("音楽")).toEqual(b.get("音楽"));
	});
});

describe("computeNodeBasePosition", () => {
	it("同じ slug・同じ主 topic 座標なら常に同じ位置になる（決定論性）", () => {
		const topicPos = { x: 555, y: 118 };
		const a = computeNodeBasePosition("narrative-and-reality", topicPos);
		const b = computeNodeBasePosition("narrative-and-reality", topicPos);
		expect(a).toEqual(b);
	});

	it("主 topic が無い場合は中心付近に配置する", () => {
		const pos = computeNodeBasePosition("path-narrative-inquiry", undefined);
		const dist = Math.hypot(pos.x - MAP_CENTER.x, pos.y - MAP_CENTER.y);
		expect(dist).toBeLessThan(150);
	});
});

describe("relaxCollisions", () => {
	it("最小距離未満に重なっている点同士を押し離す", () => {
		const points = [
			{ x: 100, y: 100 },
			{ x: 105, y: 100 },
		];
		relaxCollisions(points);
		const dist = Math.hypot(
			points[1].x - points[0].x,
			points[1].y - points[0].y,
		);
		expect(dist).toBeGreaterThan(30);
	});

	it("十分離れている点は動かさない", () => {
		const points = [
			{ x: 0, y: 0 },
			{ x: 500, y: 500 },
		];
		const before = points.map((p) => ({ ...p }));
		relaxCollisions(points);
		expect(points).toEqual(before);
	});
});
