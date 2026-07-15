import { NoteBody, Tag } from "@web/components/notes";
import { Footer, Nav, NavBack } from "@web/components/system";
import { getContentStore } from "@web/lib/content";

/**
 * SC-011 Now（design §4.6、spec SC-011）。`pages.json.now`（＝Vault `Fleeting/now.md`）から生成する
 * 単一の近況ページ。未整備（`bodyHtml` が空）の場合は「準備中」を表示する（design §4.6「未整備のキーは空にする」）。
 */
export default async function NowPage() {
	const store = getContentStore();
	const { now } = await store.getPages();

	return (
		<>
			<main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-5">
				<div className="flex flex-wrap items-center gap-3">
					<NavBack label="◀ HOME" href="/" />
					<h1 className="font-dot text-sm text-arch-text">STATUS / Now</h1>
				</div>
				<Nav />

				{now.bodyHtml ? (
					<>
						<div className="flex flex-wrap items-center gap-1.5">
							{now.topics.map((topic) => (
								<Tag key={topic} label={topic} />
							))}
							<span className="ml-auto font-mon text-[9px] text-arch-muted">
								updated {now.updated}
							</span>
						</div>
						<NoteBody html={now.bodyHtml} />
					</>
				) : (
					<div className="p-8 text-center font-min text-[13px] text-arch-muted">
						準備中
					</div>
				)}
			</main>
			<Footer />
		</>
	);
}
