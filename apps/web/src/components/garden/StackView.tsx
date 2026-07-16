"use client";

import type { StackState } from "@web/lib/stack";
import type { Article } from "@web/types/content";
import type { BacklinkEntry } from "./FileWindow";
import { FileWindow } from "./FileWindow";
import type { LocalMapNeighbor } from "./LocalMap";
import { MobileStackBar } from "./MobileStackBar";
import { Spine } from "./Spine";
import type { StackFileEntry } from "./StackBreadcrumb";
import { StackBreadcrumb } from "./StackBreadcrumb";

export interface StackColumn {
	article: Article;
	file: string;
	backlinks: readonly BacklinkEntry[];
	localMapNeighbors: readonly LocalMapNeighbor[];
}

interface StackViewProps {
	state: StackState;
	spineEntries: readonly StackFileEntry[];
	columns: readonly StackColumn[];
}

/**
 * Stack View 本体（spec SC-004 §4.3/§4.4）。PC は spine＋最大3カラムを横並びで、
 * モバイルはアクティブな1カラムのみを表示する。出し分けは CSS（`hidden`/`md:flex`）のみで行い、
 * FileWindow 自体は重複マウントしない（各カラムは1回だけ描画する）。
 */
export function StackView({ state, spineEntries, columns }: StackViewProps) {
	const stackEntries: StackFileEntry[] = columns.map((c) => ({
		slug: c.article.slug,
		file: c.file,
		title: c.article.title,
	}));
	const history = [...spineEntries, ...stackEntries];

	return (
		<div className="flex h-screen flex-col">
			<div className="hidden md:block">
				<StackBreadcrumb
					spine={spineEntries}
					stack={stackEntries}
					active={state.active}
				/>
			</div>
			<MobileStackBar history={history} />
			<div className="flex flex-1 gap-0.5 overflow-hidden bg-black/10 p-2.5">
				<div className="hidden gap-0.5 md:flex">
					{spineEntries.map((entry) => (
						<Spine key={entry.slug} {...entry} />
					))}
				</div>
				{columns.map((col) => {
					const isActive = col.article.slug === state.active;
					return (
						<div
							key={col.article.slug}
							className={`arch-animated h-full min-w-0 w-full transition-all ${
								isActive
									? "flex md:flex-[2_1_380px]"
									: "hidden md:flex md:flex-[1_1_295px]"
							}`}
							style={{ animation: "stackColumnIn 0.25s ease-out" }}
						>
							<FileWindow
								article={col.article}
								file={col.file}
								isActive={isActive}
								backlinks={col.backlinks}
								localMapNeighbors={col.localMapNeighbors}
								className="flex-1"
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}
