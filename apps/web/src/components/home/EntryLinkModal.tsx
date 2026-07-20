"use client";

import { useFlashNavigate } from "@web/lib/use-flash-navigate";
import { C } from "@web/styles/tokens";
import Link from "next/link";

interface EntryLinkModalProps {
	/** 表示ラベル（例 `思考マップへ`）。 */
	label: string;
	href: string;
}

/**
 * `SelectEntryPanel` の MAP/ARTICLE タブ選択時に FRAGMENTS/THREE DOORS と同じ領域へ
 * 横中央寄せで出す遷移確認パネル（spec SC-001 §1.2、design §9.1 `EntryLinkModal`）。
 * 両タブで共通のコンポーネントを使う。表示位置は呼び出し側（`SelectEntryPanel`）が揃える。
 * クリック時は `useFlashNavigate`（`CommandMenu` と共通、v1.9）でビビビ点滅させてから遷移する。
 */
export function EntryLinkModal({ label, href }: EntryLinkModalProps) {
	const { flashingKey, navigate } = useFlashNavigate();
	const flashing = flashingKey === href;

	return (
		<Link
			href={href}
			onClick={(e) => {
				e.preventDefault();
				navigate(href, href);
			}}
			className={`block px-5 py-3 font-dot text-arch-xs whitespace-nowrap text-arch-cyan transition-colors hover:text-arch-text ${flashing ? "arch-animated" : ""}`}
			style={{
				border: `2px solid ${C.cyan}`,
				background: C.panel,
				boxShadow: `inset 1px 1px 0 ${C.borderHi}, inset -1px -1px 0 ${C.borderSh}, 0 0 16px ${C.cyanDim}`,
				animation: flashing ? "navFlash 0.3s steps(1) 1" : "none",
			}}
		>
			▶ {label}
		</Link>
	);
}
