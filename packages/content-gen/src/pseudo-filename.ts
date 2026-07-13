/**
 * 擬似ファイル名（design §9.4）の生成規則。
 * - slug をアルファベット以外も含め英数字だけに絞り、大文字化した先頭 8 文字を basename とする。
 * - 拡張子：essay または MOC（tags に `moc`）は `.EXE`、通常の Garden ノートは `.DAT`。
 * - 衝突時は basename の末尾に連番を足す（2, 3, ...）。
 */
export type PseudoExtension = ".EXE" | ".DAT";

export interface PseudoFileTarget {
	slug: string;
	extension: PseudoExtension;
}

const MAX_BASENAME_LENGTH = 8;

export function computeBaseName(slug: string): string {
	const alnum = slug.normalize("NFKC").replace(/[^\p{L}\p{N}]+/gu, "");
	const upper = alnum.toUpperCase();
	return upper.slice(0, MAX_BASENAME_LENGTH) || "NOTE";
}

/**
 * 対象一覧から slug → 擬似ファイル名 の対応表を決定論的に組み立てる。
 * 入力の並び順に依存させないため、内部で slug 昇順にソートしてから割り当てる。
 */
export function assignPseudoFilenames(
	targets: readonly PseudoFileTarget[],
): Map<string, string> {
	const used = new Set<string>();
	const result = new Map<string, string>();
	const sorted = [...targets].sort((a, b) =>
		a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0,
	);

	for (const { slug, extension } of sorted) {
		const base = computeBaseName(slug);
		let candidate = `${base}${extension}`;
		let counter = 2;
		while (used.has(candidate)) {
			candidate = `${base}${counter}${extension}`;
			counter += 1;
		}
		used.add(candidate);
		result.set(slug, candidate);
	}

	return result;
}
