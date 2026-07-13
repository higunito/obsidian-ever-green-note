import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { generateContent } from "./build.ts";

const FIXTURE_VAULT = fileURLToPath(
	new URL("../test/fixtures/vault", import.meta.url),
);
const REFERENCE_VAULT = fileURLToPath(
	new URL("../../../reference/obsidian", import.meta.url),
);

/**
 * 同一 Vault に対して generateContent() を複数回実行しても、バイト単位で同じ JSON になることを保証する。
 * 日時・乱数・Map/Set のイテレーション順など非決定要素が紛れ込んでいないかの回帰検知。
 */
describe("generateContent の決定論性", () => {
	it("fixture vault：2 回実行しても出力が完全に一致する", () => {
		const first = generateContent(FIXTURE_VAULT);
		const second = generateContent(FIXTURE_VAULT);
		expect(JSON.stringify(second)).toBe(JSON.stringify(first));
	});

	it("reference/obsidian：2 回実行しても出力が完全に一致する", () => {
		const first = generateContent(REFERENCE_VAULT);
		const second = generateContent(REFERENCE_VAULT);
		expect(JSON.stringify(second)).toBe(JSON.stringify(first));
	});
});
