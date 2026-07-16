import { NoteCard } from "@web/components/notes";
import { Footer, Nav, NavBack } from "@web/components/system";
import { getContentStore } from "@web/lib/content";
import type { Article } from "@web/types/content";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PathDetailPageProps {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ step?: string }>;
}

function parseStep(value: string | undefined, max: number): number {
	const n = Number(value);
	if (!Number.isInteger(n) || n < 0) return 0;
	return Math.min(n, max);
}

function stepHref(slug: string, step: number): string {
	return `/paths/${encodeURIComponent(slug)}?step=${step}`;
}

/**
 * SC-010 Path 詳細（design §4.6 / §5.3、spec SC-010）。
 * 現在ステップは `?step=` に保持する（design §11.1「共有可能であるべき状態は URL クエリに保持」の原則を
 * Path の進捗にも適用。design/spec 自体には具体的なクエリ名の規定が無いため実装時に決定）。
 * 各ステップは `NoteCard` を再利用し、そのまま SC-004（Garden 詳細）へ離脱できる（spec §10.3）。
 */
export default async function PathDetailPage({
	params,
	searchParams,
}: PathDetailPageProps) {
	const { slug } = await params;
	const { step: stepParam } = await searchParams;

	const store = getContentStore();
	const [path, articles] = await Promise.all([
		store.getPathBySlug(slug),
		store.getArticles(),
	]);
	if (!path) notFound();

	const articlesBySlug = new Map<string, Article>(
		articles.map((a) => [a.slug, a]),
	);
	const steps = path.steps.flatMap((s) => {
		const article = articlesBySlug.get(s);
		return article ? [article] : [];
	});

	const currentStep = parseStep(stepParam, Math.max(0, steps.length - 1));
	const total = steps.length;

	return (
		<>
			{/* main の幅は他の Nav 設置ページと統一する（Nav の折り返しを避けるため）。
			    本文は読みやすさのため内側の div で従来通り max-w-3xl に絞る。 */}
			<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-5">
				<div className="flex flex-wrap items-center gap-3">
					<NavBack label="◀ ROUTE" href="/paths" />
					<h1 className="font-dot text-sm text-arch-text">{path.title}</h1>
					{total > 0 ? (
						<span className="ml-auto font-mon text-[10px] text-arch-cyan">
							{currentStep + 1} / {total}
						</span>
					) : null}
				</div>
				<Nav />

				<div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
					<p className="font-min text-[13px] leading-relaxed text-arch-muted">
						{path.summary}
					</p>

					{total === 0 ? (
						<div className="p-8 text-center font-min text-[13px] text-arch-muted">
							まだルートがありません
						</div>
					) : (
						<>
							<div className="flex items-center gap-4 font-mon text-[10px] tracking-[0.08em]">
								{currentStep > 0 ? (
									<Link
										href={stepHref(path.slug, currentStep - 1)}
										className="text-arch-cyan hover:text-arch-text"
									>
										◀ 前へ
									</Link>
								) : (
									<span className="text-arch-muted opacity-40">◀ 前へ</span>
								)}
								{currentStep < total - 1 ? (
									<Link
										href={stepHref(path.slug, currentStep + 1)}
										className="text-arch-cyan hover:text-arch-text"
									>
										次へ ▶
									</Link>
								) : (
									<span className="text-arch-muted opacity-40">次へ ▶</span>
								)}
							</div>

							<ol className="flex flex-col gap-3">
								{steps.map((article, i) => {
									const isCurrent = i === currentStep;
									return (
										<li key={article.slug}>
											<div className="mb-1.5 font-mon text-[9px] tracking-[0.1em] text-arch-muted">
												STEP {i + 1}
											</div>
											<div
												className={
													isCurrent
														? "border border-arch-cyan shadow-[0_0_14px_var(--color-arch-cyan-faint)]"
														: "opacity-70"
												}
											>
												<NoteCard note={article} />
											</div>
										</li>
									);
								})}
							</ol>
						</>
					)}
				</div>
			</main>
			<Footer />
		</>
	);
}
