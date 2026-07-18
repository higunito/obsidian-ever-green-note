"use client";

import { useFlashNavigate } from "@web/lib/use-flash-navigate";
import { internalHref } from "@web/lib/wikilink";
import type { ArticleLayer } from "@web/types/content";
import Link from "next/link";

export interface DoorItem {
	topic: string;
	slug: string;
	layer: ArticleLayer;
	noteTitle: string;
}

interface DoorCardProps {
	door: DoorItem;
}

/**
 * 3つの入口の1枚（spec SC-001 §1.3、design §5.5、figma `ThreeDoors` の行を正準）。
 * トピック名＋代表ノートのタイトル。選定（別トピック保証・除外規則）は呼び出し側（Phase 5）が担う。
 * クリック時は `useFlashNavigate`（v1.12）でビビビ点滅させてから詳細ページへ遷移する。
 */
export function DoorCard({ door }: DoorCardProps) {
	const href = internalHref({ slug: door.slug, layer: door.layer });
	const { flashingKey, navigate } = useFlashNavigate();
	const flashing = flashingKey === href;
	return (
		<Link
			href={href}
			onClick={(e) => {
				e.preventDefault();
				navigate(href, href);
			}}
			className={`flex items-start gap-2 border-b border-arch-border-faint px-3 py-2 transition-colors last:border-b-0 hover:bg-arch-cyan-faint ${flashing ? "arch-animated" : ""}`}
			style={{ animation: flashing ? "navFlash 0.3s steps(1) 1" : "none" }}
		>
			<span
				aria-hidden
				className="mt-0.5 shrink-0 font-dot text-[11px] text-arch-cyan"
			>
				▶
			</span>
			<div>
				<div className="font-dot text-xs text-arch-cyan">{door.topic}へ</div>
				<div className="mt-0.5 font-mon text-[9px] text-arch-muted">
					{door.noteTitle}
				</div>
			</div>
		</Link>
	);
}
