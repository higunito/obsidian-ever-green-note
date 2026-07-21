// 表示設定（design §11.2 / §12.2、spec SC-011、F-CFG-001）。localStorage に保存し即時反映する。

const REDUCED_MOTION_KEY = "ta_reduced_motion";
const REDUCED_MOTION_ATTR = "data-reduced-motion";

const FONT_SIZE_KEY = "ta_font_size";
const FONT_SIZE_ATTR = "data-font-size";
export type FontSize = "small" | "large";

const SE_MUTED_KEY = "ta_se_muted";

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

/** 保存済みの「文字サイズ」設定。未設定なら既定値の "large" を返す。 */
export function getFontSizePreference(): FontSize {
	if (typeof window === "undefined" || !isStorageAvailable()) return "large";
	const raw = window.localStorage.getItem(FONT_SIZE_KEY);
	return raw === "small" ? "small" : "large";
}

/** `<html data-font-size>` に反映する（globals.css の --font-scale がこの属性を見る）。
 * 既定値 "large" は属性なしの状態で globals.css 側の既定値として適用されるため、属性を付けない。 */
export function applyFontSizeAttribute(value: FontSize): void {
	if (typeof document === "undefined") return;
	if (value === "small") {
		document.documentElement.setAttribute(FONT_SIZE_ATTR, "small");
	} else {
		document.documentElement.removeAttribute(FONT_SIZE_ATTR);
	}
}

/** 設定を保存しつつ即時反映する（利用不可時は反映のみ行い、次回訪問時は既定値「大」に戻る）。 */
export function setFontSizePreference(value: FontSize): void {
	if (typeof window !== "undefined" && isStorageAvailable()) {
		window.localStorage.setItem(FONT_SIZE_KEY, value);
	}
	applyFontSizeAttribute(value);
}

/** 保存済みの「効果音」設定。未設定なら既定値の true（ミュート＝OFF）を返す（design §9.7）。
 * DOM 属性への反映（`apply*`）は不要：効果音は再生タイミングごとに `lib/sound-effects.ts` が
 * この関数を直接呼んで判定するだけで、SSR とのちらつき対策（他の設定にある `apply*`）が要らないため。 */
export function getSeMutedPreference(): boolean {
	if (typeof window === "undefined" || !isStorageAvailable()) return true;
	const raw = window.localStorage.getItem(SE_MUTED_KEY);
	if (raw === "true") return true;
	if (raw === "false") return false;
	return true;
}

/** 設定を保存する（利用不可時は次回訪問時も既定値「OFF」に戻る）。 */
export function setSeMutedPreference(value: boolean): void {
	if (typeof window !== "undefined" && isStorageAvailable()) {
		window.localStorage.setItem(SE_MUTED_KEY, String(value));
	}
}
