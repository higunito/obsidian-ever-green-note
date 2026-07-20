"use client";

import { useFlashNavigate } from "@web/lib/use-flash-navigate";
import { internalHref } from "@web/lib/wikilink";
import { C, statusColor } from "@web/styles/tokens";
import type { Article } from "@web/types/content";
import Link from "next/link";
import { Badge } from "./Badge";
import { Tag } from "./Tag";

interface NoteCardProps {
	/** Garden ノート（design §4.2）。`status` は Garden ノートのみ必須のため、無い場合は枠線色のみ既定にフォールバックする。 */
	note: Article;
	/** 画面遷移直後の十字キー既定選択にする場合 true（`data-roving-default`、design §9.6.2 v1.18）。 */
	defaultFocus?: boolean;
}

/**
 * Garden ノートのカード（spec SC-002、design §9.2、figma `NoteCard` を正準）。
 * status バッジ＋左罫の status 色＋title＋summary＋topics。hover でシアン強調。
 * クリック時は `useFlashNavigate`（v1.12）でビビビ点滅させてから詳細ページへ遷移する。
 */
export function NoteCard({ note, defaultFocus }: NoteCardProps) {
	const accent = note.status ? statusColor(note.status) : C.border;
	const href = internalHref({ slug: note.slug, layer: note.layer });
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
			className={`block border border-arch-border border-l-2 bg-[rgba(11,26,43,0.7)] p-3 transition-all hover:border-arch-cyan hover:bg-[rgba(20,50,58,0.95)] hover:shadow-[0_0_12px_var(--color-arch-cyan-faint)] ${flashing ? "arch-animated" : ""}`}
			style={{
				borderLeftColor: accent,
				animation: flashing ? "navFlash 0.3s steps(1) 1" : "none",
			}}
		>
			{note.status ? (
				<div className="mb-[5px]">
					<Badge status={note.status} />
				</div>
			) : null}
			<div className="mb-1.5 font-dot text-xs leading-relaxed text-arch-text">
				{note.title}
			</div>
			<div className="mb-2 font-min text-[11px] leading-relaxed text-arch-muted">
				{note.summary}
			</div>
			<div className="flex flex-wrap gap-1">
				{note.topics.map((topic) => (
					<Tag key={topic} label={topic} />
				))}
			</div>
		</Link>
	);
}
