// 画面間ナビの単一情報源（ゲーム内名称 / 通常名 / ルートの対応表 = docs/design.md §3.3）。
// ナビは常にゲーム名＋通常名を併記する（可読性ガードレール §10.6）。

export interface NavItem {
	/** ゲーム内名称（ドット書体で表示） */
	gameName: string;
	/** 通常名（併記） */
	label: string;
	href: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
	{ gameName: "FRAGMENTS", label: "Garden", href: "/garden" },
	{ gameName: "ARTICLE", label: "Essays", href: "/essays" },
	{ gameName: "MAP", label: "思考マップ", href: "/garden?view=map" },
	{ gameName: "ROUTE", label: "Paths", href: "/paths" },
	{ gameName: "INFLUENCE", label: "Collections", href: "/collections" },
	{ gameName: "PROJECTS", label: "Projects", href: "/projects" },
	{ gameName: "PROFILE", label: "About", href: "/about" },
	{ gameName: "SEARCH", label: "検索", href: "/search" },
	{ gameName: "CONFIG", label: "設定", href: "/config" },
] as const;
