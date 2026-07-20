// About（design §4.6、spec SC-009）の文言。2026-07-19 より Vault 生成（`Fleeting/about.md`）から
// このファイルでの直接管理に変更した。更新時はこのファイルを編集し、通常のアプリ再デプロイで反映する。

export interface AboutContent {
	updated: string;
	topics: string[];
	/** 「概要」セクションの本文（design §4.6、spec SC-009 §9.2）。 */
	overviewHtml: string;
}

export const ABOUT_CONTENT: AboutContent = {
	updated: "2026-07-19",
	topics: [],
	overviewHtml: `
<p>『思考アーカイブ』は、私の思考の途中を、ひらいておく場所です。</p>
<p>日々の断片的な思考の記録から、まとまった文章までを公開しています。</p>
`.trim(),
};

export interface AboutExternalLink {
	label: string;
	href: string;
}

/** 「LINKS ／ リンク集」セクション（design §4.6、spec SC-009 §9.2）。
 * URL は環境変数（`ABOUT_GITHUB_URL`/`ABOUT_NOTE_URL`、`.env.local`）で管理し、コードに直書きしない。
 * 未設定の項目は表示しない（`.env.local.example` にサンプル値あり）。 */
export const ABOUT_EXTERNAL_LINKS: readonly AboutExternalLink[] = [
	{ label: "GitHub", href: process.env.ABOUT_GITHUB_URL ?? "" },
	{ label: "note", href: process.env.ABOUT_NOTE_URL ?? "" },
].filter((link): link is AboutExternalLink => link.href !== "");
