import type { Article, ArticleLayer } from "@web/types/content";
import Link from "next/link";
import type { ReactNode } from "react";

// 内部リンクの遷移先はレイヤーで決まる（Garden→/garden、Essay→/articles。design §5.2 / spec SC-006）。
export function layerBasePath(layer: ArticleLayer): string {
	return layer === "article" ? "/articles" : "/garden";
}

// 生成物（bodyHtml）の href は slug を percent-encode しているため、アプリ側も同じ規則で組み立てる。
export function internalHref(target: {
	slug: string;
	layer: ArticleLayer;
}): string {
	return `${layerBasePath(target.layer)}/${encodeURIComponent(target.slug)}`;
}

// slug → layer の索引。bodyHtml 中の `data-wikilink="<slug>"` から遷移先レイヤーを解決するのに使う。
export function buildLayerIndex(
	articles: readonly Article[],
): Map<string, ArticleLayer> {
	return new Map(articles.map((a) => [a.slug, a.layer]));
}

export function resolveTarget(
	slug: string,
	layerIndex: ReadonlyMap<string, ArticleLayer>,
): { slug: string; layer: ArticleLayer } | undefined {
	const layer = layerIndex.get(slug);
	return layer ? { slug, layer } : undefined;
}

interface InternalLinkProps {
	slug: string;
	layer: ArticleLayer;
	children: ReactNode;
	className?: string;
}

/**
 * 内部ノートへのクリック可能なリンク。遷移先レイヤーの判定は呼び出し側が済ませて渡す。
 * Stack View（Phase 6）はこのリンクのクリックを横取りしてカラムを積むため、href も正しく保持する。
 */
export function InternalLink({
	slug,
	layer,
	children,
	className,
}: InternalLinkProps) {
	return (
		<Link
			href={internalHref({ slug, layer })}
			data-wikilink={slug}
			className={className}
		>
			{children}
		</Link>
	);
}
