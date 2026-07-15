import { NoteBody, Tag } from "@web/components/notes";
import { Footer, Nav, NavBack } from "@web/components/system";
import { getContentStore } from "@web/lib/content";

/**
 * SC-011 About（design §4.6、spec SC-011）。`pages.json.about`（＝Vault `Fleeting/about.md`）から生成する
 * プロフィール固定ページ。趣旨・世界観・外部リンクは Vault 側の本文（bodyHtml）に含める運用とし、
 * このページ自体は枠組みのみを提供する（design §4.6「About/Paths もすべて Vault から生成」）。
 */
export default async function AboutPage() {
	const store = getContentStore();
	const { about } = await store.getPages();

	return (
		<>
			<main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-5">
				<div className="flex flex-wrap items-center gap-3">
					<NavBack label="◀ HOME" href="/home" />
					<h1 className="font-dot text-sm text-arch-text">PROFILE / About</h1>
				</div>
				<Nav />

				{about.bodyHtml ? (
					<>
						<div className="flex flex-wrap items-center gap-1.5">
							{about.topics.map((topic) => (
								<Tag key={topic} label={topic} />
							))}
							<span className="ml-auto font-mon text-[9px] text-arch-muted">
								updated {about.updated}
							</span>
						</div>
						<NoteBody html={about.bodyHtml} />
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
