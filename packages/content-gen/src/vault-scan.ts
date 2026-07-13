import type { Dirent } from "node:fs";
import { readdirSync } from "node:fs";
import { join } from "node:path";

export interface FoundFile {
	/** 絶対パス */
	absPath: string;
	/** zone ルート（例: `<vault>/Fleeting`）からの相対パス。posix 区切り。 */
	relPath: string;
}

/**
 * Vault 内の 1 公開ゾーン（Fleeting / Permanent / Collections）だけを走査する。
 * 非公開ゾーン（Memo/Daily/Literature 等）は呼び出し側が指定しない限り一切 readdir しない
 * （project.md「非公開ゾーンは仕組み上サイトに出さない」を走査レベルで担保する）。
 */
export function scanZone(vaultDir: string, zone: string): FoundFile[] {
	const zoneDir = join(vaultDir, zone);
	const out: FoundFile[] = [];
	walk(zoneDir, "", out);
	// ディレクトリ横断で結合されるため、最終的な順序を relPath で再ソートし決定論性を保証する。
	out.sort((a, b) =>
		a.relPath < b.relPath ? -1 : a.relPath > b.relPath ? 1 : 0,
	);
	return out;
}

function walk(absDir: string, relDir: string, out: FoundFile[]): void {
	let entries: Dirent<string>[];
	try {
		entries = readdirSync(absDir, { withFileTypes: true });
	} catch {
		// zone フォルダ自体が存在しない Vault（例: 参照用スナップショットに Fleeting/ が無い）を許容する。
		return;
	}
	const sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name));
	for (const entry of sorted) {
		const absPath = join(absDir, entry.name);
		const relPath = relDir ? `${relDir}/${entry.name}` : entry.name;
		if (entry.isDirectory()) {
			walk(absPath, relPath, out);
			continue;
		}
		if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
			out.push({ absPath, relPath });
		}
	}
}
