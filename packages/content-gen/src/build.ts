import type {
	Article,
	Collections,
	Graph,
	GraphEdge,
	GraphNode,
	GraphTopic,
	Pages,
	PathItem,
	SearchIndex,
} from "content-schema";
import { loadCollectionItems } from "./collections.ts";
import {
	computeNodeBasePosition,
	computeTopicPositions,
	relaxCollisions,
	round,
} from "./coordinates.ts";
import {
	buildNameIndex,
	computeBacklinks,
	createResolver,
	loadPublishableNotes,
	type PublishableNote,
	renderNoteBodies,
} from "./notes.ts";
import { loadPages } from "./pages.ts";
import {
	assignPseudoFilenames,
	type PseudoFileTarget,
} from "./pseudo-filename.ts";

export interface GenerateResult {
	articles: Article[];
	graph: Graph;
	searchIndex: SearchIndex;
	collections: Collections;
	paths: PathItem[];
	pages: Pages;
}

function bySlug<T extends { slug: string }>(a: T, b: T): number {
	return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
}

/**
 * Vault（1 断面）から 6 種類の JSON を決定論的に組み立てる。
 * 副作用はここでは行わない（zod 検証・ファイル書き出しは呼び出し側 = cli.ts の責務）。
 */
export function generateContent(vaultDir: string): GenerateResult {
	const notes = loadPublishableNotes(vaultDir);
	const nameIndex = buildNameIndex(notes);
	const resolve = createResolver(nameIndex);
	renderNoteBodies(notes, resolve);
	const backlinks = computeBacklinks(notes);

	const sortedNotes = [...notes].sort(bySlug);

	const articles: Article[] = sortedNotes.map((note) => ({
		slug: note.slug,
		layer: note.layer,
		title: note.title,
		date: note.date,
		updated: note.updated,
		status: note.status,
		topics: note.topics,
		tags: note.tags,
		summary: note.summary,
		channel: note.channel,
		outboundLinks: note.outboundLinks,
		backlinks: backlinks.get(note.slug) ?? [],
		publish: true,
		bodyHtml: note.bodyHtml,
	}));

	const graph = buildGraph(sortedNotes);
	const searchIndex = buildSearchIndex(sortedNotes);
	const paths = buildPaths(sortedNotes);
	const collectionItems = loadCollectionItems(vaultDir);
	const pages = loadPages(vaultDir, resolve);

	return {
		articles,
		graph,
		searchIndex,
		collections: { items: collectionItems },
		paths,
		pages,
	};
}

/** Map（調査マップ）は Garden 層だけの機能（design §3.2 SC-003 は `/garden?view=map`）。 */
function buildGraph(notes: readonly PublishableNote[]): Graph {
	const gardenNotes = notes.filter((n) => n.layer === "garden");
	const gardenSlugs = new Set(gardenNotes.map((n) => n.slug));

	const topicIds = Array.from(
		new Set(gardenNotes.flatMap((n) => n.topics)),
	).sort();
	const topicPositions = computeTopicPositions(topicIds);

	const basePositions = gardenNotes.map((note) => {
		const primaryTopic = note.topics[0];
		const primaryPos = primaryTopic
			? topicPositions.get(primaryTopic)
			: undefined;
		return computeNodeBasePosition(note.slug, primaryPos);
	});
	relaxCollisions(basePositions);

	const pseudoTargets: PseudoFileTarget[] = gardenNotes.map((note) => ({
		slug: note.slug,
		extension: note.isMoc ? ".EXE" : ".DAT",
	}));
	const fileNames = assignPseudoFilenames(pseudoTargets);

	const nodes: GraphNode[] = gardenNotes.map((note, index) => {
		const pos = round(basePositions[index]);
		return {
			id: note.slug,
			layer: note.layer,
			status: note.status,
			topics: note.topics,
			title: note.title,
			file: fileNames.get(note.slug) ?? `UNKNOWN${index}.DAT`,
			x: pos.x,
			y: pos.y,
		};
	});

	const topics: GraphTopic[] = topicIds.map((id) => {
		const pos = round(topicPositions.get(id) ?? { x: 0, y: 0 });
		const count = gardenNotes.filter((n) => n.topics.includes(id)).length;
		return { id, x: pos.x, y: pos.y, count };
	});

	const edges: GraphEdge[] = [];
	for (const note of gardenNotes) {
		for (const target of note.outboundLinks) {
			if (gardenSlugs.has(target)) {
				edges.push({ source: note.slug, target, kind: "note" });
			}
		}
		for (const topic of note.topics) {
			edges.push({ source: note.slug, target: topic, kind: "topic" });
		}
	}

	return { topics, nodes, edges };
}

function buildSearchIndex(notes: readonly PublishableNote[]): SearchIndex {
	return {
		items: notes.map((note) => ({
			slug: note.slug,
			layer: note.layer,
			title: note.title,
			summary: note.summary,
			topics: note.topics,
			text: note.plainText,
		})),
	};
}

/** `tags:[moc]` の束ねノートを 1 Path として抽出する（design §4.6 / §5.3）。 */
function buildPaths(notes: readonly PublishableNote[]): PathItem[] {
	const notesBySlug = new Map(notes.map((n) => [n.slug, n]));
	const mocNotes = notes.filter((n) => n.layer === "garden" && n.isMoc);

	return mocNotes.map((moc) => {
		const steps = moc.outboundLinks;
		const topics: string[] = [];
		const seenTopics = new Set<string>();
		for (const stepSlug of steps) {
			const stepNote = notesBySlug.get(stepSlug);
			if (!stepNote) continue;
			for (const topic of stepNote.topics) {
				if (!seenTopics.has(topic)) {
					seenTopics.add(topic);
					topics.push(topic);
				}
			}
		}
		return {
			slug: moc.slug,
			title: moc.title,
			summary: moc.summary,
			topics,
			steps,
		};
	});
}
