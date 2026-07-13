/** Vault 相対パス（zone ルートからの相対）からファイル名（拡張子なし）を取り出す。 */
export function basenameNoExt(relPath: string): string {
	const base = relPath.split("/").pop() ?? relPath;
	return base.replace(/\.md$/i, "");
}

/**
 * 文字列を slug 化する。日本語ノート名（≒ファイル名）もそのまま許容し、
 * 空白・アンダースコアのみハイフンに正規化する（URL エンコードは呼び出し側/ルータの責務）。
 */
export function slugify(input: string): string {
	return input
		.normalize("NFKC")
		.trim()
		.toLowerCase()
		.replace(/[\s_]+/g, "-")
		.replace(/[^\p{L}\p{N}-]+/gu, "")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

/**
 * 候補 slug が既出なら `-2`, `-3`, ... を付けて一意化する（決定論的：呼び出し順に依存）。
 * `used` は呼び出し元で管理し、確定した slug を都度登録すること。
 */
export function uniqueSlug(
	candidate: string,
	used: ReadonlySet<string>,
): string {
	const base = candidate || "note";
	if (!used.has(base)) return base;
	let counter = 2;
	let next = `${base}-${counter}`;
	while (used.has(next)) {
		counter += 1;
		next = `${base}-${counter}`;
	}
	return next;
}
