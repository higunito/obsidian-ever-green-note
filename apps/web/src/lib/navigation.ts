// 画面間ナビの単一情報源（ゲーム内名称 / 通常名 / ルートの対応表 = docs/design.md §3.3）。
// ナビは常にゲーム名＋通常名を併記する（可読性ガードレール §10.6）。

export interface NavItem {
	/** ゲーム内名称（ドット書体で表示） */
	gameName: string;
	/** 通常名（併記） */
	label: string;
	href: string;
	/** About ページ（SC-009）の「各ページの説明」で表示する一文説明。 */
	description: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
	{
		gameName: "MAIN MENU",
		label: "Home",
		href: "/home",
		description:
			"「最近更新された記録」「3つの入り口」「思考マップ」「記事一覧」への入り口をまとめたメインメニュー。",
	},
	{
		gameName: "FRAGMENTS",
		label: "Garden",
		href: "/garden",
		description:
			"断片的なノート（Garden）の一覧。ノートを開くと、関連ノートが横に積み重なる Stack View で探索できます。",
	},
	{
		gameName: "ARTICLE",
		label: "Essays",
		href: "/essays",
		description: "まとまった文章（Essay）の一覧と詳細。",
	},
	{
		gameName: "MAP",
		label: "思考マップ",
		href: "/garden?view=map",
		description: "ノート同士のつながりを地図状に可視化した調査マップ。",
	},
	{
		gameName: "ROUTE",
		label: "Paths",
		href: "/paths",
		description: "テーマ別に編集した、ノートを辿る順路（思考のルート）。",
	},
	{
		gameName: "SEARCH",
		label: "検索",
		href: "/search",
		description: "サイト内の全文検索。",
	},
	{
		gameName: "ABOUT",
		label: "About",
		href: "/about",
		description: "このページ。サイトの概要・各ページの説明・操作方法。",
	},
	{
		gameName: "CONFIG",
		label: "設定",
		href: "/config",
		description:
			"タイトル画面の再生・アニメーション低減・文字サイズなどの表示設定。",
	},
] as const;
