"use client";

import { CommandMenu } from "@web/components/system";
import { C } from "@web/styles/tokens";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const MENU_ITEMS = [
	"START",
	"FRAGMENTS",
	"ARTICLE",
	"OTHERS",
	"CONFIG",
] as const;
const OTHERS_INDEX = 3;

const MENU_HREF: Partial<Record<number, string>> = {
	0: "/home",
	1: "/garden",
	2: "/essays",
	4: "/config",
};

const OTHERS_ITEMS = [
	{ gameName: "MAP", href: "/garden?view=map" },
	{ gameName: "ROUTE", href: "/paths" },
	{ gameName: "INFLUENCE", href: "/collections" },
	{ gameName: "PROJECTS", href: "/projects" },
	{ gameName: "PROFILE", href: "/about" },
	{ gameName: "SEARCH", href: "/search" },
] as const;

/**
 * SC-000 タイトル画面（design §11.3、spec SC-000）。`/` の常設ページとして表示する。
 * `OTHERS` 選択時は本体メニューの右側に残りの NAV 項目（design §3.3）へのサブパネルを開く。
 * サブパネル表示中は ↑↓ の対象がサブパネル側に切り替わる（spec SC-000 §0.3）。
 */
export function TitleMenu() {
	const router = useRouter();
	const [selected, setSelected] = useState(0);
	const [othersOpen, setOthersOpen] = useState(false);
	const [othersSelected, setOthersSelected] = useState(0);

	const navigateTo = useCallback(
		(index: number) => {
			if (index === OTHERS_INDEX) {
				setOthersOpen((open) => !open);
				return;
			}
			setOthersOpen(false);
			const href = MENU_HREF[index];
			if (href) router.push(href);
		},
		[router],
	);

	const navigateToOther = useCallback(
		(index: number) => {
			router.push(OTHERS_ITEMS[index].href);
		},
		[router],
	);

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
						fontSize: "clamp(24px, 5.5vw, 52px)",
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
						fontSize: "clamp(10px, 1.8vw, 13px)",
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

			<div className="flex flex-col items-center gap-3.5 min-[640px]:flex-row min-[640px]:items-start">
				<div
					className="relative min-w-[clamp(260px,50vw,340px)] py-1.5"
					style={{
						border: `1px solid ${C.border}`,
						background: C.panel,
						backdropFilter: "blur(10px)",
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
					/>
				</div>

				{othersOpen ? (
					<div
						className="relative min-w-[200px] py-1.5"
						style={{
							border: `1px solid ${C.border}`,
							background: C.panel,
							backdropFilter: "blur(10px)",
						}}
					>
						<div
							aria-hidden
							className="pointer-events-none absolute inset-[3px]"
							style={{ border: `1px solid ${C.borderFaint}` }}
						/>
						<CommandMenu
							items={OTHERS_ITEMS.map((item) => item.gameName)}
							selected={othersSelected}
							onSelect={navigateToOther}
							onHover={setOthersSelected}
						/>
					</div>
				) : null}
			</div>

			<div
				className="mt-5 font-mon opacity-40"
				style={{
					fontSize: "9px",
					color: C.muted,
					letterSpacing: "0.12em",
				}}
			>
				↑↓ MOVE　　ENTER・CLICK SELECT
			</div>

			<div
				className="fixed right-4 bottom-3 font-mon opacity-45"
				style={{
					fontSize: "10px",
					color: C.muted,
					letterSpacing: "0.08em",
				}}
			>
				ver 1.99
			</div>
		</div>
	);
}
