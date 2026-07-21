"use client";

import { type RefObject, useCallback, useEffect, useRef } from "react";
import { playCursorSound, playDecideSound } from "@web/lib/sound-effects";

type Direction = "up" | "down" | "left" | "right";

interface Rect {
	top: number;
	bottom: number;
	left: number;
	right: number;
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
/** この属性を持つ祖先内では左右キーの「同じ行」制約を適用しない（design §9.6.2 v1.18）。
 * 調査マップ／LocalMap のようにノードが格子状に並ばない自由配置の領域に付与する。 */
const FREE_LAYOUT_ATTR = "data-roving-free";
/** 画面遷移直後の既定選択項目を明示するための属性（design §9.6.2 v1.18）。1 領域内に複数あれば DOM 順で先頭を使う。 */
const DEFAULT_ATTR = "data-roving-default";
/** この属性を持つ祖先配下の要素は対象から除外する（design §9.6.2 v1.29）。
 * `Nav` の Suspense fallback（`NavFallback`）のように、ストリーミング SSR で
 * 本物のコンテンツに差し替わる一時的な DOM に属性を書き込むと、差し替え時の
 * hydration 比較で属性不一致警告が出るため。 */
const IGNORE_ATTR = "data-roving-ignore";
/** この属性を持つ祖先でまとまる項目群＝グループ（design §9.6.2 v1.33）。
 * Stack View（SC-004）の各カラムのように「親（グループ全体）／子（グループ内の個別要素）」の
 * 2 階層で十字キー操作したい領域に付与する。 */
const GROUP_ATTR = "data-roving-group";
/** グループを代表する項目（親）に付ける。この項目を選択中は他グループの代表項目へも
 * 左右移動できるが、それ以外（子）を選択中は左右移動を同じグループ内に限定する（design §9.6.2 v1.33）。 */
const GROUP_ROOT_ATTR = "data-roving-group-root";
/** グループ内で、外部から初めてそのグループへ移動してきたときの着地点にしたい項目に付ける
 * （design §9.6.2 v1.38）。例：`Nav` の現在ページに対応する項目。すでにそのグループの内側に
 * いる場合（グループ内で項目間を移動する場合）はこの着地点への誘導を行わない。 */
const ENTER_TARGET_ATTR = "data-roving-enter-target";
const DEFAULT_ITEM_SELECTOR = "a,button";

function toRect(el: HTMLElement): Rect {
	const r = el.getBoundingClientRect();
	return {
		top: r.top,
		bottom: r.bottom,
		left: r.left,
		right: r.right,
		centerX: (r.left + r.right) / 2,
		centerY: (r.top + r.bottom) / 2,
	};
}

/** 垂直方向に重なりがあるか（左右キーの「同じ行」判定に使う）。 */
function overlapsVertically(a: Rect, b: Rect): boolean {
	return a.top < b.bottom && a.bottom > b.top;
}

function isTextInputTag(el: HTMLElement): boolean {
	return el.tagName === "INPUT" || el.tagName === "TEXTAREA";
}

function isTextInput(target: EventTarget | null): target is HTMLElement {
	return target instanceof HTMLElement && isTextInputTag(target);
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
 * 同じグループ（`data-roving-group`）内の候補は直交軸のズレを無視し、移動軸方向の距離のみで
 * 比較する（design §9.6.2 v1.34）。本文中のリンクはテキストの行内位置により左右にばらつくため、
 * ズレを加味すると縦方向の DOM 順（本文→Backlinks→Local Map）を飛び越えてしまうことがあるため。
 */
function nearestInDirection(
	current: Rect,
	candidates: HTMLElement[],
	direction: Direction,
	currentGroup: Element | null,
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
		const sameGroup =
			currentGroup !== null && el.closest(`[${GROUP_ATTR}]`) === currentGroup;
		const score = sameGroup ? primary : primary + secondary * 2;
		if (score < bestScore) {
			bestScore = score;
			best = el;
		}
	}
	return best;
}

/**
 * 移動先が「現在地とは別のグループ」に属する場合、そのグループ内に着地点
 * （`data-roving-enter-target`）があればそちらへ誘導する（design §9.6.2 v1.38）。
 * 例：コンテンツ側から上キーで `Nav` へ初めて移動する際、実座標最短の項目ではなく
 * 現在ページに対応する `Nav` 項目へ着地させる。同じグループ内で項目間を移動する場合
 * （＝グループへ入った後の移動）は誘導しない。
 */
function redirectToGroupEnterTarget(
	candidate: HTMLElement | null,
	currentGroup: Element | null,
): HTMLElement | null {
	if (!candidate) return candidate;
	const candidateGroup = candidate.closest(`[${GROUP_ATTR}]`);
	if (!candidateGroup || candidateGroup === currentGroup) return candidate;
	const enterTarget = candidateGroup.querySelector<HTMLElement>(
		`[${ENTER_TARGET_ATTR}]`,
	);
	return enterTarget ?? candidate;
}

/**
 * 左右キーは実座標が「同じ行」（垂直方向に重なりのある要素）にある項目間のみを移動対象とし、
 * 同じ行に候補が無ければ移動しない（design §9.6.2 v1.18）。`Nav`・フィルタ・カード一覧のように
 * 縦に複数領域が積み重なる画面で、左右移動が行の境界を越えて無関係な別領域へ飛ぶ不具合を防ぐ。
 * 調査マップ／LocalMap のような自由配置の領域（`data-roving-free` 祖先）はこの制約の例外とし、
 * 全方向とも実座標最短移動を使う。上下キーは常にこの制約の対象外（領域をまたいだ移動を許容する）。
 */
function findNext(
	currentEl: HTMLElement,
	candidates: HTMLElement[],
	direction: Direction,
): HTMLElement | null {
	const current = toRect(currentEl);
	const isHorizontal = direction === "left" || direction === "right";
	const isFreeLayout = currentEl.closest(`[${FREE_LAYOUT_ATTR}]`) !== null;
	const isGroupRoot = currentEl.hasAttribute(GROUP_ROOT_ATTR);
	const currentGroup = currentEl.closest(`[${GROUP_ATTR}]`);

	if (isHorizontal && !isFreeLayout) {
		let sameRow = candidates.filter((el) =>
			overlapsVertically(current, toRect(el)),
		);
		// グループの子要素を選択中は、左右移動を同じグループ内に限定する
		// （グループ代表項目＝親を選択中はこの制約を適用しない、design §9.6.2 v1.33）。
		if (!isGroupRoot && currentGroup) {
			sameRow = sameRow.filter(
				(el) => el.closest(`[${GROUP_ATTR}]`) === currentGroup,
			);
		}
		return redirectToGroupEnterTarget(
			nearestInDirection(current, sameRow, direction, currentGroup),
			currentGroup,
		);
	}
	return redirectToGroupEnterTarget(
		nearestInDirection(current, candidates, direction, currentGroup),
		currentGroup,
	);
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
 * 左右キーは「同じ行」（垂直方向に重なりのある要素）内のみを移動対象とする（`data-roving-free`
 * 祖先を持つ自由配置の領域は例外）。`data-roving-group` でまとめた項目群は「親（`data-roving-group-root`）／
 * 子」の 2 階層になり、子を選択中は左右移動が同じグループ内に限定される（親を選択中は他グループの親へも
 * 移動できる。design §9.6.2 v1.33）。`data-roving-default` を付けた要素があれば既定選択に使う
 * （無ければ DOM 順の先頭）。テキスト入力欄フォーカス中は上下キーで `blur` して抜けられる（design §9.6.2 v1.18）。
 * 逆に仮想カーソルが十字キー移動でテキスト入力欄に到達した場合は実 DOM フォーカスを渡す（再び入力を
 * 再開できるようにするため）。テキスト入力欄は `data-roving-selected` の対象にせず、実 DOM フォーカスの
 * 見た目のみで選択状態を示す（design §9.6.2 v1.19）。
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
			(item) =>
				// `hidden md:flex` 等でブレークポイントにより非表示の要素を除外する
				// （display:none は getClientRects() が空になる。position:fixed でも空にならないため
				// offsetParent 判定より確実）。
				item.getClientRects().length > 0 &&
				// Suspense fallback 等、本物のコンテンツに差し替わる一時的な DOM を除外する。
				item.closest(`[${IGNORE_ATTR}]`) === null,
		);
	}, [itemSelector]);

	// テキスト入力欄は実 DOM フォーカスの見た目（枠色変化等）のみで選択状態を示し、
	// 仮想カーソルのハイライトは二重に付与しない（design §9.6.2 v1.19）。
	const applyHighlight = useCallback(
		(selected: HTMLElement | null) => {
			for (const item of getItems()) {
				if (item === selected && !isTextInputTag(item))
					item.setAttribute(SELECTED_ATTR, "true");
				else item.removeAttribute(SELECTED_ATTR);
			}
		},
		[getItems],
	);

	// 対象一覧が変わった（フィルタ適用・データ読み込み等）ときに選択中要素が消えていたら
	// 既定選択（`data-roving-default`）または先頭へ戻す（design §9.6.2 v1.18）。
	useEffect(() => {
		if (!enabled) {
			applyHighlight(null);
			selectedRef.current = null;
			return;
		}
		const items = getItems();
		if (items.length === 0) return;
		if (!selectedRef.current || !items.includes(selectedRef.current)) {
			const defaultItem = containerRef.current?.querySelector<HTMLElement>(
				`[${DEFAULT_ATTR}]`,
			);
			selectedRef.current =
				defaultItem && items.includes(defaultItem) ? defaultItem : items[0];
		}
		applyHighlight(selectedRef.current);
	});

	useEffect(() => {
		if (!enabled) return;

		function handleKeyDown(e: KeyboardEvent) {
			if (e.ctrlKey || e.metaKey || e.altKey) return;

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

			// テキスト入力欄フォーカス中：左右はテキストカーソル移動を優先して横取りしない。
			// 上下は入力欄から blur したうえで仮想カーソル側の移動に切り替える（design §9.6.2 v1.18）。
			// Enter/Z はここでは扱わない（入力中の通常のタイプ操作・フォーム挙動を妨げないため）。
			if (isTextInput(e.target)) {
				if (direction !== "up" && direction !== "down") return;
				const items = getItems();
				if (items.length === 0) return;
				e.preventDefault();
				const next = findNext(e.target, items, direction);
				if (!next) return;
				e.target.blur();
				selectedRef.current = next;
				applyHighlight(next);
				playCursorSound();
				return;
			}

			const items = getItems();
			if (items.length === 0) return;

			if (e.key === "Enter" || e.key === "z" || e.key === "Z") {
				e.preventDefault();
				const target = selectedRef.current ?? items[0];
				if (target) {
					simulateClick(target);
					playDecideSound();
				}
				return;
			}

			if (!direction) return;
			e.preventDefault();

			const current =
				selectedRef.current && items.includes(selectedRef.current)
					? selectedRef.current
					: items[0];
			const candidates = items.filter((item) => item !== current);
			const next = findNext(current, candidates, direction) ?? current;
			selectedRef.current = next;
			applyHighlight(next);
			if (next !== current) playCursorSound();
			// 仮想カーソルがテキスト入力欄へ到達した場合は実 DOM フォーカスも渡す。
			// 一度入力欄の外へ抜けたあとも十字キーで戻って入力を再開できるようにする（design §9.6.2 v1.19）。
			if (isTextInput(next)) next.focus();
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [enabled, getItems, applyHighlight]);

	return containerRef;
}
