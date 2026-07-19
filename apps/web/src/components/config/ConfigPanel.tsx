"use client";

import { CommandMenu } from "@web/components/system";
import {
	applyReducedMotionAttribute,
	getReducedMotionPreference,
	setReducedMotionPreference,
} from "@web/lib/config";
import { C, font } from "@web/styles/tokens";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ITEMS = ["タイトルを見る", "アニメーション低減"] as const;

/**
 * SC-011 Config 本体（design §11.2/§11.3、spec SC-011、F-CFG-001/F-NAV-002）。
 * 設定は `localStorage` に保存し即時反映する（spec SC-011 §11.3）。利用不可時は既定値（OFF）のまま動作する。
 * SSR とクライアント初期表示のずれを避けるため、マウント前はチェック状態を未確定（false）で表示する
 * （layout.tsx の beforeInteractive スクリプトが実際の演出停止自体は先に反映済みのため、
 * この表示ラグは演出のちらつきには影響しない）。
 * 十字キー操作（spec SC-011 §11.4）は呼び出し側（`app/config/page.tsx`）の `SpatialNavRegion` が担う。
 * `CommandMenu` 自体の ▶ カーソルはマウスホバーのみで動く（キーボード選択時は
 * `data-roving-selected` の枠線表示に委ねる）。
 */
export function ConfigPanel() {
	const router = useRouter();
	const [selected, setSelected] = useState(0);
	const [reducedMotion, setReducedMotionState] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setReducedMotionState(getReducedMotionPreference() ?? false);
		setMounted(true);
	}, []);

	function toggleReducedMotion() {
		const next = !reducedMotion;
		setReducedMotionState(next);
		setReducedMotionPreference(next);
	}

	function handleSelect(index: number) {
		setSelected(index);
		if (index === 0) {
			router.push("/");
		} else {
			toggleReducedMotion();
		}
	}

	// 未マウント時は OS 設定（prefers-reduced-motion）に委ね、属性を明示的に外す
	// （getReducedMotionPreference が false を返す場合と区別するため、マウント後にのみ同期する）。
	useEffect(() => {
		if (!mounted) return;
		applyReducedMotionAttribute(reducedMotion);
	}, [mounted, reducedMotion]);

	return (
		<div className="flex flex-col gap-4">
			<CommandMenu
				items={ITEMS}
				selected={selected}
				onSelect={handleSelect}
				onHover={setSelected}
			/>
			<div
				style={{ fontFamily: font.mon, fontSize: "11px", color: C.muted }}
				className="flex flex-col gap-1.5 border-t border-arch-border-faint pt-3"
			>
				<div>
					タイトルを見る：TITLE 画面（
					<span style={{ color: C.cyan }}>/</span>）へ移動します。
				</div>
				<div>
					アニメーション低減：現在{" "}
					<span style={{ color: reducedMotion ? C.cyan : C.muted }}>
						{reducedMotion ? "ON" : "OFF"}
					</span>
					（雨・点滅・タイトル演出を停止）。
				</div>
			</div>
		</div>
	);
}
