"use client";

import { useBackButton } from "@web/lib/use-back-button";

interface KeyboardBackProps {
	/** B ボタンの既定戻り先。画面ヘッダーの「◀ ＸＸＸ」と同じ遷移先にする（design §9.6.3）。 */
	href: string;
	/** 画面固有の優先処理（例：Stack View の「畳む」）。`true` を返すと既定の戻る処理をスキップする。 */
	onBeforeBack?: () => boolean;
}

/**
 * 画面ごとの B ボタン（`Escape`/`X`、design §9.6.3、spec 共通仕様 F-NAV-003）を有効にするだけの
 * 非表示コンポーネント。Server Component のページからも `<KeyboardBack href="/home" />` のように
 * 配置できる（`useBackButton` はクライアント専用フックのため）。
 */
export function KeyboardBack({ href, onBeforeBack }: KeyboardBackProps) {
	useBackButton(href, { onBeforeBack });
	return null;
}
