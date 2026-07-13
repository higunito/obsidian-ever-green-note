/**
 * 決定論的な文字列ハッシュ（FNV-1a, 32bit）。
 * 座標計算・擬似ファイル名生成など、実行のたびに値が変わってはいけない箇所でのみ使う。
 */
export function fnv1a(input: string): number {
	let hash = 0x811c9dc5;
	for (let i = 0; i < input.length; i++) {
		hash ^= input.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return hash >>> 0;
}
