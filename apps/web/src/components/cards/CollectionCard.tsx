import { Tag } from "@web/components/notes";
import type { CollectionItem } from "@web/types/content";
import { ExternalLink } from "lucide-react";

interface CollectionCardProps {
	item: CollectionItem;
}

const cardClassName =
	"block border border-arch-border bg-[rgba(11,26,43,0.7)] p-3 transition-all hover:border-arch-cyan hover:bg-[rgba(20,50,58,0.95)]";

/**
 * Collections ギャラリーカード（spec SC-007、design §9.3 / §4.5）。
 * cover/title/creator/year/summary/topics。`external_url` があればカード全体を外部リンク化する
 * （spec SC-007 §7.3。詳細ページは v1 では持たない）。`source_ref` は生成時サニタイズ済みでそもそも受け取らない。
 */
export function CollectionCard({ item }: CollectionCardProps) {
	const body = (
		<>
			<div className="mb-2 aspect-square w-full overflow-hidden border border-arch-border-faint bg-arch-panel-dark">
				{item.cover ? (
					// biome-ignore lint/performance/noImgElement: cover は配置未確定のローカル/外部パスで next/image の最適化対象外
					<img
						src={item.cover}
						alt={`${item.title} のカバー`}
						className="h-full w-full object-cover"
					/>
				) : (
					<div
						className="flex h-full w-full items-center justify-center font-dot text-[10px] text-arch-muted"
						style={{
							backgroundImage:
								"radial-gradient(var(--color-arch-border-faint) 1px, transparent 1px)",
							backgroundSize: "6px 6px",
						}}
					>
						NO COVER
					</div>
				)}
			</div>
			<div className="mb-1 flex items-center gap-1.5 font-dot text-xs text-arch-text">
				<span>{item.title}</span>
				{item.external_url ? (
					<ExternalLink
						size={11}
						className="shrink-0 text-arch-cyan"
						aria-hidden
					/>
				) : null}
			</div>
			<div className="mb-1 font-mon text-[10px] text-arch-muted">
				{item.creator} / {item.year}
			</div>
			<div className="mb-2 font-min text-[11px] leading-relaxed text-arch-muted">
				{item.summary}
			</div>
			<div className="flex flex-wrap gap-1">
				{item.topics.map((topic) => (
					<Tag key={topic} label={topic} />
				))}
			</div>
		</>
	);

	if (item.external_url) {
		return (
			<a
				href={item.external_url}
				target="_blank"
				rel="noreferrer"
				className={cardClassName}
			>
				{body}
			</a>
		);
	}
	return <div className={cardClassName}>{body}</div>;
}
