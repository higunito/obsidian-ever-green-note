import {
	LiveStatusPanel,
	SelectEntryMenu,
	ThreeDoorsPanel,
} from "@web/components/home";
import { NoteCard } from "@web/components/notes";
import { Footer, Window } from "@web/components/system";
import { TitleGate } from "@web/components/title";
import { getContentStore } from "@web/lib/content";
import {
	dailySeed,
	seededRandom,
	selectThreeDoors,
} from "@web/lib/three-doors";
import type { Article } from "@web/types/content";

const RECENT_GARDEN_LIMIT = 6;
const INTRO_TEXT =
	"美学、文学、音楽、技術についてのノートと断片を記録しています。";

function getRecentGardenNotes(articles: readonly Article[]): Article[] {
	return [...articles]
		.filter((a) => a.layer === "garden")
		.sort((a, b) => b.updated.localeCompare(a.updated))
		.slice(0, RECENT_GARDEN_LIMIT);
}

function getCurrentTopic(
	gardenArticles: readonly Article[],
): string | undefined {
	const withTopics = [...gardenArticles]
		.filter((a) => a.topics.length > 0)
		.sort((a, b) => b.updated.localeCompare(a.updated));
	return withTopics[0]?.topics[0];
}

// SC-001 ホーム（design §9.1 Home、spec SC-001）。
// SC-000 タイトルは同一ルート `/` 上のオーバーレイとして TitleGate が担う（design §11.3）。
export default async function Home() {
	const store = getContentStore();
	const articles = await store.getArticles();
	const gardenArticles = articles.filter((a) => a.layer === "garden");
	const recentGarden = getRecentGardenNotes(articles);
	const currentTopic = getCurrentTopic(gardenArticles);
	const gardenSlugs = gardenArticles.map((a) => a.slug);
	const initialDoors = selectThreeDoors(articles, seededRandom(dailySeed()));
	const hasGardenNotes = gardenArticles.length > 0;

	const introParagraph = (
		<p className="mx-auto max-w-[380px] text-center font-min text-[14px] text-arch-text leading-loose min-[900px]:text-[15px]">
			{INTRO_TEXT}
		</p>
	);

	const selectEntryWindow = (
		<Window title="SELECT ENTRY">
			<SelectEntryMenu />
		</Window>
	);

	const fragmentsGrid = hasGardenNotes ? (
		recentGarden.map((note) => <NoteCard key={note.slug} note={note} />)
	) : (
		<p className="p-3 font-min text-[13px] text-arch-muted">
			まだ記録がありません
		</p>
	);

	const threeDoorsContent = hasGardenNotes ? (
		<ThreeDoorsPanel initialDoors={initialDoors} articles={articles} />
	) : (
		<Window title="THREE DOORS — 3つの入口">
			<p className="p-3 font-min text-[13px] text-arch-muted">
				まだ記録がありません
			</p>
		</Window>
	);

	return (
		<>
			<TitleGate gardenSlugs={gardenSlugs} />
			<main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 p-5 pt-14">
				{/* モバイル（<900px）：1 カラム縦積み（spec SC-001 §1.6） */}
				<div className="flex flex-col gap-4 min-[900px]:hidden">
					<LiveStatusPanel currentTopic={currentTopic} />
					{introParagraph}
					{selectEntryWindow}
					<Window title="FRAGMENTS — 最近の記録">
						<div className="flex flex-col gap-2.5 p-2.5">{fragmentsGrid}</div>
					</Window>
					<div data-three-doors>{threeDoorsContent}</div>
				</div>

				{/* デスクトップ（≥900px）：上段3カラム＋下段2カラム（spec SC-001 §1.2） */}
				<div className="hidden flex-col gap-3.5 min-[900px]:flex">
					<div className="grid grid-cols-[210px_1fr_210px] gap-3.5">
						<LiveStatusPanel currentTopic={currentTopic} />
						<div className="flex items-center justify-center px-4">
							{introParagraph}
						</div>
						<div data-three-doors>{threeDoorsContent}</div>
					</div>
					<div className="grid grid-cols-[210px_1fr] items-start gap-3.5">
						{selectEntryWindow}
						<Window title="FRAGMENTS — 最近更新された記録">
							<div className="grid grid-cols-[repeat(auto-fill,minmax(195px,1fr))] gap-2.5 p-3">
								{fragmentsGrid}
							</div>
						</Window>
					</div>
				</div>
			</main>
			<Footer />
		</>
	);
}
