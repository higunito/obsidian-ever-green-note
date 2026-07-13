import { describe, expect, it } from "vitest";
import { fnv1a } from "./hash.ts";

describe("fnv1a", () => {
	it("同じ入力に対して常に同じ値を返す（決定論性）", () => {
		expect(fnv1a("narrative-and-reality")).toBe(fnv1a("narrative-and-reality"));
	});

	it("異なる入力に対して異なる値を返す（衝突しにくい）", () => {
		expect(fnv1a("a")).not.toBe(fnv1a("b"));
	});

	it("非負の 32bit 整数を返す", () => {
		const value = fnv1a("path-narrative-inquiry");
		expect(Number.isInteger(value)).toBe(true);
		expect(value).toBeGreaterThanOrEqual(0);
		expect(value).toBeLessThanOrEqual(0xffffffff);
	});
});
