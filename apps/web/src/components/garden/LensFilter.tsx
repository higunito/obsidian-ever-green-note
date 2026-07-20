"use client";

import {
	GARDEN_PERIOD_OPTIONS,
	GARDEN_STATUS_OPTIONS,
} from "@web/lib/garden-filters";
import { STATUS_LABEL } from "@web/styles/tokens";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface LensFilterProps {
	/** 絞り込み前の Garden 全体から算出した topic 候補一覧（design §5.4）。 */
	topics: readonly string[];
}

function pill(active: boolean): string {
	return `border px-1.5 py-0.5 font-dot text-[calc(10px*var(--font-scale))] transition-colors ${
		active
			? "border-arch-cyan bg-arch-cyan-faint text-arch-cyan"
			: "border-arch-border text-arch-muted"
	}`;
}

/**
 * Lens フィルタ（spec SC-002 §2.3、design §5.4）。topic/status は複数選択（OR）、
 * 更新時期は単一のプリセット期間。選択状態は URL クエリに保持し、Index/Map で共通適用する。
 * モバイル（<768px）は `FILTER ▼` トリガー＋ボトムシート化する（spec SC-002 §2.6 / SC-003 §3.2・§3.7）。
 */
export function LensFilter({ topics }: LensFilterProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [sheetOpen, setSheetOpen] = useState(false);

	const selectedTopics = new Set(
		(searchParams.get("topic") ?? "").split(",").filter(Boolean),
	);
	const selectedStatuses = new Set(
		(searchParams.get("status") ?? "").split(",").filter(Boolean),
	);
	const selectedPeriod = searchParams.get("period") ?? "";

	function updateParam(key: string, value: string | null) {
		const next = new URLSearchParams(searchParams.toString());
		if (value) next.set(key, value);
		else next.delete(key);
		const query = next.toString();
		router.push(query ? `${pathname}?${query}` : pathname);
	}

	function toggleInSet(key: string, current: Set<string>, value: string) {
		const next = new Set(current);
		if (next.has(value)) next.delete(value);
		else next.add(value);
		updateParam(key, next.size > 0 ? Array.from(next).join(",") : null);
	}

	const hasActiveFilter =
		selectedTopics.size > 0 ||
		selectedStatuses.size > 0 ||
		selectedPeriod !== "";

	const pills = (
		<>
			<span className="font-mon text-[calc(9px*var(--font-scale))] text-arch-muted">
				LENS:
			</span>
			{topics.map((topic) => (
				<button
					type="button"
					key={topic}
					onClick={() => toggleInSet("topic", selectedTopics, topic)}
					className={pill(selectedTopics.has(topic))}
				>
					{topic}
				</button>
			))}
			<span className="text-arch-border-faint">│</span>
			{GARDEN_STATUS_OPTIONS.map((status) => (
				<button
					type="button"
					key={status}
					onClick={() => toggleInSet("status", selectedStatuses, status)}
					className={pill(selectedStatuses.has(status))}
				>
					{STATUS_LABEL[status]}
				</button>
			))}
			<span className="text-arch-border-faint">│</span>
			{GARDEN_PERIOD_OPTIONS.map((opt) => (
				<button
					type="button"
					key={opt.value}
					onClick={() =>
						updateParam(
							"period",
							selectedPeriod === opt.value ? null : opt.value,
						)
					}
					className={pill(selectedPeriod === opt.value)}
				>
					{opt.label}
				</button>
			))}
			{hasActiveFilter ? (
				<button
					type="button"
					onClick={() => router.push(pathname)}
					className="font-mon text-[calc(9px*var(--font-scale))] text-arch-muted underline transition-colors hover:text-arch-cyan"
				>
					フィルタ解除
				</button>
			) : null}
		</>
	);

	return (
		<>
			<div className="hidden flex-wrap items-center gap-1.5 md:flex">
				{pills}
			</div>
			<div className="md:hidden">
				<button
					type="button"
					onClick={() => setSheetOpen(true)}
					className="font-mon text-[calc(10px*var(--font-scale))] text-arch-cyan"
				>
					FILTER ▼{hasActiveFilter ? " •" : ""}
				</button>
			</div>
			{sheetOpen ? (
				<div className="fixed inset-x-0 bottom-0 z-50 border-2 border-arch-border border-b-0 bg-arch-panel p-4">
					<div className="flex flex-wrap items-center gap-1.5">{pills}</div>
					<div className="mt-3 text-right">
						<button
							type="button"
							onClick={() => setSheetOpen(false)}
							className="font-mon text-[calc(10px*var(--font-scale))] text-arch-cyan"
						>
							▲ CLOSE
						</button>
					</div>
				</div>
			) : null}
		</>
	);
}
