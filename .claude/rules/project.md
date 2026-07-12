# ルール：プロジェクト横断の不可侵事項

本リポジトリ全体で常に守る制約。破ると設計の前提（疎結合・公開境界・世界観）が壊れる。

## コンテンツ契約

- **正本は Obsidian Vault**。`reference/obsidian/README.md` の frontmatter キー・ゾーンフォルダ規約に **厳密に依存**する。
- コンテンツ契約（キー名・公開ゾーン規約）を **勝手に変えない**。変更が必要なら Vault 側 README/CLAUDE を先に更新し、その後に実装を合わせる。
- **公開判定は「公開ゾーン配下 かつ `publish: true`」の AND**。`publish` の既定は `false`。非公開ゾーン（`Memo/` `Daily/` `Literature/` 等）は仕組み上サイトに出さない。
- 生成物に **非公開情報を漏らさない**：非公開ノートへの `[[link]]` はテキスト化、`source_ref` 等の非公開参照は出力しない（サニタイズ）。

## アーキテクチャ境界

- **Web アプリは実行時に GitHub トークンを持たない／GitHub へ直接アクセスしない**。中間ストア（Cloudflare R2）の公開 JSON を読むだけ（`docs/design.md` §6.2）。
- 認可情報（R2 書き込み鍵・revalidate secret 等）は **Content 側 CI の Secrets** にのみ置く。アプリが持つ秘密は revalidate secret のみ。
- **Obsidian の push でアプリを再ビルド／再デプロイしない**。反映は `revalidateTag('content')` によるキャッシュ更新のみ。アプリの再デプロイはアプリのコード変更時だけ。

## 世界観・表示

- **全ページ常時 ADV**（通常表示への切替トグルは作らない）。
- **可読性ガードレール（`docs/design.md` §10.6）を必ず守る**：本文を全ピクセルフォント化しない／常時タイプライター強制しない／長い暗転を入れない／ナビはゲーム名＋通常名を併記／CRT 歪みを本文にかけない／モバイルで操作不能にしない。

## 正典と運用

- **設計・仕様・実装計画の三文書が正典**。実装は `docs/design.md`・`docs/specification.md`・`tmp/v1-first/implementation-plan.md` に従う。齟齬を見つけたら文書を先に直す。
- **git の commit / push、ファイルの削除は手動指示を待つ**（自動で行わない）。
- 秘密情報（`.env` `.env.local` / secrets）は絶対にコミットしない。
- `reference/` 配下は参考資料。**編集・実装対象にしない**（読み取り専用）。
