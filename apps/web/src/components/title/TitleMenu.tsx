"use client";

import { CommandMenu } from "@web/components/system";
import { useFlashNavigate } from "@web/lib/use-flash-navigate";
import { C, fs } from "@web/styles/tokens";
import {
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

const MENU_ITEMS = ["START", "GARDEN", "ARTICLE", "OTHERS", "CONFIG"] as const;
const OTHERS_INDEX = 3;

const MENU_HREF: Partial<Record<number, string>> = {
	0: "/home",
	1: "/garden",
	2: "/articles",
	4: "/config",
};

const OTHERS_PANEL_CLOSE_MS = 200;

/**
 * OTHERS サブパネルの開閉アニメーション（spec SC-000 §0.3）。
 * `open=false` になっても即座にアンマウントせず、CSS アニメーション（globals.css の
 * `othersPanelIn`/`othersPanelOut`）が終わる分だけ遅延してから外す。reduced-motion 時は
 * アニメーションが無効化される（`arch-animated`）ため、`animationend` ではなくタイマーで
 * アンマウントタイミングを制御する（reduced-motion でも確実に閉じるため）。
 */
function OthersPanel({
	open,
	children,
}: {
	open: boolean;
	children: ReactNode;
}) {
	const [rendered, setRendered] = useState(open);

	useEffect(() => {
		if (open) {
			setRendered(true);
			return;
		}
		if (!rendered) return;
		const timer = window.setTimeout(
			() => setRendered(false),
			OTHERS_PANEL_CLOSE_MS,
		);
		return () => window.clearTimeout(timer);
	}, [open, rendered]);

	if (!rendered) return null;

	return (
		<div
			className="arch-animated relative min-w-[200px] py-1.5"
			style={{
				border: `2px solid ${C.border}`,
				background: C.panel,
				boxShadow: `inset 1px 1px 0 ${C.borderHi}, inset -1px -1px 0 ${C.borderSh}`,
				animation: `${open ? "othersPanelIn" : "othersPanelOut"} 0.18s ease-out forwards`,
			}}
		>
			<div
				aria-hidden
				className="pointer-events-none absolute inset-[3px]"
				style={{ border: `1px solid ${C.borderFaint}` }}
			/>
			{children}
		</div>
	);
}

const OTHERS_ITEMS = [
	{ gameName: "MAP", href: "/garden?view=map" },
	{ gameName: "ROUTE", href: "/route" },
	{ gameName: "ABOUT", href: "/about" },
	{ gameName: "SEARCH", href: "/search" },
] as const;

/**
 * SC-000 タイトル画面（design §11.3、spec SC-000）。`/` の常設ページとして表示する。
 * `OTHERS` 選択時は本体メニューの右側に残りの NAV 項目（design §3.3）へのサブパネルを開く。
 * サブパネル表示中は ↑↓ の対象がサブパネル側に切り替わる（spec SC-000 §0.3）。
 */
export function TitleMenu() {
	const rowRef = useRef<HTMLDivElement>(null);
	const [selected, setSelected] = useState(0);
	const [othersOpen, setOthersOpen] = useState(false);
	const [othersSelected, setOthersSelected] = useState(0);
	// 遷移確定ボタンのビビビ点滅演出（useFlashNavigate、lib/use-flash-navigate.ts）。
	// 本体メニュー／サブパネルはキー操作対象が別なので、点滅対象の状態も別インスタンスで持つ。
	const mainFlash = useFlashNavigate();
	const otherFlash = useFlashNavigate();

	const navigateTo = useCallback(
		(index: number) => {
			if (index === OTHERS_INDEX) {
				setOthersOpen((open) => !open);
				return;
			}
			setOthersOpen(false);
			const href = MENU_HREF[index];
			if (!href) return;
			mainFlash.navigate(String(index), href);
		},
		[mainFlash],
	);

	const navigateToOther = useCallback(
		(index: number) => {
			otherFlash.navigate(String(index), OTHERS_ITEMS[index].href);
		},
		[otherFlash],
	);

	// 右パネル表示中に枠外をクリックしたら閉じる（spec SC-000 §0.3 v1.9）。
	useEffect(() => {
		if (!othersOpen) return;
		function handlePointerDown(e: PointerEvent) {
			if (rowRef.current?.contains(e.target as Node)) return;
			setOthersOpen(false);
		}
		document.addEventListener("pointerdown", handlePointerDown);
		return () => document.removeEventListener("pointerdown", handlePointerDown);
	}, [othersOpen]);

	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (othersOpen) {
				if (e.key === "ArrowUp") {
					setOthersSelected((s) => Math.max(0, s - 1));
					return;
				}
				if (e.key === "ArrowDown") {
					setOthersSelected((s) => Math.min(OTHERS_ITEMS.length - 1, s + 1));
					return;
				}
				if (e.key === "Enter") {
					navigateToOther(othersSelected);
					return;
				}
				if (e.key === "ArrowLeft" || e.key === "Escape") {
					setOthersOpen(false);
				}
				return;
			}
			if (e.key === "ArrowUp") {
				setSelected((s) => Math.max(0, s - 1));
				return;
			}
			if (e.key === "ArrowDown") {
				setSelected((s) => Math.min(MENU_ITEMS.length - 1, s + 1));
				return;
			}
			if (e.key === "Enter") {
				navigateTo(selected);
			}
		}
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [selected, othersOpen, othersSelected, navigateTo, navigateToOther]);

	return (
		<div className="arch-animated flex flex-1 flex-col items-center justify-center p-10">
			<div className="mb-13 text-center">
				<div
					className="arch-animated mb-3 font-dot leading-tight"
					style={{
						fontSize: `clamp(${fs(24)}, 5.5vw, ${fs(52)})`,
						color: C.text,
						letterSpacing: "0.2em",
						textShadow: `0 0 30px ${C.cyanDim}`,
						animation: "archFadeIn 0.9s ease-out",
					}}
				>
					思考アーカイブ
				</div>
				<div
					className="font-mon"
					style={{
						fontSize: `clamp(${fs(10)}, 1.8vw, ${fs(13)})`,
						color: C.cyan,
						letterSpacing: "0.35em",
						animation: "archGlow 3s ease-in-out infinite",
					}}
				>
					THOUGHT ARCHIVE — 1999
				</div>
			</div>

			<div
				className="mb-9 h-px w-40"
				style={{
					background: `linear-gradient(to right, transparent, ${C.border}, transparent)`,
				}}
			/>

			{/*
			 * rowRef は position:relative のみで、右パネル（OTHERS）は min-[640px]（PC 幅）では
			 * position:absolute にして通常フローから外す。こうすることで rowRef 自身の幅は常に
			 * 本体メニューだけで決まり、右パネルの開閉で rowRef の幅（＝親の items-center による
			 * 水平中央位置）が変わらない＝本体メニューの位置が絶対に動かない。モバイル幅では
			 * 右パネルは通常フローのまま本体メニューの下に積む（横方向の中央位置には影響しない）。
			 */}
			<div ref={rowRef} className="relative flex flex-col items-center">
				<div
					className="relative min-w-[clamp(260px,50vw,340px)] py-1.5"
					style={{
						border: `2px solid ${C.border}`,
						background: C.panel,
						boxShadow: `inset 1px 1px 0 ${C.borderHi}, inset -1px -1px 0 ${C.borderSh}`,
					}}
				>
					<div
						aria-hidden
						className="pointer-events-none absolute inset-[3px]"
						style={{ border: `1px solid ${C.borderFaint}` }}
					/>
					<CommandMenu
						items={MENU_ITEMS}
						selected={selected}
						onSelect={navigateTo}
						onHover={setSelected}
						active={!othersOpen}
						flashingIndex={
							mainFlash.flashingKey !== null
								? Number(mainFlash.flashingKey)
								: null
						}
					/>
				</div>

				{/* max-width/max-height を othersOpen で遷移させて開閉をアニメーションさせる。 */}
				<div
					className="mt-3.5 overflow-hidden transition-[max-width,max-height] duration-200 ease-out min-[640px]:absolute min-[640px]:top-0 min-[640px]:left-[calc(100%_+_14px)] min-[640px]:mt-0"
					style={
						othersOpen
							? { maxWidth: 320, maxHeight: 320 }
							: { maxWidth: 0, maxHeight: 0 }
					}
				>
					<OthersPanel open={othersOpen}>
						<CommandMenu
							items={OTHERS_ITEMS.map((item) => item.gameName)}
							selected={othersSelected}
							onSelect={navigateToOther}
							onHover={setOthersSelected}
							flashingIndex={
								otherFlash.flashingKey !== null
									? Number(otherFlash.flashingKey)
									: null
							}
						/>
					</OthersPanel>
				</div>
			</div>

			<div
				className="mt-5 font-mon opacity-40"
				style={{
					fontSize: fs(9),
					color: C.muted,
					letterSpacing: "0.12em",
				}}
			>
				↑↓ MOVE　　ENTER・CLICK SELECT
			</div>

			<div
				className="fixed right-4 bottom-3 font-mon opacity-45"
				style={{
					fontSize: fs(10),
					color: C.muted,
					letterSpacing: "0.08em",
				}}
			>
				ver 1.99
			</div>
		</div>
	);
}
