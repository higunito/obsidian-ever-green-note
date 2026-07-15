import { ProjectCard } from "@web/components/cards";
import { Footer, Nav, NavBack } from "@web/components/system";
import type { ProjectItem } from "@web/types/content";

// v1 はデータ源となる `Projects/`（Vault ゾーン）・生成 JSON が存在しないため常に 0 件
// （実装計画 Phase 9 / spec SC-008 §8.3。`ProjectItem` は Phase 4 で定義済みの将来用プレースホルダー型）。
const projects: readonly ProjectItem[] = [];

/**
 * SC-008 Projects（design §9.3、spec SC-008）。title/概要/技術タグ/外部リンクの `ProjectCard` 一覧。
 */
export default function ProjectsPage() {
	return (
		<>
			<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-5">
				<div className="flex flex-wrap items-center gap-3">
					<NavBack label="◀ HOME" href="/" />
					<h1 className="font-dot text-sm text-arch-text">
						PROJECTS / Projects
					</h1>
				</div>
				<Nav />

				{projects.length === 0 ? (
					<div className="p-8 text-center font-min text-[13px] text-arch-muted">
						<p className="font-dot text-xs text-arch-text">PROJECTS — 構築中</p>
						<p className="mt-2">制作物はまだ準備中です。</p>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{projects.map((project) => (
							<ProjectCard key={project.slug} project={project} />
						))}
					</div>
				)}
			</main>
			<Footer />
		</>
	);
}
