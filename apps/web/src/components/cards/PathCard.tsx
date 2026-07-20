import { Tag } from "@web/components/notes";
import type { PathItem } from "@web/types/content";
import Link from "next/link";

interface PathCardProps {
	path: PathItem;
	/** 画面遷移直後の十字キー既定選択にする場合 true（`data-roving-default`、design §9.6.2 v1.18）。 */
	defaultFocus?: boolean;
}

/**
 * Paths 一覧カード（spec SC-007）。design §9.3 は個別コンポーネントとして列挙していないが、
 * 他カード（EssayCard 等）と同じ見た目に揃えるため実装時に追加した（`.claude/rules/coding.md`
 * の既存スタイル踏襲方針に準拠）。title/概要/含まれるノート数/代表 topics。
 */
export function PathCard({ path, defaultFocus }: PathCardProps) {
	return (
		<Link
			href={`/paths/${encodeURIComponent(path.slug)}`}
			data-roving-default={defaultFocus ? "true" : undefined}
			className="block border border-arch-border bg-[rgba(11,26,43,0.7)] p-3 transition-all hover:border-arch-cyan hover:bg-[rgba(20,50,58,0.95)]"
		>
			<div className="mb-1.5 font-dot text-arch-xs leading-relaxed text-arch-text">
				{path.title}
			</div>
			<div className="mb-2 font-min text-[calc(11px*var(--font-scale))] leading-relaxed text-arch-muted">
				{path.summary}
			</div>
			<div className="mb-2 flex flex-wrap gap-1">
				{path.topics.map((topic) => (
					<Tag key={topic} label={topic} />
				))}
			</div>
			<div className="font-mon text-[calc(9px*var(--font-scale))] text-arch-muted">
				{path.steps.length} STEPS
			</div>
		</Link>
	);
}
