import type { ArticleLayer } from "content-schema";
import type { Link, Parent, PhrasingContent, Root, Text } from "mdast";
import { visit } from "unist-util-visit";

export interface WikilinkTarget {
	slug: string;
	layer: ArticleLayer;
}

export type WikilinkResolver = (name: string) => WikilinkTarget | undefined;

const WIKILINK_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

/**
 * 本文中の `[[ノート名]]` / `[[ノート名|表示名]]` を解決する。
 * - 解決できた場合：レイヤーに応じた href（/garden/[slug] | /articles/[slug]）を持つ link ノードに変換し、
 *   `resolved` コールバックで outboundLinks に記録する。
 * - 解決できない場合（非公開ノート・存在しないノート）：**死リンクにせずテキスト化**する（design §12.5 のサニタイズ）。
 *
 * remark-parse が生成する mdast の "text" ノードをテキストレベルで書き換える方式を取る
 * （コードブロック等は "text" ノードにならないため、意図せずコード中の `[[..]]` を変換しない）。
 */
export function applyWikilinks(
	tree: Root,
	resolve: WikilinkResolver,
	onResolved: (target: WikilinkTarget) => void,
): void {
	visit(
		tree,
		"text",
		(node: Text, index, parent: Parent | null | undefined) => {
			if (!parent || index === undefined || index === null) return;
			const value = node.value;
			if (!value.includes("[[")) return;

			const matches = [...value.matchAll(WIKILINK_RE)];
			if (matches.length === 0) return;

			const replacement: PhrasingContent[] = [];
			let lastIndex = 0;
			for (const match of matches) {
				const [full, rawName, rawDisplay] = match;
				const matchIndex = match.index ?? 0;
				const name = rawName.trim();
				const display = (rawDisplay ?? rawName).trim();

				if (matchIndex > lastIndex) {
					replacement.push({
						type: "text",
						value: value.slice(lastIndex, matchIndex),
					});
				}

				const target = resolve(name);
				if (target) {
					onResolved(target);
					const href =
						target.layer === "article"
							? `/articles/${target.slug}`
							: `/garden/${target.slug}`;
					const link: Link = {
						type: "link",
						url: href,
						children: [{ type: "text", value: display }],
						data: { hProperties: { "data-wikilink": target.slug } },
					};
					replacement.push(link);
				} else {
					replacement.push({ type: "text", value: display });
				}

				lastIndex = matchIndex + full.length;
			}

			if (lastIndex < value.length) {
				replacement.push({ type: "text", value: value.slice(lastIndex) });
			}

			parent.children.splice(index, 1, ...replacement);
			// 置き換えたノード群を再訪問しないよう、末尾の次の位置へスキップする。
			return index + replacement.length;
		},
	);
}
