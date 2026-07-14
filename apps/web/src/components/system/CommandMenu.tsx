"use client";

import { C, font } from "@web/styles/tokens";

interface CommandMenuProps {
	items: readonly string[];
	/** 選択中インデックス。選択状態は呼び出し側（親）が保持する。 */
	selected: number;
	onSelect: (index: number) => void;
	onHover?: (index: number) => void;
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
}: CommandMenuProps) {
	return (
		<div>
			{items.map((item, i) => {
				const on = i === selected;
				return (
					<button
						type="button"
						key={item}
						onMouseEnter={() => onHover?.(i)}
						onClick={() => onSelect(i)}
						style={{
							display: "flex",
							alignItems: "center",
							width: "100%",
							textAlign: "left",
							padding: "7px 16px",
							cursor: "pointer",
							fontFamily: font.dot,
							fontSize: "12px",
							color: on ? C.cyan : C.text,
							textShadow: on ? `0 0 10px ${C.cyan}` : "none",
							background: on ? C.cyanFaint : "transparent",
							border: "none",
							borderLeft: `2px solid ${on ? C.cyan : "transparent"}`,
							transition: "all 0.1s",
							letterSpacing: "0.04em",
						}}
					>
						<span style={{ width: "18px", color: C.cyan, flexShrink: 0 }}>
							{on ? "▶" : "　"}
						</span>
						{item}
					</button>
				);
			})}
		</div>
	);
}
