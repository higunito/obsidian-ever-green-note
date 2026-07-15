// 表示設定（design §11.2 / §12.2、spec SC-013、F-CFG-001）。localStorage に保存し即時反映する。
// 「（任意）本文フォントサイズ、行間」（spec 14.2）は spec/plan とも任意注記のため v1 では実装しない。

const REDUCED_MOTION_KEY = "ta_reduced_motion";
const REDUCED_MOTION_ATTR = "data-reduced-motion";

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

/** 保存済みの「アニメーション低減」設定。未設定（=OS 設定に従う）なら `undefined`。 */
export function getReducedMotionPreference(): boolean | undefined {
	if (typeof window === "undefined" || !isStorageAvailable()) return undefined;
	const raw = window.localStorage.getItem(REDUCED_MOTION_KEY);
	if (raw === "true") return true;
	if (raw === "false") return false;
	return undefined;
}

/** `<html data-reduced-motion>` に反映する（globals.css がこの属性を見て雨・点滅を止める）。 */
export function applyReducedMotionAttribute(value: boolean | undefined): void {
	if (typeof document === "undefined") return;
	if (value === true) {
		document.documentElement.setAttribute(REDUCED_MOTION_ATTR, "true");
	} else {
		document.documentElement.removeAttribute(REDUCED_MOTION_ATTR);
	}
}

/** 設定を保存しつつ即時反映する（利用不可時は反映のみ行い、次回訪問時は既定値に戻る）。 */
export function setReducedMotionPreference(value: boolean): void {
	if (typeof window !== "undefined" && isStorageAvailable()) {
		window.localStorage.setItem(REDUCED_MOTION_KEY, String(value));
	}
	applyReducedMotionAttribute(value);
}
