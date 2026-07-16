import type { NoteStatus } from "content-schema";

// デザイントークン（配色の正準は docs/design.md §10.2、書体は §10.3）。
// 実体の 16 進/rgba 値は globals.css の @theme に一元定義し、ここではそれを指す CSS 変数名だけを持つ。
// コンポーネントは色コードを直書きせず、このオブジェクト経由で参照する（.claude/rules/coding.md）。
export const C = {
	bg: "var(--color-arch-bg)",
	bgTop: "var(--color-arch-bg-top)",
	bgMid: "var(--color-arch-bg-mid)",
	panelDark: "var(--color-arch-panel-dark)",
	panel: "var(--color-arch-panel)",
	text: "var(--color-arch-text)",
	muted: "var(--color-arch-muted)",
	cyan: "var(--color-arch-cyan)",
	cyanDim: "var(--color-arch-cyan-dim)",
	cyanFaint: "var(--color-arch-cyan-faint)",
	border: "var(--color-arch-border)",
	borderFaint: "var(--color-arch-border-faint)",
	// べベルボーダー（Win95 的な浮き彫り枠）のハイライト/シャドウ。Window の inset box-shadow で使う。
	borderHi: "var(--color-arch-border-hi)",
	borderSh: "var(--color-arch-border-sh)",
	// セレクタ黄色（90年代 ADV の定番、CommandMenu の ▶ に使う）。
	yellow: "var(--color-arch-yellow)",
	fragment: "var(--color-arch-fragment)",
	developing: "var(--color-arch-developing)",
	archived: "var(--color-arch-archived)",
} as const;

// 書体（用途別、§10.3）。next/font が <html> に張る CSS 変数を @theme 経由で参照する。
export const font = {
	dot: "var(--font-dot)", // 見出し・メニュー・タイトルバー・システム表示（ドット）
	min: "var(--font-min)", // 本文（明朝、可読性最優先）
	mon: "var(--font-mon)", // 英字ラベル・数値（等幅）
} as const;

// status（seed/growing/evergreen）→ 色（§10.5）。
export function statusColor(status: NoteStatus): string {
	switch (status) {
		case "seed":
			return C.fragment;
		case "growing":
			return C.developing;
		case "evergreen":
			return C.archived;
	}
}

// status → ゲーム内呼称（§10.5）。
export const STATUS_LABEL: Record<NoteStatus, string> = {
	seed: "Fragment",
	growing: "Developing",
	evergreen: "Archived",
};

// レイアウトのブレークポイント（px）。design のレスポンシブ規定に対応（Stack=768 / Home=900）。
export const BREAKPOINT = {
	mobileStack: 768,
	home: 900,
} as const;
