"use client";

import { CommandMenu } from "@web/components/system";
import { hasSeenTitle, markTitleSeen } from "@web/lib/title";
import { C } from "@web/styles/tokens";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const MENU_ITEMS = ["START", "FRAGMENTS", "CONFIG"] as const;

/**
 * SC-000 タイトルオーバーレイ ＋ SC-001 の「◀ TITLE」手動再生導線（design §11.3、spec SC-000）。
 * 初回のみ自動表示、以降は `◀ TITLE` クリックで手動再生できる（spec SC-001 §1.4）。
 * Config（Phase 9）からの再生は `lib/title.ts` の `triggerTitleReplay()` を呼んで `/` へ遷移すればよい
 * （このコンポーネントのマウント時判定と同じ経路で再生される）。
 * `RANDOM FRAGMENT` は Phase 9 レビューで不要と判断し削除（spec SC-000 §0.2 v1.3）。
 * 旧 `NEW EXPLORATION`/`CONTINUE` はどちらもホーム表示のみで動きの区別が無く紛らわしかったため、
 * `START` 1 項目に統合した（同 v1.3）。
 */
export function TitleGate() {
	const router = useRouter();
	const [visible, setVisible] = useState(false);
	const [selected, setSelected] = useState(0);

	useEffect(() => {
		if (!hasSeenTitle()) setVisible(true);
	}, []);

	const dismiss = useCallback(() => {
		markTitleSeen();
		setVisible(false);
	}, []);

	const navigateTo = useCallback(
		(index: number) => {
			dismiss();
			if (index === 1) {
				router.push("/garden"); // FRAGMENTS
			} else if (index === 2) {
				router.push("/config"); // CONFIG
			}
			// index 0（START）はホーム表示のみで追加の遷移はない
		},
		[dismiss, router],
	);

	useEffect(() => {
		if (!visible) return;
		function handleKeyDown(e: KeyboardEvent) {
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
				return;
			}
			// 任意キーは演出スキップ（spec SC-000 §0.3/§0.4）
			dismiss();
		}
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [visible, selected, navigateTo, dismiss]);

	return (
		<>
			{visible ? null : (
				<div className="fixed top-3 left-3.5 z-20">
					<button
						type="button"
						onClick={() => setVisible(true)}
						className="font-mon text-[10px] tracking-[0.08em] text-arch-muted transition-colors hover:text-arch-cyan"
					>
						◀ TITLE
					</button>
				</div>
			)}
			{visible ? (
				<div
					className="arch-animated fixed inset-0 z-50 flex flex-col items-center justify-center p-10"
					style={{ background: C.bg, animation: "archFadeIn 0.4s ease-out" }}
				>
					{/* 背景クリックで演出スキップ（spec SC-000 §0.3/§0.4）。メニュー本体はこの上に重ねて
					    表示し、そちら側のクリックはこのボタンまで届かない。キー操作は下の window keydown
					    が担うため、tab 順には含めない。 */}
					<button
						type="button"
						tabIndex={-1}
						aria-label="演出をスキップする"
						onClick={dismiss}
						className="absolute inset-0 h-full w-full cursor-default"
					/>
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
							className="arch-animated mb-2 font-mon"
							style={{
								fontSize: "clamp(10px, 1.8vw, 13px)",
								color: C.cyan,
								letterSpacing: "0.35em",
								animation: "archGlow 3s ease-in-out infinite",
							}}
						>
							THOUGHT ARCHIVE — 1999
						</div>
						<div
							className="font-dot"
							style={{
								fontSize: "clamp(9px, 1.3vw, 11px)",
								color: C.muted,
								letterSpacing: "0.1em",
							}}
						>
							忘れられた個人用知識探索ソフトウェア
						</div>
					</div>

					<div
						className="mb-9 h-px w-40"
						style={{
							background: `linear-gradient(to right, transparent, ${C.border}, transparent)`,
						}}
					/>

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
			) : null}
		</>
	);
}
