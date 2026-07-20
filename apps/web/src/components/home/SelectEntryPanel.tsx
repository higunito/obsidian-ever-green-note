"use client";

import { Window } from "@web/components/system";
import type { ReactNode } from "react";
import { useState } from "react";
import { EntryLinkModal } from "./EntryLinkModal";

const TABS = [
	"最近更新された記録",
	"3つの入り口から探索する",
	"思考マップを開く",
	"記事を読む",
] as const;

// FRAGMENTS と THREE DOORS を同じ大きさで切替表示するための固定高さ（spec SC-001 §1.2）。
const PANEL_SIZE_CLASS = "h-[360px] overflow-y-auto";

function tabClass(active: boolean): string {
	return `cursor-pointer border px-3 py-2 font-dot text-[calc(11px*var(--font-scale))] transition-colors ${
		active
			? "border-arch-cyan bg-arch-cyan-faint text-arch-cyan"
			: "border-arch-border text-arch-muted hover:text-arch-cyan"
	}`;
}

interface SelectEntryPanelProps {
	/** タブ0「最近更新された記録」選択時に表示する FRAGMENTS パネル。 */
	fragmentsContent: ReactNode;
	/** タブ1「3つの入り口から探索する」選択時に表示する THREE DOORS パネル。 */
	threeDoorsContent: ReactNode;
}

/**
 * SC-001 の `SELECT ENTRY`（spec SC-001 §1.2/§1.4、design §9.1 `SelectEntryPanel`）。
 * 旧 STATUS/THREE DOORS の設置箇所に表示する 1 行タブ。既定選択は「最近更新された記録」。
 * MAP/ARTICLE タブは画面遷移せず、選択時にボタン列右側へ `EntryLinkModal` を出すだけに留める
 * （実際の遷移はモーダルのクリックが担う）。
 */
export function SelectEntryPanel({
	fragmentsContent,
	threeDoorsContent,
}: SelectEntryPanelProps) {
	const [selected, setSelected] = useState(0);

	return (
		<div className="flex flex-col gap-3.5">
			<Window title="SELECT ENTRY">
				<div className="flex flex-wrap gap-2 p-2.5">
					{TABS.map((tab, i) => (
						<button
							key={tab}
							type="button"
							onClick={() => setSelected(i)}
							className={tabClass(i === selected)}
						>
							{tab}
						</button>
					))}
				</div>
			</Window>

			{selected === 0 ? (
				<div className={PANEL_SIZE_CLASS}>{fragmentsContent}</div>
			) : null}
			{selected === 1 ? (
				<div className={PANEL_SIZE_CLASS}>{threeDoorsContent}</div>
			) : null}
			{selected === 2 ? (
				<div
					className={`${PANEL_SIZE_CLASS} flex items-start justify-center pt-6`}
				>
					<EntryLinkModal label="思考マップへ" href="/garden?view=map" />
				</div>
			) : null}
			{selected === 3 ? (
				<div
					className={`${PANEL_SIZE_CLASS} flex items-start justify-center pt-6`}
				>
					<EntryLinkModal label="記事一覧へ" href="/essays" />
				</div>
			) : null}
		</div>
	);
}
