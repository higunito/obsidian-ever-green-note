import { describe, expect, it } from "vitest";
import { assignPseudoFilenames, computeBaseName } from "./pseudo-filename.ts";

describe("computeBaseName", () => {
	it("ハイフンを除去し大文字化した先頭 8 文字を返す", () => {
		expect(computeBaseName("narrative-and-reality")).toBe("NARRATIV");
	});

	it("8 文字未満はそのまま返す", () => {
		expect(computeBaseName("jacket")).toBe("JACKET");
	});
});

describe("assignPseudoFilenames", () => {
	it("MOC/essay は .EXE、通常の garden は .DAT になる", () => {
		const result = assignPseudoFilenames([
			{ slug: "narrative-and-reality", extension: ".DAT" },
			{ slug: "path-narrative-inquiry", extension: ".EXE" },
		]);
		expect(result.get("narrative-and-reality")).toBe("NARRATIV.DAT");
		expect(result.get("path-narrative-inquiry")).toBe("PATHNARR.EXE");
	});

	it("basename が衝突したら連番を振る", () => {
		const result = assignPseudoFilenames([
			{ slug: "narrative-aaa", extension: ".DAT" },
			{ slug: "narrative-bbb", extension: ".DAT" },
		]);
		const names = [...result.values()].sort();
		expect(names).toEqual(["NARRATIV.DAT", "NARRATIV2.DAT"]);
	});

	it("入力の順序に依存せず同じ結果になる（決定論性）", () => {
		const targets = [
			{ slug: "b-note", extension: ".DAT" as const },
			{ slug: "a-note", extension: ".DAT" as const },
		];
		const forward = assignPseudoFilenames(targets);
		const backward = assignPseudoFilenames([...targets].reverse());
		expect([...forward.entries()]).toEqual([...backward.entries()]);
	});
});
