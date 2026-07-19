"use client";

import { NAV_ITEMS, type NavItem } from "@web/lib/navigation";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

// FRAGMENTS(`/garden`)と MAP(`/garden?view=map`)のように同じパスを共有する項目は
// `view` クエリの一致で判定する（一致しない項目は他方が代わりにハイライトされる）。
function isActive(
	item: NavItem,
	pathname: string,
	currentView: string | null,
): boolean {
	const [itemPath, itemQuery] = item.href.split("?");
	if (pathname !== itemPath) return false;
	const itemView = itemQuery
		? new URLSearchParams(itemQuery).get("view")
		: null;
	return itemView === currentView;
}

export function NavLinks() {
	const pathname = usePathname();
	const currentView = useSearchParams().get("view");

	return (
		<ul className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-2">
			{NAV_ITEMS.map((item) => {
				const active = isActive(item, pathname, currentView);
				return (
					<li key={item.href}>
						<Link
							href={item.href}
							aria-current={active ? "page" : undefined}
							className="group inline-flex items-baseline gap-1.5 transition-colors"
						>
							<span
								className={`font-dot text-[12px] tracking-[0.06em] group-hover:text-arch-cyan ${
									active ? "text-arch-cyan" : "text-arch-text"
								}`}
							>
								{item.gameName}
							</span>
							<span
								className={`font-mon text-[9px] tracking-[0.08em] ${
									active ? "text-arch-cyan" : "text-arch-muted"
								}`}
							>
								{item.label}
							</span>
						</Link>
					</li>
				);
			})}
		</ul>
	);
}
