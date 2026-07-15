import { NoteBody, Tag } from "@web/components/notes";
import { Footer, NavBack } from "@web/components/system";
import { getContentStore } from "@web/lib/content";
import { internalHref } from "@web/lib/wikilink";
import type { ArticleLayer } from "@web/types/content";
import Link from "next/link";
import { notFound } from "next/navigation";

interface EssayDetailPageProps {
	params: Promise<{ slug: string }>;
}

interface RelatedNote {
	slug: string;
	title: string;
	layer: ArticleLayer;
}

/**
 * Backlinks＋関連ノート（spec SC-006 §6.2、F-GDN-004）。Essay は Stack しないため、
 * FileWindow の `open()` は使わず通常の `<Link>` で対象（Garden/Essay いずれも）へ遷移する。
 */
function EssayRelatedNotes({ notes }: { notes: readonly RelatedNote[] }) {
	if (notes.length === 0) return null;
	return (
		<div className="mt-6 border-t border-arch-border-faint pt-4">
			<div className="mb-2 font-mon text-[9px] tracking-[0.1em] text-arch-muted">
				BACKLINKS ／ 関連ノート
			</div>
			<ul className="flex flex-col gap-1">
				{notes.map((note) => (
					<li key={note.slug}>
						<Link
							href={internalHref({ slug: note.slug, layer: note.layer })}
							className="flex items-center gap-1.5 border-b border-arch-border-faint py-1 font-dot text-[11px] text-arch-cyan transition-colors hover:text-arch-text"
						>
							<span className="font-mon opacity-50">↑</span>
							{note.title}
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}

/**
 * SC-006 Essay 詳細（design §9.3、spec SC-006）。Craig Mod 型の長文リーダー。
 * 本文中の `[[link]]` は content-gen が生成時に遷移先 layer 込みで `/garden/[slug]`・`/essays/[slug]`
 * へ解決済み（design §5.2 / Phase 2 実装）のため、Stack のようなクリック横取りは不要（spec 6.3）。
 */
export default async function EssayDetailPage({
	params,
}: EssayDetailPageProps) {
	const { slug } = await params;

	const store = getContentStore();
	const articles = await store.getArticles();
	const articlesBySlug = new Map(articles.map((a) => [a.slug, a]));
	const essay = articlesBySlug.get(slug);
	if (essay?.layer !== "essay") notFound();

	const relatedNotes: RelatedNote[] = essay.backlinks.flatMap((backSlug) => {
		const target = articlesBySlug.get(backSlug);
		return target
			? [{ slug: backSlug, title: target.title, layer: target.layer }]
			: [];
	});

	return (
		<>
			{/* 本文幅は可読行長（65〜75字相当）で固定（spec SC-006 §6.2）。640px は
			    Noto Serif JP・本アプリの本文サイズでの実測目安（数値の根拠は spec に無いため実装時に決定）。 */}
			<main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col gap-6 p-5 pt-8">
				<NavBack label="◀ ARTICLE" href="/essays" />

				<header className="flex flex-col gap-2">
					<h1 className="font-dot text-base leading-relaxed text-arch-text sm:text-lg">
						{essay.title}
					</h1>
					<div className="flex flex-wrap items-center gap-1.5">
						{essay.topics.map((topic) => (
							<Tag key={topic} label={topic} />
						))}
						<span className="ml-auto font-mon text-[9px] text-arch-muted">
							updated {essay.updated}
						</span>
					</div>
				</header>

				<NoteBody html={essay.bodyHtml} className="text-[15px]" />

				<EssayRelatedNotes notes={relatedNotes} />
			</main>
			<Footer />
		</>
	);
}
