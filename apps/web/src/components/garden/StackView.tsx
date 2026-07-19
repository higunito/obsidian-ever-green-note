"use client";

import { KeyboardBack, SpatialNavRegion } from "@web/components/system";
import type { StackState } from "@web/lib/stack";
import type { Article } from "@web/types/content";
import type { BacklinkEntry } from "./FileWindow";
import { FileWindow } from "./FileWindow";
import type { LocalMapNeighbor } from "./LocalMap";
import { MobileStackBar } from "./MobileStackBar";
import { Spine } from "./Spine";
import type { StackFileEntry } from "./StackBreadcrumb";
import { StackBreadcrumb } from "./StackBreadcrumb";
import { useStackNavigation } from "./StackNavigationProvider";

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
	const { goBack } = useStackNavigation();
	const stackEntries: StackFileEntry[] = columns.map((c) => ({
		slug: c.article.slug,
		file: c.file,
		title: c.article.title,
	}));
	const history = [...spineEntries, ...stackEntries];

	return (
		<div className="flex h-screen flex-col">
			{/* B ボタン（design §9.6.3、spec SC-004 §4.5）：既定の「戻る」より優先してスタックを
			    1 つ畳む（モバイルの「← 戻る」= `goBack()` と同じ処理）。スタックが空になった後の
			    遷移先は `goBack()` 自身が持つ（`StackNavigationProvider`）。 */}
			<KeyboardBack
				href="/home"
				onBeforeBack={() => {
					goBack();
					return true;
				}}
			/>
			{/* 十字キーの対象（spec SC-004 §4.5）：NavBack（パンくず内）、各カラムの本文リンク/
			    Backlinks/Local Map ノード、パンくず・spine。LocalMap のノードは SVG
			    `<g role="button">` のため対象セレクタに含める。 */}
			<SpatialNavRegion
				className="flex flex-1 flex-col overflow-hidden"
				itemSelector="a,button,[role='button']"
			>
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
								className={`h-full min-w-0 w-full transition-all ${
									isActive
										? "flex md:flex-[2_1_380px]"
										: "arch-animated hidden md:flex md:flex-[1_1_295px]"
								}`}
								// isActive でない列だけ横幅を「かつてアクティブだった幅」から現在の幅へ
								// 縮めるアニメーションを付ける（stackColumnShrink、globals.css）。`[slug]`
								// のルート遷移では毎回ページ全体が再マウントされるため（CSS transition は
								// 「直前の状態」を持たず効かない）、animation の from だけを固定値で与えて
								// to は暗黙的に現在の flex-basis に解決させることで擬似的に「縮む」動きを出す。
								// isActive の列（今読んでいる箇所）はフェードなどを付けずそのまま表示する。
								style={
									!isActive
										? { animation: "stackColumnShrink 0.25s ease-out" }
										: undefined
								}
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
			</SpatialNavRegion>
		</div>
	);
}
