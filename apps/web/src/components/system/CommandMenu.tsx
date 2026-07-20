"use client";

import { C, font, fs } from "@web/styles/tokens";

interface CommandMenuProps {
	items: readonly string[];
	/** 選択中インデックス。選択状態は呼び出し側（親）が保持する。 */
	selected: number;
	onSelect: (index: number) => void;
	onHover?: (index: number) => void;
	/** このメニューが現在キー操作の対象か。false の間は選択カーソル（▶・強調表示）を出さない
	 * （title の OTHERS 表示中に左メニューへカーソルが残る見た目を避けるため、§9.1 v1.9）。既定 true。 */
	active?: boolean;
	/** 遷移確定演出中の項目インデックス。一致する項目をビビビと点滅させる（spec SC-000 §0.3 v1.9）。 */
	flashingIndex?: number | null;
	/** true の場合、先頭項目（index 0）を十字キーの既定選択にする（`data-roving-default`、design §9.6.2 v1.18）。既定 false。 */
	markDefault?: boolean;
}

/**
 * `▶` セレクタ付き縦メニュー（§9.1、figma `CMenu` を正準）。
 * ↑↓/Enter のキー操作は利用側の画面が担い、本コンポーネントはクリック/ホバーのみ扱う。
 */
export function CommandMenu({
	items,
	selected,
	onSelect,
	onHover,
	active = true,
	flashingIndex = null,
	markDefault = false,
}: CommandMenuProps) {
	return (
		<div>
			{items.map((item, i) => {
				const on = active && i === selected;
				const flashing = flashingIndex === i;
				return (
					<button
						type="button"
						key={item}
						data-roving-default={markDefault && i === 0 ? "true" : undefined}
						onMouseEnter={() => onHover?.(i)}
						onClick={() => onSelect(i)}
						className={flashing ? "arch-animated" : undefined}
						style={{
							display: "flex",
							alignItems: "center",
							width: "100%",
							textAlign: "left",
							padding: "7px 16px",
							cursor: "pointer",
							fontFamily: font.dot,
							fontSize: fs(12),
							color: on || flashing ? C.cyan : C.text,
							textShadow: on || flashing ? `0 0 10px ${C.cyan}` : "none",
							background: on || flashing ? C.cyanFaint : "transparent",
							border: "none",
							borderLeft: `2px solid ${on || flashing ? C.cyan : "transparent"}`,
							transition: "all 0.1s",
							letterSpacing: "0.04em",
							animation: flashing ? "navFlash 0.3s steps(1) 1" : "none",
						}}
					>
						<span
							className={on ? "arch-animated" : undefined}
							style={{
								width: "18px",
								color: C.yellow,
								flexShrink: 0,
								animation: on ? "selBlink 1s step-end infinite" : "none",
							}}
						>
							{on || flashing ? "▶" : "　"}
						</span>
						{item}
					</button>
				);
			})}
		</div>
	);
}
