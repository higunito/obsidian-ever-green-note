"use client";

import {
	buildGardenHref,
	goBack as goBackPure,
	openNote,
	type StackState,
} from "@web/lib/stack";
import { buildLayerIndex } from "@web/lib/wikilink";
import type { Article } from "@web/types/content";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo } from "react";

interface StackNavigation {
	state: StackState;
	/**
	 * slug を「開く」（design §5.2）。Garden なら Stack の状態遷移＋URL 更新、
	 * Essay なら Stack に載せず `/essays/[slug]` へ素通しする（Essays は Stack 対象外、design §5.2）。
	 * FileWindow の本文リンク・Backlinks・LocalMap・Spine・パンくず・履歴ドロワーが共通して使う。
	 */
	open: (slug: string) => void;
	/** モバイルの「← 戻る」（spec SC-004 §4.4）。空になれば HOME へ。 */
	goBack: () => void;
}

const StackNavigationContext = createContext<StackNavigation | null>(null);

interface StackNavigationProviderProps {
	state: StackState;
	/** レイヤー判定用（Garden/Essay の分岐）。ページ側で取得済みの全記事をそのまま渡す。 */
	articles: readonly Article[];
	children: React.ReactNode;
}

/**
 * Stack View のナビゲーション（design §11.1：URL が唯一の情報源）。
 * React state は持たず、サーバーから渡された `state`（URL 由来）を起点に次の URL を計算して
 * `router.push` するだけ。ページ遷移のたびに Server Component が新しい `state` を作り直す。
 */
export function StackNavigationProvider({
	state,
	articles,
	children,
}: StackNavigationProviderProps) {
	const router = useRouter();
	const layerIndex = useMemo(() => buildLayerIndex(articles), [articles]);

	const open = useCallback(
		(slug: string) => {
			if (layerIndex.get(slug) === "essay") {
				router.push(`/essays/${encodeURIComponent(slug)}`);
				return;
			}
			const next = openNote(state, slug);
			router.push(buildGardenHref(next));
		},
		[state, router, layerIndex],
	);

	const goBack = useCallback(() => {
		const next = goBackPure(state);
		router.push(next ? buildGardenHref(next) : "/");
	}, [state, router]);

	const value = useMemo(() => ({ state, open, goBack }), [state, open, goBack]);

	return (
		<StackNavigationContext.Provider value={value}>
			{children}
		</StackNavigationContext.Provider>
	);
}

export function useStackNavigation(): StackNavigation {
	const ctx = useContext(StackNavigationContext);
	if (!ctx) {
		throw new Error(
			"useStackNavigation は StackNavigationProvider の内側でのみ使用できます",
		);
	}
	return ctx;
}
