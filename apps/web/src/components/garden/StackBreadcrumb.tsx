"use client";

import { NavBack } from "@web/components/system";
import { useStackNavigation } from "./StackNavigationProvider";

export interface StackFileEntry {
	slug: string;
	file: string;
	title: string;
}

interface StackBreadcrumbProps {
	spine: readonly StackFileEntry[];
	stack: readonly StackFileEntry[];
	active: string;
}

/**
 * パンくず（spec SC-004 §4.3、design §5.2、figma `Breadcrumb` を正準）。
 * spine 群 ▸ stack 群の順で表示し、アクティブカラムを強調する。クリックでジャンプ（`open()`）。
 */
export function StackBreadcrumb({
	spine,
	stack,
	active,
}: StackBreadcrumbProps) {
	const { open } = useStackNavigation();

	return (
		<div className="flex flex-wrap items-center gap-1.5 border-b-2 border-arch-border bg-arch-panel-dark px-3.5 py-1.5">
			<NavBack label="◀ HOME" href="/home" />
			<span className="text-arch-border-faint">│</span>
			{spine.map((entry) => (
				<span key={entry.slug} className="flex items-center gap-1">
					<button
						type="button"
						onClick={() => open(entry.slug)}
						className="font-mon text-[10px] text-arch-muted opacity-50 transition-opacity hover:text-arch-cyan hover:opacity-100"
					>
						{entry.file}
					</button>
					<span className="text-arch-border-faint">▸</span>
				</span>
			))}
			{stack.map((entry, i) => (
				<span key={entry.slug} className="flex items-center gap-1">
					<button
						type="button"
						onClick={() => open(entry.slug)}
						className="font-mon text-[10px]"
						style={{
							color:
								entry.slug === active
									? "var(--color-arch-cyan)"
									: "var(--color-arch-muted)",
							textShadow:
								entry.slug === active
									? "0 0 6px var(--color-arch-cyan)"
									: "none",
						}}
					>
						{entry.file}
					</button>
					{i < stack.length - 1 ? (
						<span className="text-arch-border-faint">▸</span>
					) : null}
				</span>
			))}
		</div>
	);
}
