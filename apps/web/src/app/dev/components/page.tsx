import { EssayCard } from "@web/components/cards";
import type { DoorItem } from "@web/components/doors";
import { Badge, NoteBody, NoteCard, Tag } from "@web/components/notes";
import { Window } from "@web/components/system";
import { getContentStore } from "@web/lib/content";
import type { NoteStatus } from "@web/types/content";
import { notFound } from "next/navigation";
import { ThreeDoorsDemo } from "./ThreeDoorsDemo";

const ALL_STATUSES: readonly NoteStatus[] = ["seed", "growing", "evergreen"];

/**
 * Phase 4 コンポーネントカタログ（実装計画 Phase 4 の任意タスク）。
 * fixtures 上で各コンポーネントが破綻なく描画されるかの確認用。`NODE_ENV=production` では非公開。
 */
export default async function ComponentCatalogPage() {
	if (process.env.NODE_ENV === "production") {
		notFound();
	}

	const store = getContentStore();
	const articles = await store.getArticles();
	const gardenNotes = articles.filter((a) => a.layer === "garden");
	const essays = articles.filter((a) => a.layer === "essay");
	const bodySample = gardenNotes.find(
		(n) => n.slug === "narrative-and-reality",
	);

	const doors: DoorItem[] = [];
	const seenTopics = new Set<string>();
	for (const note of gardenNotes) {
		const topic = note.topics[0];
		if (!topic || seenTopics.has(topic)) continue;
		seenTopics.add(topic);
		doors.push({
			topic,
			slug: note.slug,
			layer: note.layer,
			noteTitle: note.title,
		});
		if (doors.length === 3) break;
	}

	return (
		<main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-5">
			<h1 className="font-dot text-sm text-arch-cyan">
				Phase 4 コンポーネントカタログ（開発専用）
			</h1>

			<Window title="Badge / Tag">
				<div className="flex flex-wrap items-center gap-3 p-3">
					{ALL_STATUSES.map((status) => (
						<Badge key={status} status={status} />
					))}
					<Tag label="美学" />
					<Tag label="物語論" />
				</div>
			</Window>

			<Window title="NoteCard">
				<div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3">
					{gardenNotes.map((note) => (
						<NoteCard key={note.slug} note={note} />
					))}
				</div>
			</Window>

			{bodySample ? (
				<Window title="NoteBody">
					<div className="p-4">
						<NoteBody html={bodySample.bodyHtml} />
					</div>
				</Window>
			) : null}

			<Window title="EssayCard">
				<div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2">
					{essays.map((essay) => (
						<EssayCard key={essay.slug} essay={essay} />
					))}
				</div>
			</Window>

			<div className="max-w-xs">
				{doors.length === 3 ? <ThreeDoorsDemo initialDoors={doors} /> : null}
			</div>
		</main>
	);
}
