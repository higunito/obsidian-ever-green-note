"use client";

import { CommandMenu } from "@web/components/system";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ITEMS = [
	"最近更新された記録（FRAGMENTS / Garden）",
	"3つの入口から探索する（Three Doors）",
	"思考マップを開く（MAP）",
	"記事を読む（ARTICLE / Essays）",
] as const;

// レスポンシブ対応でモバイル/デスクトップ 2 系統のレイアウトを CSS 表示切替のみで出し分けているため
// （どちらも DOM 上に存在する）、`data-three-doors` は複数存在しうる。実際に表示中の要素だけへスクロールする。
function scrollToThreeDoors(): void {
	const targets = document.querySelectorAll<HTMLElement>("[data-three-doors]");
	const target = Array.from(targets).find((el) => el.offsetParent !== null);
	target?.scrollIntoView({ behavior: "smooth", block: "center" });
}

/**
 * SELECT ENTRY メニュー（spec SC-001 §1.2/§1.4）。項目選択で各画面へ遷移する。
 * Three Doors はページ内に既に表示されているため、選択時はそこへスクロールするだけにする
 * （spec 「3つの入口から探索する（Three Doors）→ ページ内 Three Doors へ」）。
 * Title と異なり Home 上では ↑↓ のグローバルキー捕捉は行わない（ページスクロールと衝突するため）。
 */
export function SelectEntryMenu() {
	const router = useRouter();
	const [selected, setSelected] = useState(0);

	function handleSelect(index: number) {
		setSelected(index);
		switch (index) {
			case 0:
				router.push("/garden");
				break;
			case 1:
				scrollToThreeDoors();
				break;
			case 2:
				router.push("/garden?view=map");
				break;
			case 3:
				router.push("/essays");
				break;
		}
	}

	return (
		<CommandMenu
			items={ITEMS}
			selected={selected}
			onSelect={handleSelect}
			onHover={setSelected}
		/>
	);
}
