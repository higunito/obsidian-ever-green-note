"use client";

import { StatusPanel } from "@web/components/system";
import { useEffect, useState } from "react";

interface LiveStatusPanelProps {
	/** 直近更新の Garden ノートから導出した現在のトピック（design §9.1 Home 内 `StatusWin`）。 */
	currentTopic?: string;
}

function formatDatetime(date: Date): string {
	const pad = (n: number) => n.toString().padStart(2, "0");
	return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} / ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * STATUS 窓（spec SC-001 §1.2）。日時はクライアントの現在時刻を表示する（システム時計の演出）。
 * SSR とクライアント初期表示のずれを避けるため、マウント前は `----.--.-- / --:--` を表示する。
 */
export function LiveStatusPanel({ currentTopic }: LiveStatusPanelProps) {
	const [now, setNow] = useState<Date | null>(null);

	useEffect(() => {
		setNow(new Date());
		const id = window.setInterval(() => setNow(new Date()), 30_000);
		return () => window.clearInterval(id);
	}, []);

	return (
		<StatusPanel
			datetime={now ? formatDatetime(now) : "----.--.-- / --:--"}
			currentTopic={currentTopic}
		/>
	);
}
