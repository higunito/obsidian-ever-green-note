import { NAV_ITEMS } from "@web/lib/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { NavLinks } from "./NavLinks";

// `useSearchParams` を使う `NavLinks` を Suspense でラップする（Next.js の要件）。
// フォールバックはハイライト無しの同一リンク一覧（初期表示のレイアウトシフトを避ける）。
function NavFallback() {
	return (
		<ul className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-2">
			{NAV_ITEMS.map((item) => (
				<li key={item.href}>
					<Link
						href={item.href}
						className="group inline-flex items-baseline transition-colors"
					>
						<span className="font-dot text-[calc(12px*var(--font-scale))] tracking-[0.06em] text-arch-text group-hover:text-arch-cyan">
							{item.gameName}
						</span>
					</Link>
				</li>
			))}
		</ul>
	);
}

interface NavProps {
	/** アクティブ項目を十字キーの既定選択にする場合 true（design §9.6.2 v1.19、SC-009 About 専用）。 */
	markActiveAsDefault?: boolean;
}

/**
 * 画面間ナビ（§9.1）。各項目はゲーム内名称のみを表示する（design §3.3 v1.26）。
 * 対応表の単一情報源は lib/navigation.ts（design §3.3）。現在ページはハイライトで示す。
 */
export function Nav({ markActiveAsDefault = false }: NavProps = {}) {
	return (
		<nav aria-label="メインナビゲーション">
			<Suspense fallback={<NavFallback />}>
				<NavLinks markActiveAsDefault={markActiveAsDefault} />
			</Suspense>
		</nav>
	);
}
