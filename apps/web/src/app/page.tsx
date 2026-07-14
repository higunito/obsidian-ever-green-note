import { Footer, Nav, Window } from "@web/components/system";
import { getContentStore } from "@web/lib/content";
import { internalHref } from "@web/lib/wikilink";

// Phase 3 時点の最小シェル。背景＋共通シェル（Nav/Footer）が乗ることと、
// 任意の Server Component が ContentStore 経由で記事を取得できることの確認用。
// 本来のホーム（SC-001）は Phase 5 で実装する。
export default async function Home() {
	const articles = await getContentStore().getArticles();
	const gardenNotes = articles.filter((a) => a.layer === "garden").slice(0, 6);

	return (
		<main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 p-5">
			<Nav />
			<Window title="FRAGMENTS — 最近の記録">
				<ul className="flex flex-col gap-2 p-3">
					{gardenNotes.map((note) => (
						<li key={note.slug}>
							<a
								href={internalHref({ slug: note.slug, layer: note.layer })}
								className="font-min text-arch-text transition-colors hover:text-arch-cyan"
							>
								{note.title}
							</a>
						</li>
					))}
				</ul>
			</Window>
			<Footer />
		</main>
	);
}
