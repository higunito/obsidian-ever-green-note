// タイトル演出の初回のみ表示制御（design §11.3、spec SC-000 §0.3/§0.6）。
// localStorage キー ta_seen_title の有無だけで判定する。利用不可（プライベートモード等）の
// 場合は毎回スキップ扱い（= 既に見た扱い）にフォールバックし、閲覧を妨げない。

const SEEN_KEY = "ta_seen_title";

function isStorageAvailable(): boolean {
	try {
		const testKey = "__ta_storage_test__";
		window.localStorage.setItem(testKey, "1");
		window.localStorage.removeItem(testKey);
		return true;
	} catch {
		return false;
	}
}

export function hasSeenTitle(): boolean {
	if (typeof window === "undefined" || !isStorageAvailable()) return true;
	return window.localStorage.getItem(SEEN_KEY) === "1";
}

export function markTitleSeen(): void {
	if (typeof window === "undefined" || !isStorageAvailable()) return;
	window.localStorage.setItem(SEEN_KEY, "1");
}

/**
 * Config の「タイトルを見る」（Phase 9, F-NAV-002）が呼ぶ想定のトリガ。
 * 既読キーを消すだけで、次に `/` を表示した際に通常の初回判定と同じ経路で再生される。
 */
export function triggerTitleReplay(): void {
	if (typeof window === "undefined" || !isStorageAvailable()) return;
	window.localStorage.removeItem(SEEN_KEY);
}
