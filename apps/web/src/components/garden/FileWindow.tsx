"use client";

import { Badge, NoteBody, Tag } from "@web/components/notes";
import { C, font, fs } from "@web/styles/tokens";
import type { Article, ArticleLayer } from "@web/types/content";
import type { MouseEvent } from "react";
import { LocalMap, type LocalMapNeighbor } from "./LocalMap";
import { useStackNavigation } from "./StackNavigationProvider";

export interface BacklinkEntry {
	slug: string;
	title: string;
	layer: ArticleLayer;
}

interface FileWindowProps {
	article: Article;
	/** 擬似ファイル名（graph.json 由来、design §9.4）。 */
	file: string;
	isActive: boolean;
	backlinks: readonly BacklinkEntry[];
	localMapNeighbors: readonly LocalMapNeighbor[];
	/** モバイルでは常に画面いっぱいの1カード、PC ではアクティブ列のみ横幅を広げる（spec SC-004 §4.3/§4.4）。 */
	className?: string;
}

/**
 * Stack の1カラム（`FILE 0X`、spec SC-004 §4.2、design §9.2、figma `FileWindow` を正準）。
 * 本文リンク／Backlinks／LocalMap のクリックはすべて `open()` に委ねる（design §5.2）。
 * アクティブ化はパンくず・spine・履歴ドロワー経由のみで行う（spec SC-004 §4.5 に明記された導線のみを実装し、
 * figma プロトタイプにあった「カラムの空白をクリックしてアクティブ化」は a11y 上の理由で採用しない）。
 */
export function FileWindow({
	article,
	file,
	isActive,
	backlinks,
	localMapNeighbors,
	className,
}: FileWindowProps) {
	const { open } = useStackNavigation();

	function handleBodyClick(e: MouseEvent<HTMLDivElement>) {
		const target = (e.target as HTMLElement).closest<HTMLElement>(
			"[data-wikilink]",
		);
		if (!target) return;
		e.preventDefault();
		e.stopPropagation();
		const slug = target.getAttribute("data-wikilink");
		if (slug) open(slug);
	}

	return (
		<div
			className={`relative h-full w-full overflow-y-auto border-2 transition-all ${
				isActive
					? "border-arch-cyan bg-arch-panel shadow-[inset_1px_1px_0_var(--color-arch-border-hi),inset_-1px_-1px_0_var(--color-arch-border-sh),0_0_28px_var(--color-arch-cyan-dim)]"
					: "border-arch-border bg-arch-panel-dark shadow-[inset_1px_1px_0_var(--color-arch-border-hi),inset_-1px_-1px_0_var(--color-arch-border-sh)]"
			} ${className ?? ""}`}
		>
			<div
				aria-hidden
				className="pointer-events-none absolute inset-[3px] z-0 border border-arch-border-faint"
			/>
			{/* タイトルバー */}
			<div
				className="sticky top-0 z-10 flex items-center gap-2 border-b border-arch-border bg-arch-panel-dark px-2.5 py-1"
				style={{ fontFamily: font.mon, fontSize: fs(11), color: C.cyanDim }}
			>
				<span style={{ opacity: 0.35 }}>▪</span>
				<span>{file}</span>
				<span className="text-arch-border-faint">│</span>
				<span className="overflow-hidden text-ellipsis whitespace-nowrap font-dot text-[calc(10px*var(--font-scale))] text-arch-text">
					{article.title}
				</span>
			</div>
			{/* ヘッダ */}
			<div className="border-b border-arch-border-faint px-3.5 py-2">
				<div className="flex flex-wrap items-center gap-1.5">
					{article.status ? <Badge status={article.status} /> : null}
					{article.topics.map((topic) => (
						<Tag key={topic} label={topic} />
					))}
					<span className="ml-auto font-mon text-[calc(9px*var(--font-scale))] text-arch-muted">
						updated {article.updated}
					</span>
				</div>
			</div>
			{/* 本文：bodyHtml 内の実際のインタラクティブ要素は content-gen が出力した
			    <a data-wikilink> であり、キーボード操作可能な本物のリンク。ここでの onClick は
			    その上で発生したクリックをイベント委譲で受け取るだけで、div 自体を新たな
			    マウス専用の操作対象にするものではない。 */}
			{/* biome-ignore lint/a11y/noStaticElementInteractions: 実体は子の <a> へのイベント委譲 */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: 子の <a> が既にキーボード操作可能 */}
			<div onClick={handleBodyClick} className="relative z-[1] px-3.5 py-4">
				<NoteBody html={article.bodyHtml} />
			</div>
			{/* Backlinks */}
			{backlinks.length > 0 ? (
				<div className="border-t border-arch-border-faint px-3.5 py-2.5">
					<div className="mb-1.5 font-mon text-[calc(9px*var(--font-scale))] tracking-[0.1em] text-arch-muted">
						BACKLINKS
					</div>
					{backlinks.map((bl) => (
						<button
							type="button"
							key={bl.slug}
							onClick={(e) => {
								e.stopPropagation();
								open(bl.slug);
							}}
							className="flex w-full items-center gap-1.5 border-b border-arch-border-faint py-1 text-left font-dot text-[calc(11px*var(--font-scale))] text-arch-cyan"
						>
							<span className="font-mon opacity-50">↑</span>
							{bl.title}
						</button>
					))}
				</div>
			) : null}
			{/* Local Map */}
			<div className="border-t border-arch-border-faint px-3.5 py-2.5 pb-4">
				<div className="mb-2 font-mon text-[calc(9px*var(--font-scale))] tracking-[0.1em] text-arch-muted">
					LOCAL MAP
				</div>
				<LocalMap currentFile={file} neighbors={localMapNeighbors} />
			</div>
		</div>
	);
}
