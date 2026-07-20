// 画面間ナビの単一情報源（ゲーム内名称 / ルートの対応表 = docs/design.md §3.3）。
// 共通ナビ（Nav）・各画面ヘッダー・About（SC-009）の「各ページの説明」は
// いずれもゲーム内名称のみを表示する（v1.26、About は v1.35 で同様に統一）。

export interface NavItem {
	/** ゲーム内名称（ドット書体で表示、共通ナビ・各画面ヘッダー・About で使う） */
	gameName: string;
	href: string;
	/** About ページ（SC-009）の「各ページの説明」で表示する一文説明。 */
	description: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
	{
		gameName: "HOME",
		href: "/home",
		description:
			"「最近更新された記録」「3つの入り口」「思考マップ」「記事一覧」への入り口をまとめたメインメニューです。",
	},
	{
		gameName: "GARDEN",
		href: "/garden",
		description:
			"断片的なノート（Garden）の一覧。ノートを開くと、関連ノートが横に積み重なるスタックビューで探索できます。",
	},
	{
		gameName: "ARTICLE",
		href: "/articles",
		description: "記事として書いた、ある程度まとまった文章が閲覧できます。Noteに投稿している記事と内容は同じです。",
	},
	{
		gameName: "MAP",
		href: "/garden?view=map",
		description: "ノート同士のつながりを地図状に可視化した調査マップです。",
	},
	{
		gameName: "ROUTE",
		href: "/route",
		description: "テーマ別に、関連しているノートを辿ることができます。",
	},
	{
		gameName: "SEARCH",
		href: "/search",
		description: "サイト内の全文検索ができます。",
	},
	{
		gameName: "ABOUT",
		href: "/about",
		description: "このページ。サイトの概要・各ページの説明・操作方法を記載しています。",
	},
	{
		gameName: "CONFIG",
		href: "/config",
		description:
			"タイトル画面の再生・アニメーション低減・文字サイズなどの表示設定ができます。",
	},
] as const;
