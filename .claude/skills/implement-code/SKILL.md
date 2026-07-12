---
name: implement-code
description: 思考アーカイブのコーディング作業を行うときの手順。実装計画のPhaseを1つ実装する、画面(SC-xxx)やコンポーネント・ジェネレータ・パイプラインを追加/変更するなどのコード実装タスクで使う。
---

# スキル：コード実装

`apps/web` / `packages/*` の実装を、実装計画に沿って進めるための手順。`.claude/rules/coding.md` と `.claude/rules/project.md` を必ず守る。

## 手順

1. **対象を特定する**
   - `tmp/v1-first/implementation-plan.md` を読み、次に着手すべき **未完了の Phase / タスク**を特定する。
   - その Phase の「依存」が完了しているか確認する。未完了なら先にそちらを扱う。

2. **根拠を確認する**
   - 実装対象に対応する `docs/design.md` / `docs/specification.md` の該当節を読む。
   - 画面実装なら該当 `SC-xxx`、データ/構成なら design の該当章を参照する。曖昧な点は実装計画のタスク粒度に従い、それでも不明なら質問する。

3. **ルールを適用して実装する**
   - 型は `@schema`（content-schema）、デザイントークンは `src/styles/tokens.ts`、コンテンツ取得は `ContentStore` 経由。
   - UI 系は Phase 1 の **fixtures** に対して実装し、ジェネレータ/パイプラインの完成を待たない。
   - タスク単位（チェックボックス単位）で小さく進める。

4. **セルフレビューする**
   - `pnpm -w typecheck && pnpm -w lint` を通す。関連テスト（content-gen 等）があれば実行。
   - 観点：型安全（`any` 不使用）／責務分離（Server/Client）／可読性ガードレール／URL 状態の保持／サニタイズ漏れがないか／既存スタイルとの一貫性。

5. **進捗を更新する**
   - 完了したタスクの `[ ]` を `[x]` にする。Phase の「完了条件(DoD)」と「検証コマンド」を満たしたら、その Phase を完了とみなす。

6. **齟齬を見つけたら**
   - design / spec / plan の不整合に気づいたら、実装より先に **文書を直す**（`write-docs` スキル・documentation ルールに従う）。

7. **コミットは手動指示を待つ**
   - `git commit` / `push` は勝手に行わない。区切りがついたら状況を報告し、指示を仰ぐ。

## やらないこと

- `reference/` 配下の編集（読み取り専用）。
- コンテンツ契約（frontmatter キー・公開ゾーン規約）の無断変更。
- アプリから GitHub へ直接アクセスするコードの追加。
