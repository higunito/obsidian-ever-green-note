import { NoteBody, Tag } from "@web/components/notes";
import { Footer, Nav, NavBack } from "@web/components/system";
import { ABOUT_CONTENT } from "@web/lib/about-content";

/**
 * SC-009 About（design §4.6、spec SC-009）。プロフィール固定ページ。
 * 2026-07-19 より Vault 生成（`pages.json.about`）をやめ、`lib/about-content.ts` の
 * 静的コンテンツを直接表示する方式に変更した（design §4.6「About はアプリ管理コンテンツ」）。
 */
export default function AboutPage() {
	const about = ABOUT_CONTENT;

	return (
		<>
			{/* main の幅は他の Nav 設置ページと統一する（Nav の折り返しを避けるため）。
			    本文は読みやすさのため内側の div で従来通り max-w-2xl に絞る。 */}
			<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-5">
				<div className="flex flex-wrap items-center gap-3">
					<NavBack label="◀ HOME" href="/home" />
					<h1 className="font-dot text-sm text-arch-text">ABOUT / About</h1>
				</div>
				<Nav />

				<div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
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
				</div>
			</main>
			<Footer />
		</>
	);
}
