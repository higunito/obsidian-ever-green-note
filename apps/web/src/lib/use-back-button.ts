"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { playCancelSound } from "@web/lib/sound-effects";

// このタブでアプリ内遷移が何回起きたかを数えるモジュール内カウンタ。ハード再読み込みで
// リセットされる（＝新しい JS コンテキスト）ことを利用し、「直リンクで開いたばかりで
// アプリ内履歴が無い」状態を判定する（design §9.6.3）。sessionStorage 等は使わない：
// ハード再読み込みは体感的にも「アプリ内の履歴が無い状態」に戻るのが自然なため。
let internalNavigationCount = 0;

function markInternalNavigation(): void {
	internalNavigationCount += 1;
}

function hasInternalHistory(): boolean {
	return internalNavigationCount > 1;
}

function isTextInput(target: EventTarget | null): boolean {
	return (
		target instanceof HTMLElement &&
		(target.tagName === "INPUT" || target.tagName === "TEXTAREA")
	);
}

interface UseBackButtonOptions {
	enabled?: boolean;
	/**
	 * 既定の「戻る」より優先する画面固有処理（design §9.6.3 の例外、例：Stack View の
	 * 「畳む」）。`true` を返すと既定の戻る処理（履歴 or `defaultHref`）をスキップする。
	 */
	onBeforeBack?: () => boolean;
}

/**
 * B ボタン（`Escape`/`X`）共通フック（design §9.6.3、spec 共通仕様 F-NAV-003）。
 * 画面ごとに 1 回呼び出す。アプリ内履歴があれば `router.back()`、直リンク等で
 * 無ければ `defaultHref`（画面ヘッダーの「◀ ＸＸＸ」と同じ遷移先）へ遷移する。
 * テキスト入力欄にフォーカス中は入力欄から `blur` するだけで遷移しない。
 */
export function useBackButton(
	defaultHref: string,
	{ enabled = true, onBeforeBack }: UseBackButtonOptions = {},
): void {
	const router = useRouter();

	useEffect(() => {
		markInternalNavigation();
	}, []);

	useEffect(() => {
		if (!enabled) return;

		function handleKeyDown(e: KeyboardEvent) {
			if (e.key !== "Escape" && e.key !== "x" && e.key !== "X") return;
			if (e.ctrlKey || e.metaKey || e.altKey) return;

			if (isTextInput(e.target)) {
				(e.target as HTMLElement).blur();
				return;
			}
			playCancelSound();
			if (onBeforeBack?.()) return;

			if (hasInternalHistory()) {
				router.back();
			} else {
				router.push(defaultHref);
			}
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [enabled, defaultHref, onBeforeBack, router]);
}
