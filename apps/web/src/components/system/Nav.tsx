import { NAV_ITEMS } from "@web/lib/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { NavLinks } from "./NavLinks";

// `useSearchParams` を使う `NavLinks` を Suspense でラップする（Next.js の要件）。
// フォールバックはハイライト無しの同一リンク一覧（初期表示のレイアウトシフトを避ける）。
function NavFallback() {
	return (
		<ul className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
			{NAV_ITEMS.map((item) => (
				<li key={item.href}>
					<Link
						href={item.href}
						className="group inline-flex items-baseline gap-1.5 transition-colors"
					>
						<span className="font-dot text-[12px] tracking-[0.06em] text-arch-text group-hover:text-arch-cyan">
							{item.gameName}
						</span>
						<span className="font-mon text-[9px] tracking-[0.08em] text-arch-muted">
							{item.label}
						</span>
					</Link>
				</li>
			))}
		</ul>
	);
}

/**
 * 画面間ナビ（§9.1）。各項目はゲーム内名称＋通常名を必ず併記する（可読性ガードレール §10.6）。
 * 対応表の単一情報源は lib/navigation.ts（design §3.3）。現在ページはハイライトで示す。
 */
export function Nav() {
	return (
		<nav aria-label="メインナビゲーション">
			<Suspense fallback={<NavFallback />}>
				<NavLinks />
			</Suspense>
		</nav>
	);
}
