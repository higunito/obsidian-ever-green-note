"use client";

import { C, font } from "@web/styles/tokens";
import { useState } from "react";
import type { StackFileEntry } from "./StackBreadcrumb";
import { useStackNavigation } from "./StackNavigationProvider";

interface MobileStackBarProps {
	/** spine→stack の順（= 経路の履歴、design §5.2）。 */
	history: readonly StackFileEntry[];
}

/**
 * モバイルの Stack 操作バー（spec SC-004 §4.4）。「← 戻る」（1つ戻す、空なら HOME）と
 * 「HISTORY ▼」（積み木の履歴ドロワー、タップでジャンプ）。
 */
export function MobileStackBar({ history }: MobileStackBarProps) {
	const { goBack, open } = useStackNavigation();
	const [drawerOpen, setDrawerOpen] = useState(false);

	return (
		<div className="relative flex-shrink-0 md:hidden">
			<div className="sticky top-0 z-20 flex items-center gap-2 border-b border-arch-border bg-arch-panel-dark px-3 py-2">
				<button
					type="button"
					onClick={goBack}
					className="font-mon text-xs text-arch-cyan"
				>
					← 戻る
				</button>
				<button
					type="button"
					onClick={() => setDrawerOpen((v) => !v)}
					className="ml-auto font-mon text-[9px] text-arch-muted"
				>
					HISTORY ▼
				</button>
			</div>
			{drawerOpen ? (
				<div
					className="fixed top-10 right-0 z-30 w-[200px] border border-arch-border py-2 backdrop-blur-md"
					style={{ background: C.panel }}
				>
					{history.map((entry) => (
						<button
							type="button"
							key={entry.slug}
							onClick={() => {
								open(entry.slug);
								setDrawerOpen(false);
							}}
							className="block w-full border-b border-arch-border-faint px-3.5 py-1.5 text-left font-mon text-[10px] text-arch-cyan"
							style={{ fontFamily: font.mon }}
						>
							{entry.file}
						</button>
					))}
				</div>
			) : null}
		</div>
	);
}
