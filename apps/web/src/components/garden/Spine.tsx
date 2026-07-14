"use client";

import { font } from "@web/styles/tokens";
import type { StackFileEntry } from "./StackBreadcrumb";
import { useStackNavigation } from "./StackNavigationProvider";

type SpineProps = StackFileEntry;

/**
 * 折りたたまれた FileWindow（背表紙、spec SC-004 §4.3、design §9.2、figma `Spine` を正準）。
 * クリックで復帰（Stack の先頭へ挿入して即アクティブ化、design §5.2 の `openNote`）。
 */
export function Spine({ slug, file, title }: SpineProps) {
	const { open } = useStackNavigation();

	return (
		<button
			type="button"
			onClick={() => open(slug)}
			title={title}
			className="flex h-full w-[22px] shrink-0 items-center justify-center overflow-hidden border border-arch-border bg-[rgba(11,26,43,0.7)] transition-colors hover:bg-[rgba(20,50,58,0.9)]"
		>
			<span
				className="whitespace-nowrap text-arch-cyan text-[9px] tracking-[0.08em]"
				style={{ fontFamily: font.mon, transform: "rotate(-90deg)" }}
			>
				{file}
			</span>
		</button>
	);
}
