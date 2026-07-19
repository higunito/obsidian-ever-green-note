import { readFileSync } from "node:fs";
import type { ArticleChannel, ArticleLayer, NoteStatus } from "content-schema";
import matter from "gray-matter";
import {
	normalizeDateOnly,
	stringOrUndefined,
	toBoolean,
	toNoteStatus,
	toStringArray,
} from "./frontmatter-utils.ts";
import { renderMarkdown } from "./markdown.ts";
import { basenameNoExt, slugify, uniqueSlug } from "./slug.ts";
import { type FoundFile, scanZone } from "./vault-scan.ts";
import type { WikilinkResolver } from "./wikilink.ts";

/** Now は Fleeting 直下の予約ファイルであり、通常の Garden ノートとしては扱わない（v1 スコープ外）。 */
const RESERVED_FLEETING_FILES = new Set(["now.md"]);

export interface PublishableNote {
	relPath: string;
	layer: ArticleLayer;
	channel?: ArticleChannel;
	slug: string;
	title: string;
	date: string;
	updated: string;
	status?: NoteStatus;
	topics: string[];
	tags: string[];
	summary: string;
	aliases: string[];
	isMoc: boolean;
	body: string;
	bodyHtml: string;
	outboundLinks: string[];
	plainText: string;
}

interface Candidate {
	relPath: string;
	layer: ArticleLayer;
	channel?: ArticleChannel;
	data: Record<string, unknown>;
	body: string;
}

function loadCandidate(
	file: FoundFile,
	layer: ArticleLayer,
	channel?: ArticleChannel,
): Candidate {
	const raw = readFileSync(file.absPath, "utf8");
	const parsed = matter(raw);
	return {
		relPath: file.relPath,
		layer,
		channel,
		data: (parsed.data ?? {}) as Record<string, unknown>,
		body: parsed.content,
	};
}

/**
 * Fleeting/（→garden）・Permanent/（→essay）から publish:true のノートだけを読み込む。
 * 非公開ゾーンは scanZone を一切呼ばないため、この関数の走査結果に非公開ノートが混じることはない。
 */
export function loadPublishableNotes(vaultDir: string): PublishableNote[] {
	const fleetingFiles = scanZone(vaultDir, "Fleeting").filter(
		(f) => !RESERVED_FLEETING_FILES.has(f.relPath),
	);
	const permanentFiles = scanZone(vaultDir, "Permanent");

	const candidates: Candidate[] = [
		...fleetingFiles.map((f) => loadCandidate(f, "garden")),
		...permanentFiles.map((f) =>
			loadCandidate(
				f,
				"essay",
				f.relPath.startsWith("note/") ? "note" : "native",
			),
		),
	];

	const usedSlugs = new Set<string>();
	const notes: PublishableNote[] = [];

	for (const candidate of candidates) {
		if (!toBoolean(candidate.data.publish)) continue;

		const title =
			stringOrUndefined(candidate.data.title) ??
			basenameNoExt(candidate.relPath);
		const rawSlug = stringOrUndefined(candidate.data.slug);
		const slugSource = rawSlug ?? basenameNoExt(candidate.relPath);
		const slug = uniqueSlug(slugify(slugSource), usedSlugs);
		usedSlugs.add(slug);

		const tags = toStringArray(candidate.data.tags);

		notes.push({
			relPath: candidate.relPath,
			layer: candidate.layer,
			channel: candidate.layer === "essay" ? candidate.channel : undefined,
			slug,
			title,
			date: normalizeDateOnly(candidate.data.date),
			updated: normalizeDateOnly(candidate.data.updated),
			status:
				candidate.layer === "garden"
					? toNoteStatus(candidate.data.status)
					: undefined,
			topics: toStringArray(candidate.data.topics),
			tags,
			summary: stringOrUndefined(candidate.data.summary) ?? "",
			aliases: toStringArray(candidate.data.aliases),
			isMoc: tags.includes("moc"),
			body: candidate.body,
			bodyHtml: "",
			outboundLinks: [],
			plainText: "",
		});
	}

	return notes;
}

export interface NameIndexEntry {
	slug: string;
	layer: ArticleLayer;
}

/**
 * wikilink 解決用の名前索引。ノート名（≒ファイル名）を主キーとし、title・aliases もフォールバックとして登録する
 * （README「ノート間のリンクは[[ノート名]]形式（ファイルパスではなくノート名）」）。
 * 同名が複数ノートにまたがる場合は走査順で先に見つかった方を優先する（決定論的）。
 */
export function buildNameIndex(
	notes: readonly PublishableNote[],
): Map<string, NameIndexEntry> {
	const index = new Map<string, NameIndexEntry>();
	const register = (name: string | undefined, entry: NameIndexEntry) => {
		if (!name) return;
		if (!index.has(name)) index.set(name, entry);
	};
	for (const note of notes) {
		const entry: NameIndexEntry = { slug: note.slug, layer: note.layer };
		register(basenameNoExt(note.relPath), entry);
		register(note.title, entry);
		for (const alias of note.aliases) register(alias, entry);
	}
	return index;
}

/** 名前索引から wikilink リゾルバを組み立てる。 */
export function createResolver(
	nameIndex: ReadonlyMap<string, NameIndexEntry>,
): WikilinkResolver {
	return (name: string) => nameIndex.get(name);
}

/** 本文を HTML/プレーンテキストへレンダリングし、outboundLinks を確定させる（破壊的更新）。 */
export function renderNoteBodies(
	notes: PublishableNote[],
	resolve: WikilinkResolver,
): void {
	for (const note of notes) {
		const result = renderMarkdown(note.body, resolve);
		note.bodyHtml = result.html;
		note.plainText = result.text;
		note.outboundLinks = result.outboundLinks;
	}
}

/** 全ノートの outboundLinks を逆引きして backlinks を算出する（design §5.1）。 */
export function computeBacklinks(
	notes: readonly PublishableNote[],
): Map<string, string[]> {
	const backlinks = new Map<string, string[]>();
	for (const note of notes) backlinks.set(note.slug, []);
	for (const note of notes) {
		for (const target of note.outboundLinks) {
			const list = backlinks.get(target);
			if (list) list.push(note.slug);
		}
	}
	return backlinks;
}
