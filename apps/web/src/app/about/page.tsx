import { NoteBody, Tag } from "@web/components/notes";
import { Footer, Nav, NavBack } from "@web/components/system";
import { getContentStore } from "@web/lib/content";
import Link from "next/link";

/**
 * SC-012 About（design §4.6、spec SC-012）。`pages.json.about`（＝Vault `Fleeting/about.md`）から生成する
 * プロフィール固定ページ。趣旨・世界観・外部リンクは Vault 側の本文（bodyHtml）に含める運用とし、
 * このページ自体は枠組みのみを提供する（design §4.6「Now/About/Paths もすべて Vault から生成」）。
 * `/now`（STATUS）は Nav（design §3.3）に含まれない画面のため、他に到達経路が無い。
 * nownownow 型ページは About からの導線が一般的なため、ここに導線を追加した（実装時に決定）。
 */
export default async function AboutPage() {
	const store = getContentStore();
	const { about } = await store.getPages();

	return (
		<>
			<main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-5">
				<div className="flex flex-wrap items-center gap-3">
					<NavBack label="◀ HOME" href="/" />
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

				<div className="mt-4 border-t border-arch-border-faint pt-4">
					<Link
						href="/now"
						className="font-mon text-[10px] tracking-[0.08em] text-arch-cyan transition-colors hover:text-arch-text"
					>
						→ STATUS / いま考えていること
					</Link>
				</div>
			</main>
			<Footer />
		</>
	);
}
