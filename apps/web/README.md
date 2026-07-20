# apps/web — 思考アーカイブ（Web アプリ）

Next.js（App Router）製の個人サイト本体。1999 年製の架空 PC アドベンチャーゲームの画面として、Obsidian Vault 由来の公開ノートを表示する。

設計の正典は [`docs/design.md`](../../docs/design.md)、画面仕様は [`docs/specification.md`](../../docs/specification.md)、実装計画は [`tmp/v1-first/implementation-plan.md`](../../tmp/v1-first/implementation-plan.md)。

## 開発

```bash
pnpm --filter web dev      # 開発サーバ（http://localhost:3000）
pnpm --filter web build    # 本番ビルド
pnpm -w typecheck          # 型チェック
pnpm -w lint               # Biome（lint + format）
```

## コンテンツ取得（ContentStore）

コンテンツは必ず [`src/lib/content.ts`](./src/lib/content.ts) の `getContentStore()` 経由で取得する。GitHub へ直接アクセスするコードは書かない（design §6.2）。

- **LocalStore**（`CONTENT_BASE_URL` 未設定）：`content-schema` の fixtures を返す（開発用）。
- **RemoteStore**（`CONTENT_BASE_URL` 設定時）：R2 公開 URL の `latest.json`→`content/<build-id>/*.json` を fetch し、zod 検証してから返す。`next: { tags: ['content'] }` を付与。

### 環境変数

| 変数 | 用途 |
| --- | --- |
| `CONTENT_BASE_URL` | 中間ストア（R2）の公開ベース URL。未設定なら fixtures を使う |
| `REVALIDATE_SECRET` | `/api/revalidate` の共有シークレット認証 |

## コンテンツ同期（Content CI → R2 → revalidate）

Content 側（Obsidian Vault リポジトリ）の GitHub Actions が R2 へアップロード後、[`src/app/api/revalidate/route.ts`](./src/app/api/revalidate/route.ts) に `POST` する（`Authorization: Bearer <REVALIDATE_SECRET>`）。認証成功で `revalidateTag('content', 'max')` を実行し、次リクエストから最新の JSON を反映する（design §6.3）。ワークフロー本体は Content 側リポジトリに配置するため本リポジトリには存在しない（ドラフトと R2 セットアップ手順は `tmp/v1-first/content-ci-workflow-draft.yml` / `tmp/v1-first/phase10-r2-setup.md`）。

## デザイントークン

配色・書体の実体は [`src/app/globals.css`](./src/app/globals.css) の `@theme`（`--color-arch-*` / `--font-*`）に一元定義し、[`src/styles/tokens.ts`](./src/styles/tokens.ts) がそれを参照する。**コンポーネントに色コードを直書きしない**（配色 design §10.2、書体 §10.3）。

## 可読性ガードレール（必ず守る・design §10.6）

ADV 世界観を優先しても、以下は必ず守る。レビュー時のチェック観点でもある。

- **本文を全ピクセルフォント化しない。** 本文（Garden 断片・Essay 長文）は明朝（Noto Serif JP）。ドット書体（DotGothic16）は見出し・メニュー・タイトルバー・システム表示だけに使う。
- **常時タイプライター表示を強制しない。**
- **遷移のたびの長い暗転／フェードを入れない。**
- **ナビをゲーム用語だけにしない。** ゲーム内名称＋通常名を必ず併記する（対応表は [`src/lib/navigation.ts`](./src/lib/navigation.ts) = design §3.3）。
- **CRT 歪み・ノイズ・走査線を本文にかけない。** 装飾は背景（`SceneBackground`）に限定する。
- **PC で綺麗でもモバイルで操作不能にしない。**
- 装飾アニメーション（雨・点滅・演出）は `prefers-reduced-motion` と Config の「アニメーション低減」（`<html data-reduced-motion="true">`）を尊重して停止する。
