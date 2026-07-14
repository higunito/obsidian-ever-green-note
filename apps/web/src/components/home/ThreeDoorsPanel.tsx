"use client";

import type { DoorItem } from "@web/components/doors";
import { ThreeDoors } from "@web/components/doors";
import { selectThreeDoors } from "@web/lib/three-doors";
import type { Article } from "@web/types/content";
import { useCallback, useEffect, useState } from "react";

interface ThreeDoorsPanelProps {
	/** SSR で日替わりシードにより選定済みの初期表示（design §5.5 手順5）。 */
	initialDoors: readonly DoorItem[];
	/** 引き直し時に再選定するための全記事（selectThreeDoors が Garden/publish 等を絞り込む）。 */
	articles: readonly Article[];
}

const HISTORY_KEY = "ta_recent_doors";
const HISTORY_LIMIT = 9;
const REROLL_DELAY_MS = 150;

function readHistory(): string[] {
	try {
		const raw = window.sessionStorage.getItem(HISTORY_KEY);
		if (!raw) return [];
		const parsed: unknown = JSON.parse(raw);
		return Array.isArray(parsed)
			? parsed.filter((v): v is string => typeof v === "string")
			: [];
	} catch {
		return [];
	}
}

function writeHistory(slugs: readonly string[]): void {
	try {
		window.sessionStorage.setItem(
			HISTORY_KEY,
			JSON.stringify(slugs.slice(-HISTORY_LIMIT)),
		);
	} catch {
		// セッションストレージ利用不可時は履歴を諦め、直近除外なしで抽選を続ける。
	}
}

/**
 * THREE DOORS の状態管理（design §5.5、spec SC-001 §1.3/§1.5）。
 * 直近表示履歴はセッション/クッキー相当（sessionStorage）に保持し URL には載せない（design §11.2）。
 */
export function ThreeDoorsPanel({
	initialDoors,
	articles,
}: ThreeDoorsPanelProps) {
	const [doors, setDoors] = useState<readonly DoorItem[]>(initialDoors);
	const [loading, setLoading] = useState(false);

	// 初回表示分を「直近表示」として履歴に積むだけの、マウント時一度きりの処理。
	// biome-ignore lint/correctness/useExhaustiveDependencies: initialDoors はマウント時の初期値のみ使う
	useEffect(() => {
		const history = readHistory();
		writeHistory([...history, ...initialDoors.map((d) => d.slug)]);
	}, []);

	const handleReroll = useCallback(() => {
		setLoading(true);
		window.setTimeout(() => {
			const history = readHistory();
			const next = selectThreeDoors(articles, Math.random, history);
			writeHistory([...history, ...next.map((d) => d.slug)]);
			setDoors(next);
			setLoading(false);
		}, REROLL_DELAY_MS);
	}, [articles]);

	return <ThreeDoors doors={doors} onReroll={handleReroll} loading={loading} />;
}
