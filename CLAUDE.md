# CLAUDE.md — 思考アーカイブ（Thought Archive）

Obsidian Vault をコンテンツ源とする個人サイト。1999 年製の架空 PC アドベンチャーゲームの画面として、デジタルガーデン＋個人編集誌＋制作物/リンク集を公開する。

## 回答ルール

- **必ず日本語で回答する。**
- 設計・仕様・実装計画（下記「よく参照するファイル」）を根拠にする。**推測で答えず**、根拠となる節を示す。
- 三文書（design / specification / implementation-plan）に齟齬を見つけたら、実装より先に **文書を直して整合を取る**。
- **git の commit / push、ファイルの削除は手動指示を待つ**（自動で行わない）。
- 破壊的・外部影響のある操作は事前に確認する。秘密情報（`.env`, secrets）はコミットしない。

## プロジェクト概要

- 目的：筆者の Obsidian Vault（Zettelkasten）を唯一の原稿正本とし、公開してよいノートだけをサイトへ流し込む。andymatuschak 型の「ノートが親子で積み重なる」探索（Stack View）を、親子テーブルを持たず wikiリンク＋backlink で実現する。
- 世界観：全ページ常時 ADV（モード切替なし）。可読性ガードレール（`docs/design.md` §10.6）を厳守する。
- 詳細は `docs/design.md`（設計）と `docs/specification.md`（画面仕様）を参照。

## リポジトリ構成

pnpm モノレポ。実装は本リポジトリのルートに置く。

```text
/
├── apps/web/               # Next.js（App Router）アプリ本体
├── packages/
│   ├── content-gen/        # Markdown→JSON 生成 CLI（Content CI が呼ぶ）
│   └── content-schema/     # 共有 TS 型・zod スキーマ・fixtures
├── docs/                   # 設計書・機能仕様書（正）
├── reference/              # 参考資料（読み取り専用・実装対象外）
│   ├── obsidian/           # コンテンツ源 Vault の Clone 断面（＝コンテンツ契約）
│   └── figma-make/         # Figma Make の画面プロトタイプ（実装の起点）
└── tmp/                    # 一時ファイル・実装計画（gitignore 対象が多い）
```

- コンテンツ（Obsidian Vault）と **アプリは別リポジトリ**。アプリは実行時に GitHub トークンを持たず、中間ストア（Cloudflare R2）の JSON を読むだけ（`docs/design.md` §6）。

## 技術スタック

- **フレームワーク**: Next.js（App Router）/ React / TypeScript（`strict: true`）
- **バージョンマネージャ**: mise（Node.js / pnpm の版を `mise.toml` で固定）
- **パッケージマネージャ**: pnpm（workspace）
- **UI**: shadcn/ui（Radix UI + Tailwind CSS）。配色/書体はデザイントークンで上書き
- **Markdown**: unified + remark/rehype、gray-matter、自作 `[[wikilink]]` プラグイン
- **スキーマ検証**: zod（`packages/content-schema` に一元化）
- **グラフ/マップ**: 自前座標計算 ＋ React/SVG（Sigma.js は不採用）
- **全文検索**: minisearch（クライアント側）
- **中間ストア**: Cloudflare R2（r2.dev 公開 URL）
- **ホスティング**: Cloudflare（Workers ＋ `@opennextjs/cloudflare`、ISR / revalidateTag）
- **Lint/Format / テスト**: Biome / vitest

## ルール（常時適用）

@.claude/rules/project.md
@.claude/rules/coding.md
@.claude/rules/documentation.md

## スキル一覧（タスク時に参照）

| スキル | 用途 |
| --- | --- |
| `implement-code` | 実装計画の Phase / 画面(SC-xxx) / コンポーネントを実装するコーディング作業の手順 |
| `write-docs` | 設計書・仕様書・実装計画などドキュメントの作成・更新の手順 |

## よく参照するファイル

- `docs/design.md` — 設計（IA・データモデル・システム構成・コンポーネント・世界観・非機能）
- `docs/specification.md` — 機能仕様（全 15 画面 SC-000〜SC-015）
- `tmp/v1-first/implementation-plan.md` — v1 実装計画（Phase 別・チェックボックス）
- `reference/obsidian/README.md` — Vault のコンテンツ契約（frontmatter / タグ規約）。パーサはこれに依存
- `reference/figma-make/src/App.tsx` — Title/Home/Garden/Map のプロトタイプ実装（正準の見た目）
