import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { scanZone } from "./vault-scan.ts";

const FIXTURE_VAULT = fileURLToPath(
	new URL("../test/fixtures/vault", import.meta.url),
);

describe("scanZone", () => {
	it("指定した公開ゾーン配下の .md だけを relPath 昇順で返す", () => {
		const files = scanZone(FIXTURE_VAULT, "Fleeting");
		const relPaths = files.map((f) => f.relPath);
		expect(relPaths).toEqual([...relPaths].sort());
		expect(relPaths).toContain("narrative-and-reality.md");
		expect(relPaths).toContain("now.md");
	});

	it("サブディレクトリも再帰的に走査する（Permanent/note, Permanent/engineering）", () => {
		const files = scanZone(FIXTURE_VAULT, "Permanent").map((f) => f.relPath);
		expect(files).toContain("engineering/writing-with-fragments.md");
		expect(files).toContain("note/jazz-jackets.md");
	});

	it("存在しない zone フォルダは例外を投げず空配列を返す", () => {
		expect(scanZone(FIXTURE_VAULT, "NoSuchZone")).toEqual([]);
	});
});
