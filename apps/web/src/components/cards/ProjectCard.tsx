import { Tag } from "@web/components/notes";
import type { ProjectItem } from "@web/types/content";
import { ExternalLink } from "lucide-react";

interface ProjectCardProps {
	project: ProjectItem;
}

const cardClassName =
	"block border border-arch-border bg-[rgba(11,26,43,0.7)] p-3 transition-all hover:border-arch-cyan hover:bg-[rgba(20,50,58,0.95)]";

/**
 * Projects 一覧カード（spec SC-008、design §9.3）。title/概要/技術タグ/外部リンク。
 * データ源は将来の `Projects/`（v1 は生成 JSON なし、0 件表示は Phase 9 の `app/projects/page.tsx` が担う）。
 */
export function ProjectCard({ project }: ProjectCardProps) {
	const body = (
		<>
			<div className="mb-1.5 flex items-center gap-1.5 font-dot text-xs text-arch-text">
				<span>{project.title}</span>
				{project.url ? (
					<ExternalLink
						size={11}
						className="shrink-0 text-arch-cyan"
						aria-hidden
					/>
				) : null}
			</div>
			<div className="mb-2 font-min text-[11px] leading-relaxed text-arch-muted">
				{project.summary}
			</div>
			<div className="flex flex-wrap gap-1">
				{project.tags.map((tag) => (
					<Tag key={tag} label={tag} />
				))}
			</div>
		</>
	);

	if (project.url) {
		return (
			<a
				href={project.url}
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
