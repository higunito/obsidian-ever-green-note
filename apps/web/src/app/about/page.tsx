import { NoteBody, Tag } from "@web/components/notes";
import {
	Footer,
	KeyboardBack,
	Nav,
	NavBack,
	SpatialNavRegion,
} from "@web/components/system";
import { ABOUT_CONTENT, ABOUT_EXTERNAL_LINKS } from "@web/lib/about-content";
import { NAV_ITEMS } from "@web/lib/navigation";
import type { ReactNode } from "react";

/** キーボード操作方法（design §9.6.1）の一覧。ユーザー向けの言い回しでここに直接持つ
 * （design.md は開発者向けの仕様記述のため、そのまま転記しない）。 */
const KEY_BINDINGS = [
	{
		keys: "↑ ↓ ← →",
		description:
			"カーソル移動（メニュー・カード一覧・調査マップのノード間移動など）。",
	},
	{
		keys: "Enter / Z",
		description: "選択中の項目を決定します（クリックと同じ）。",
	},
	{ keys: "Esc / X", description: "1 つ前の画面に戻ります。" },
] as const;

/** タイトル画面（`/`）は `Nav` に含まれないため、`NAV_ITEMS` とは別に手動で用意する。 */
const TITLE_PAGE_ITEM = {
	gameName: "TITLE",
	label: "タイトル",
	description: "起動画面。CONFIG の「タイトルを見る」からいつでも見返せます。",
} as const;

function SectionHeading({ children }: { children: ReactNode }) {
	return (
		<div className="mb-2 font-mon text-[calc(9px*var(--font-scale))] tracking-[0.1em] text-arch-muted">
			{children}
		</div>
	);
}

/**
 * SC-009 About（design §4.6、spec SC-009）。プロフィール固定ページ。
 * 2026-07-19 より Vault 生成（`pages.json.about`）をやめ、`lib/about-content.ts` の
 * 静的コンテンツを直接表示する方式に変更した（design §4.6「About はアプリ管理コンテンツ」）。
 * 「概要」「各ページの説明」「操作方法」「リンク集」の4セクション構成（spec SC-009 §9.2 v1.21）。
 * 「各ページの説明」は `lib/navigation.ts` の `NAV_ITEMS`（Nav の単一情報源）をそのまま参照し、
 * ページ名・説明の二重管理を避ける。
 */
export default function AboutPage() {
	const about = ABOUT_CONTENT;

	return (
		<>
			{/* main の幅は他の Nav 設置ページと統一する（Nav の折り返しを避けるため）。
			    本文は読みやすさのため内側の div で従来通り max-w-2xl に絞る。 */}
			<KeyboardBack href="/home" />
			<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-5">
				{/* 十字キーの対象（spec SC-009 §9.4）：Nav/NavBack・本文中の外部リンク。 */}
				<SpatialNavRegion className="flex flex-1 flex-col gap-4">
					<div className="flex flex-wrap items-center gap-3">
						<NavBack label="◀ HOME" href="/home" />
						<h1 className="font-dot text-arch-sm text-arch-text">ABOUT</h1>
					</div>
					<Nav markActiveAsDefault />

					<div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
						<div className="flex flex-wrap items-center gap-1.5">
							{about.topics.map((topic) => (
								<Tag key={topic} label={topic} />
							))}
							<span className="ml-auto font-mon text-[calc(9px*var(--font-scale))] text-arch-muted">
								updated {about.updated}
							</span>
						</div>

						<section>
							<SectionHeading>OVERVIEW ／ 概要</SectionHeading>
							{about.overviewHtml ? (
								<NoteBody html={about.overviewHtml} />
							) : (
								<p className="font-min text-[calc(13px*var(--font-scale))] text-arch-muted">
									準備中
								</p>
							)}
						</section>

						<section className="border-t border-arch-border-faint pt-4">
							<SectionHeading>PAGES ／ 各ページの説明</SectionHeading>
							<dl className="flex flex-col gap-3">
								{[TITLE_PAGE_ITEM, ...NAV_ITEMS].map((item) => (
									<div key={item.gameName} className="flex flex-col gap-0.5">
										<dt className="flex items-baseline gap-1.5">
											<span className="font-dot text-arch-xs text-arch-cyan">
												{item.gameName}
											</span>
											<span className="font-mon text-[calc(9px*var(--font-scale))] text-arch-muted">
												{item.label}
											</span>
										</dt>
										<dd className="font-min text-[calc(12px*var(--font-scale))] text-arch-text leading-relaxed">
											{item.description}
										</dd>
									</div>
								))}
							</dl>
						</section>

						<section className="border-t border-arch-border-faint pt-4">
							<SectionHeading>CONTROLS ／ 操作方法</SectionHeading>
							<p className="mb-3 font-min text-[calc(12px*var(--font-scale))] text-arch-text leading-relaxed">
								このWebサイトは、マウス／タッチだけでなく、キーボード操作にも対応しています。
							</p>
							<ul className="flex flex-col gap-2">
								{KEY_BINDINGS.map((binding) => (
									<li key={binding.keys} className="flex items-center gap-3">
										<span className="shrink-0 border border-arch-border px-2 py-1 font-mon text-[calc(11px*var(--font-scale))] text-arch-cyan">
											{binding.keys}
										</span>
										<span className="font-min text-[calc(12px*var(--font-scale))] text-arch-text">
											{binding.description}
										</span>
									</li>
								))}
							</ul>
						</section>

						{ABOUT_EXTERNAL_LINKS.length > 0 ? (
							<section className="border-t border-arch-border-faint pt-4">
								<SectionHeading>LINKS ／ リンク集</SectionHeading>
								<ul className="flex flex-col gap-2">
									{ABOUT_EXTERNAL_LINKS.map((link) => (
										<li key={link.href}>
											<a
												href={link.href}
												target="_blank"
												rel="noreferrer"
												className="inline-flex items-center gap-1.5 font-dot text-[calc(11px*var(--font-scale))] text-arch-cyan transition-colors hover:text-arch-text"
											>
												<span className="font-mon opacity-50">↗</span>
												{link.label}
											</a>
										</li>
									))}
								</ul>
							</section>
						) : null}
					</div>
				</SpatialNavRegion>
			</main>
			<Footer />
		</>
	);
}
