import type { NoteStatus } from "content-schema";

/**
 * frontmatter の値（unknown）を string[] に正規化する。
 * YAML の `topics:`（空リスト）は null になり、単一値は string になりうるため両方を吸収する。
 */
export function toStringArray(value: unknown): string[] {
	if (value == null) return [];
	if (Array.isArray(value)) {
		return value
			.filter((v): v is string => typeof v === "string" && v.trim() !== "")
			.map((v) => v.trim());
	}
	if (typeof value === "string" && value.trim() !== "") return [value.trim()];
	return [];
}

export function stringOrUndefined(value: unknown): string | undefined {
	if (typeof value === "string" && value.trim() !== "") return value.trim();
	return undefined;
}

/**
 * frontmatter の `date`/`updated` を YYYY-MM-DD に正規化する。
 * 引用符なしの日時（例: `date: 2026-06-13 21:19`）は js-yaml の timestamp 型解決により
 * Date インスタンスとして渡ってくるため、Date/string の両方を受け付ける。
 * Date は toISOString()（常に UTC）から日付部分のみ切り出すため、実行環境のタイムゾーンに依存しない。
 */
export function normalizeDateOnly(value: unknown): string {
	if (value instanceof Date) {
		return value.toISOString().slice(0, 10);
	}
	if (typeof value === "string") {
		const trimmed = value.trim();
		const match = trimmed.match(/^\d{4}-\d{2}-\d{2}/);
		return match ? match[0] : trimmed;
	}
	return "";
}

const NOTE_STATUSES: readonly NoteStatus[] = ["seed", "growing", "evergreen"];

export function toNoteStatus(value: unknown): NoteStatus | undefined {
	return NOTE_STATUSES.includes(value as NoteStatus)
		? (value as NoteStatus)
		: undefined;
}

export function toBoolean(value: unknown): boolean {
	return value === true;
}
