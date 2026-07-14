// Stack View の状態（spine/stack/active）と URL の相互変換（design §5.2、spec SC-004 §4.3/§4.4）。
// React に依存しない純粋関数のみ。URL が唯一の情報源（design §11.1）となるよう、
// クライアント側は React state を持たず、常にサーバーから渡された最新の StackState を使う。

export const MAX_STACK = 3;

export interface StackState {
	/** 折りたたまれた背表紙（左から古い順）。 */
	readonly spine: readonly string[];
	/** 現在可視のカラム（最大 {@link MAX_STACK} 件、左から古い順）。 */
	readonly stack: readonly string[];
	/** 現在アクティブな slug。必ず `stack` に含まれる。 */
	readonly active: string;
}

/**
 * ノートを「開く」（design §5.2、figma `GardenScreen.openNote` を正準）。
 * - 既に stack にあれば：アクティブ化のみ（並びは変えない）。
 * - spine にあれば：先頭に復帰させ即アクティブ化。溢れた分（最右＝最古の可視）は spine 末尾へ。
 * - どこにもなければ：末尾に新規追加。溢れた分（最左＝最古）は spine 先頭へ。
 */
export function openNote(state: StackState, slug: string): StackState {
	if (state.stack.includes(slug)) {
		return { ...state, active: slug };
	}

	if (state.spine.includes(slug)) {
		const merged = [slug, ...state.stack];
		const overflow = merged.length > MAX_STACK;
		const nextStack = merged.slice(0, MAX_STACK);
		const nextSpine = overflow
			? [...state.spine.filter((s) => s !== slug), merged[merged.length - 1]]
			: state.spine.filter((s) => s !== slug);
		return { spine: nextSpine, stack: nextStack, active: slug };
	}

	const merged = [...state.stack, slug];
	const overflow = merged.length > MAX_STACK;
	const nextStack = overflow ? merged.slice(1) : merged;
	const nextSpine = overflow ? [...state.spine, merged[0]] : state.spine;
	return { spine: nextSpine, stack: nextStack, active: slug };
}

/**
 * モバイルの「← 戻る」（spec SC-004 §4.4）。経路（spine▸stack の並び）上でアクティブの
 * ひとつ手前に戻る。これ以上戻れない（先頭にいる）場合は `null`（呼び出し側で HOME へ遷移する）。
 */
export function goBack(state: StackState): StackState | null {
	const fullPath = [...state.spine, ...state.stack];
	const idx = fullPath.indexOf(state.active);
	if (idx <= 0) return null;
	return openNote(state, fullPath[idx - 1]);
}

/** `?stack=` クエリの値（spine→stack の順で連結、`,` 区切り）。 */
export function serializeStackParam(state: StackState): string {
	return [...state.spine, ...state.stack].map(encodeURIComponent).join(",");
}

/** `/garden/[slug]?stack=...` の URL を組み立てる（design §5.2 / spec SC-004 §4.3）。 */
export function buildGardenHref(state: StackState): string {
	const query = serializeStackParam(state);
	const base = `/garden/${encodeURIComponent(state.active)}`;
	return query ? `${base}?stack=${query}` : base;
}

/**
 * ルートの `[slug]` と `?stack=` クエリから初期 {@link StackState} を復元する
 * （design §5.2、spec SC-004 §4.6/§4.8）。
 * - `?stack` が無い、または有効な slug が一つも無ければ、`routeSlug` 単独から開始する（§4.6）。
 * - `knownSlugs` に含まれない slug（存在しない/非公開/Essay）は無視する（§4.8：破綻させない）。
 * - `routeSlug` が復元後の可視 stack に含まれない場合（spine 側になった等、手動 URL 編集による
 *   不整合を含む）は `openNote` を適用して復元する（= その場で「開く」操作を再現する）。
 */
export function parseStackState(
	routeSlug: string,
	stackParam: string | undefined,
	knownSlugs: ReadonlySet<string>,
): StackState {
	const raw = (stackParam ?? "")
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean)
		.map((s) => {
			try {
				return decodeURIComponent(s);
			} catch {
				return s;
			}
		});
	const valid = raw.filter((s) => knownSlugs.has(s));
	const path = valid.length > 0 ? valid : [routeSlug];

	const stack = path.slice(-MAX_STACK);
	const spine = path.slice(0, Math.max(0, path.length - MAX_STACK));

	if (stack.includes(routeSlug)) {
		return { spine, stack, active: routeSlug };
	}
	return openNote(
		{ spine, stack, active: stack[stack.length - 1] ?? routeSlug },
		routeSlug,
	);
}
