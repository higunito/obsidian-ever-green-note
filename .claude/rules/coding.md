# ルール：コーディング

`apps/web` と `packages/*` の実装で常に守る規則。

## 言語・命名

- TypeScript（`strict: true`）。**`any` を使わない**（やむを得ない場合は理由コメント＋局所化）。
- 変数・関数：camelCase／定数：UPPER_SNAKE_CASE／型・コンポーネント：PascalCase。
- ファイル：コンポーネントは PascalCase、それ以外は kebab-case を基本とする。

## 型とデータ

- 生成 JSON の型・zod スキーマは **`packages/content-schema` を単一の情報源**にする。`apps/web` と `packages/content-gen` は `@schema` から import し、型を二重定義しない。
- 外部境界（生成物の読み込み・パース）では **zod で検証**してから使う。
- コンテンツ取得は **`lib/content.ts` の `ContentStore` 経由のみ**。コンポーネントは Store 実体（Remote/Local）を意識しない。GitHub へ直接アクセスするコードを書かない。

## UI・デザインシステム

- 配色・フォント等のデザイントークンは **`src/styles/tokens.ts` に集約**し、コンポーネントに色コードを直書きしない（配色は `docs/design.md` §10.2）。
- ドット/明朝/等幅の使い分けは `docs/design.md` §10.3 に従う（本文は明朝、ラベル・見出しはドット/等幅）。
- 装飾アニメーションは `prefers-reduced-motion` と Config の「アニメーション低減」を尊重する。
- Server / Client Components を適切に分離する（データ取得はサーバー、対話状態はクライアント）。

## 状態・URL

- 共有可能であるべき状態（Stack の経路・フィルタ・検索クエリ）は **URL クエリに保持**する（`docs/design.md` §11.1）。リロード・共有で再現できること。
- URL に載せない一時状態（ホバー、マップのパン/ズーム、Three Doors 履歴）はコンポーネント内 or クッキー/セッション。

## 生成 CLI（content-gen）

- 出力は **決定論的**であること（同一入力→同一出力）。擬似ファイル名・マップ座標はハッシュ等で安定させる。
- 出力前に全 JSON を zod で検証し、不正なら非 0 終了。
- ゴールデンテスト（vitest）を壊さない。仕様変更時はテストも更新する。

## 品質・作業手順

- 変更後は **`pnpm -w typecheck`** を通す。関連テストがあれば実行する。
- Biome（`biome.json`）の設定に従う（手動整形しない）。`biome check` で lint＋format を確認。
- **既存コードのスタイル（命名・構造・コメント密度）に合わせる**。周囲から浮くコードを書かない。
- 実装は実装計画のタスク粒度で進め、完了したらチェックボックスを更新する。
