import { readFileSync } from "node:fs";
import type { CollectionItem, CollectionKind } from "content-schema";
import matter from "gray-matter";
import {
	stringOrUndefined,
	toBoolean,
	toStringArray,
} from "./frontmatter-utils.ts";
import { basenameNoExt, slugify, uniqueSlug } from "./slug.ts";
import { scanZone } from "./vault-scan.ts";

const COLLECTION_KINDS: readonly CollectionKind[] = ["book", "album", "other"];

function toKind(value: unknown): CollectionKind | undefined {
	return COLLECTION_KINDS.includes(value as CollectionKind)
		? (value as CollectionKind)
		: undefined;
}

/**
 * `Collections/`（design §4.5）を解析する。`source_ref` は意図的に読み取らない
 * （フィールドを組み立てないことでサニタイズを構造的に保証する）。
 */
export function loadCollectionItems(vaultDir: string): CollectionItem[] {
	const files = scanZone(vaultDir, "Collections");
	const usedSlugs = new Set<string>();
	const items: CollectionItem[] = [];

	for (const file of files) {
		const raw = readFileSync(file.absPath, "utf8");
		const { data } = matter(raw);
		if (!toBoolean(data.publish)) continue;

		const kind = toKind(data.kind);
		const title = stringOrUndefined(data.title);
		const creator = stringOrUndefined(data.creator);
		// data.year は null/undefined の可能性がある（YAML の空値）。Number(null) は 0 になり
		// Number.isFinite を通ってしまうため、number/string 以外は明示的に NaN 扱いにする。
		const year =
			typeof data.year === "number"
				? data.year
				: typeof data.year === "string"
					? Number(data.year)
					: Number.NaN;

		if (!kind || !title || !creator || !Number.isFinite(year)) {
			console.warn(
				`⚠ Collections/${file.relPath} は必須項目が不足しているためスキップしました`,
			);
			continue;
		}

		const rawSlug = stringOrUndefined(data.slug);
		const slugSource = rawSlug ?? basenameNoExt(file.relPath);
		const slug = uniqueSlug(slugify(slugSource), usedSlugs);
		usedSlugs.add(slug);

		items.push({
			slug,
			title,
			creator,
			year,
			kind,
			cover: stringOrUndefined(data.cover),
			external_url: stringOrUndefined(data.external_url),
			topics: toStringArray(data.topics),
			summary: stringOrUndefined(data.summary) ?? "",
			publish: true,
		});
	}

	items.sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
	return items;
}
