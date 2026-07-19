// About（design §4.6、spec SC-009）の文言。2026-07-19 より Vault 生成（`Fleeting/about.md`）から
// このファイルでの直接管理に変更した。更新時はこのファイルを編集し、通常のアプリ再デプロイで反映する。

export interface AboutContent {
	updated: string;
	topics: string[];
	bodyHtml: string;
}

export const ABOUT_CONTENT: AboutContent = {
	updated: "2026-07-19",
	topics: [],
	bodyHtml: `
<p>『思考アーカイブ』は、思考の途中を、ひらいておく場所です。</p>
<p>1999年に発売されたものの、開発会社の消滅によって忘れられた個人用知識探索ソフトウェア——という体裁を借りて、日々の断片的なノートや読書からの気づき、まとまった文章までを公開しています。</p>
<p>TODO: 自己紹介・外部リンク（note / GitHub / 連絡先）をここに追記してください。</p>
`.trim(),
};
