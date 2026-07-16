"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

/** 遷移確定ボタンのビビビ点滅演出（globals.css `navFlash`）を見せてから push するまでの待ち時間。 */
export const FLASH_NAVIGATE_MS = 300;

/**
 * ページ遷移ボタン共通の「クリック→短く点滅（`navFlash`）→遷移」フック（design §9.1 `CommandMenu` v1.9 由来）。
 * `CommandMenu`/`EntryLinkModal` など、遷移先へ直接 `<Link>` する任意のボタンから使い回せるよう切り出したもの。
 * `key` は呼び出し側が任意に決める識別子（一覧メニューならインデックス、単一ボタンなら href 等）で、
 * 点滅させたい対象を `flashingKey === key` で判定させる。
 */
export function useFlashNavigate(delayMs: number = FLASH_NAVIGATE_MS) {
	const router = useRouter();
	const [flashingKey, setFlashingKey] = useState<string | null>(null);

	const navigate = useCallback(
		(key: string, href: string) => {
			setFlashingKey(key);
			window.setTimeout(() => router.push(href), delayMs);
		},
		[router, delayMs],
	);

	return { flashingKey, navigate };
}
