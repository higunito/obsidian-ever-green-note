"use client";

import { type RefObject, useCallback, useEffect, useRef } from "react";

type Direction = "up" | "down" | "left" | "right";

interface Rect {
	centerX: number;
	centerY: number;
}

interface UseSpatialNavigationOptions<T extends HTMLElement> {
	/** 対象要素を絞る CSS セレクタ。既定は `a,button`（design §9.6.2 の「実体は `<button>`/`<a>`」に対応）。 */
	itemSelector?: string;
	enabled?: boolean;
	/** 既存の ref をコンテナとして再利用したい場合に渡す（例：ドラッグ操作等で既に ref を持つコンテナ）。省略時はフック内部で新規作成する。 */
	containerRef?: RefObject<T | null>;
}

const SELECTED_ATTR = "data-roving-selected";
const DEFAULT_ITEM_SELECTOR = "a,button";

function toRect(el: HTMLElement): Rect {
	const r = el.getBoundingClientRect();
	return { centerX: (r.left + r.right) / 2, centerY: (r.top + r.bottom) / 2 };
}

function isTextInput(target: EventTarget | null): boolean {
	return (
		target instanceof HTMLElement &&
		(target.tagName === "INPUT" || target.tagName === "TEXTAREA")
	);
}

/**
 * 要素をクリックしたことにする。`HTMLElement.prototype.click` は SVGElement には無い
 * （LocalMap 等の SVG `<g role="button">` が対象になりうるため、`.click()` は使えない）。
 * 合成 click イベントを dispatch すれば React の onClick（イベント委譲）には届く。
 */
function simulateClick(el: HTMLElement): void {
	el.dispatchEvent(
		new MouseEvent("click", { bubbles: true, cancelable: true, view: window }),
	);
}

/**
 * 実座標に基づく 2 次元カーソル移動（隣接候補の選定は「移動方向にある要素のうち、
 * 移動軸方向の距離＋直交軸のズレ×2 が最小のもの」）。行・列を明示的に管理しない分、
 * タブ列＋グリッドのような異なる並びが縦に混在する画面でも自然に移動できる。
 */
function findNext(
	current: Rect,
	candidates: HTMLElement[],
	direction: Direction,
): HTMLElement | null {
	let best: HTMLElement | null = null;
	let bestScore = Number.POSITIVE_INFINITY;
	for (const el of candidates) {
		const rect = toRect(el);
		let primary: number;
		let secondary: number;
		switch (direction) {
			case "down":
				primary = rect.centerY - current.centerY;
				secondary = Math.abs(rect.centerX - current.centerX);
				break;
			case "up":
				primary = current.centerY - rect.centerY;
				secondary = Math.abs(rect.centerX - current.centerX);
				break;
			case "right":
				primary = rect.centerX - current.centerX;
				secondary = Math.abs(rect.centerY - current.centerY);
				break;
			case "left":
				primary = current.centerX - rect.centerX;
				secondary = Math.abs(rect.centerY - current.centerY);
				break;
		}
		if (primary <= 0.5) continue;
		const score = primary + secondary * 2;
		if (score < bestScore) {
			bestScore = score;
			best = el;
		}
	}
	return best;
}

/**
 * セレクタ型 UI の仮想カーソル共通フック（design §9.6.2、spec 共通仕様 F-NAV-003）。
 * `TitleMenu`（v1.9）で確立した「選択状態をコンポーネント内で保持し、実 DOM フォーカスとは
 * 独立に十字キーで移動する」方式を、任意のコンテナに一般化したもの。
 *
 * 返り値の ref をコンテナ要素に付ける。コンテナ内の `<a>`/`<button>`（既定）が対象になる。
 * 十字キーは実座標が最も近い候補へ移動し、選択中の要素に `data-roving-selected="true"`
 * （globals.css）を付与する。Enter/`Z` は選択中要素へ合成 click イベントを dispatch するだけなので、
 * 各カード自身の既存クリック処理（`useFlashNavigate` 等）をそのまま再利用できる
 * （`.click()` は SVGElement に無いため使わない。LocalMap 等の SVG ノードも対象になりうる）。
 * `Nav`/`NavBack`（design §9.6.2、v1.17）も画面の主要コンテンツと同じ領域に含め、
 * 十字キーで到達できるようにする（Tab 移動でも引き続き到達できる）。
 */
export function useSpatialNavigation<T extends HTMLElement>({
	itemSelector = DEFAULT_ITEM_SELECTOR,
	enabled = true,
	containerRef: externalRef,
}: UseSpatialNavigationOptions<T> = {}) {
	const internalRef = useRef<T>(null);
	const containerRef = externalRef ?? internalRef;
	const selectedRef = useRef<HTMLElement | null>(null);

	// containerRef は ref のため依存配列に含めなくても常に最新を参照する。
	// biome-ignore lint/correctness/useExhaustiveDependencies: containerRef.current は ref
	const getItems = useCallback((): HTMLElement[] => {
		const container = containerRef.current;
		if (!container) return [];
		return Array.from(
			container.querySelectorAll<HTMLElement>(itemSelector),
		).filter(
			// `hidden md:flex` 等でブレークポイントにより非表示の要素を除外する
			// （display:none は getClientRects() が空になる。position:fixed でも空にならないため
			// offsetParent 判定より確実）。
			(item) => item.getClientRects().length > 0,
		);
	}, [itemSelector]);

	const applyHighlight = useCallback(
		(selected: HTMLElement | null) => {
			for (const item of getItems()) {
				if (item === selected) item.setAttribute(SELECTED_ATTR, "true");
				else item.removeAttribute(SELECTED_ATTR);
			}
		},
		[getItems],
	);

	// 対象一覧が変わった（フィルタ適用・データ読み込み等）ときに選択中要素が消えていたら先頭へ戻す。
	useEffect(() => {
		if (!enabled) {
			applyHighlight(null);
			selectedRef.current = null;
			return;
		}
		const items = getItems();
		if (items.length === 0) return;
		if (!selectedRef.current || !items.includes(selectedRef.current)) {
			selectedRef.current = items[0];
		}
		applyHighlight(selectedRef.current);
	});

	useEffect(() => {
		if (!enabled) return;

		function handleKeyDown(e: KeyboardEvent) {
			if (e.ctrlKey || e.metaKey || e.altKey) return;
			if (isTextInput(e.target)) return;

			const items = getItems();
			if (items.length === 0) return;

			if (e.key === "Enter" || e.key === "z" || e.key === "Z") {
				e.preventDefault();
				const target = selectedRef.current ?? items[0];
				if (target) simulateClick(target);
				return;
			}

			const direction: Direction | null =
				e.key === "ArrowUp"
					? "up"
					: e.key === "ArrowDown"
						? "down"
						: e.key === "ArrowLeft"
							? "left"
							: e.key === "ArrowRight"
								? "right"
								: null;
			if (!direction) return;
			e.preventDefault();

			const current =
				selectedRef.current && items.includes(selectedRef.current)
					? selectedRef.current
					: items[0];
			const candidates = items.filter((item) => item !== current);
			const next = findNext(toRect(current), candidates, direction) ?? current;
			selectedRef.current = next;
			applyHighlight(next);
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [enabled, getItems, applyHighlight]);

	return containerRef;
}
