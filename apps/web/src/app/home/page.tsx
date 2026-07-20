import { SelectEntryPanel, ThreeDoorsPanel } from "@web/components/home";
import { NoteCard } from "@web/components/notes";
import {
	Footer,
	KeyboardBack,
	Nav,
	NavBack,
	SpatialNavRegion,
	Window,
} from "@web/components/system";
import { getContentStore } from "@web/lib/content";
import {
	dailySeed,
	seededRandom,
	selectThreeDoors,
} from "@web/lib/three-doors";
import type { Article } from "@web/types/content";

const RECENT_GARDEN_LIMIT = 6;

function getRecentGardenNotes(articles: readonly Article[]): Article[] {
	return [...articles]
		.filter((a) => a.layer === "garden")
		.sort((a, b) => b.updated.localeCompare(a.updated))
		.slice(0, RECENT_GARDEN_LIMIT);
}

// SC-001 ホーム（design §9.1 Home、spec SC-001）。SC-000 タイトルは独立ルート `/` に分離済み。
export default async function HomePage() {
	const store = getContentStore();
	const articles = await store.getArticles();
	const gardenArticles = articles.filter((a) => a.layer === "garden");
	const recentGarden = getRecentGardenNotes(articles);
	const initialDoors = selectThreeDoors(articles, seededRandom(dailySeed()));
	const hasGardenNotes = gardenArticles.length > 0;

	const fragmentsContent = (
		<Window title="GARDEN — 最近更新された記録" className="h-full">
			{hasGardenNotes ? (
				<div className="grid grid-cols-[repeat(auto-fill,minmax(195px,1fr))] gap-2.5 p-3">
					{recentGarden.map((note, i) => (
						<NoteCard key={note.slug} note={note} defaultFocus={i === 0} />
					))}
				</div>
			) : (
				<p className="p-3 font-min text-[calc(13px*var(--font-scale))] text-arch-muted">
					まだ記録がありません
				</p>
			)}
		</Window>
	);

	const threeDoorsContent = hasGardenNotes ? (
		<ThreeDoorsPanel initialDoors={initialDoors} articles={articles} />
	) : (
		<Window title="THREE DOORS — 3つの入口" className="h-full">
			<p className="p-3 font-min text-[calc(13px*var(--font-scale))] text-arch-muted">
				まだ記録がありません
			</p>
		</Window>
	);

	return (
		<>
			<KeyboardBack href="/" />
			<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-5">
				{/* 十字キーの対象（spec SC-001 §1.4）：Nav/NavBack・SELECT ENTRY タブ・選択中パネルの内容。 */}
				<SpatialNavRegion className="flex flex-1 flex-col gap-4">
					<div className="flex flex-wrap items-center gap-3">
						<NavBack label="◀ TITLE" href="/" />
						<h1 className="font-dot text-arch-sm text-arch-text">HOME</h1>
					</div>
					<Nav />

					<SelectEntryPanel
						fragmentsContent={fragmentsContent}
						threeDoorsContent={threeDoorsContent}
					/>
				</SpatialNavRegion>
			</main>
			<Footer />
		</>
	);
}
