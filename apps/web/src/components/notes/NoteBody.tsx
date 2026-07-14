import { cn } from "@web/lib/utils";

interface NoteBodyProps {
	/** Article.bodyHtml。content-gen が remark/rehype で生成し、`[[link]]` は `<a data-wikilink>` へ解決済み（design §9.2 / §12.5）。 */
	html: string;
	className?: string;
}

/**
 * 本文（spec SC-004、figma `NoteBody` を正準）。明朝で段落描画し、内部リンクを `▶リンク名` としてクリック可能に見せる。
 * `▶` の付与と配色は globals.css（`.note-body a[data-wikilink]`）側で行う（HTML は生成時に確定済みのため再パースしない）。
 */
export function NoteBody({ html, className }: NoteBodyProps) {
	return (
		<div
			className={cn(
				"note-body font-min text-sm leading-loose text-arch-text",
				className,
			)}
			// biome-ignore lint/security/noDangerouslySetInnerHtml: content-gen が生成した信頼済み HTML（外部/ユーザー入力ではない）
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}
