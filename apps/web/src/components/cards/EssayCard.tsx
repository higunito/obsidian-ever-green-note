"use client";

import { Tag } from "@web/components/notes";
import { useFlashNavigate } from "@web/lib/use-flash-navigate";
import { internalHref } from "@web/lib/wikilink";
import type { Article } from "@web/types/content";
import Link from "next/link";

interface EssayCardProps {
	essay: Article;
	/** 画面遷移直後の十字キー既定選択にする場合 true（`data-roving-default`、design §9.6.2 v1.18）。 */
	defaultFocus?: boolean;
}

/**
 * Essay 一覧カード（spec SC-005、design §9.3）。title/summary/topics/updated。
 * v1 の Essays は native のみ運用のため、`channel:note` バッジ・外部リンクアイコンは実装しない
 * （spec SC-005 §5.2 は v2 として明記。本計画 Phase 8 のスコープ注記に準拠）。
 * クリック時は `useFlashNavigate`（v1.12）でビビビ点滅させてから詳細ページへ遷移する。
 */
export function EssayCard({ essay, defaultFocus }: EssayCardProps) {
	const href = internalHref({ slug: essay.slug, layer: essay.layer });
	const { flashingKey, navigate } = useFlashNavigate();
	const flashing = flashingKey === href;
	return (
		<Link
			href={href}
			data-roving-default={defaultFocus ? "true" : undefined}
			onClick={(e) => {
				e.preventDefault();
				navigate(href, href);
			}}
			className={`block border border-arch-border bg-[rgba(11,26,43,0.7)] p-3 transition-all hover:border-arch-cyan hover:bg-[rgba(20,50,58,0.95)] ${flashing ? "arch-animated" : ""}`}
			style={{ animation: flashing ? "navFlash 0.3s steps(1) 1" : "none" }}
		>
			<div className="mb-1.5 font-dot text-xs leading-relaxed text-arch-text">
				{essay.title}
			</div>
			<div className="mb-2 font-min text-[11px] leading-relaxed text-arch-muted">
				{essay.summary}
			</div>
			<div className="mb-2 flex flex-wrap gap-1">
				{essay.topics.map((topic) => (
					<Tag key={topic} label={topic} />
				))}
			</div>
			<div className="font-mon text-[9px] text-arch-muted">
				updated {essay.updated}
			</div>
		</Link>
	);
}
