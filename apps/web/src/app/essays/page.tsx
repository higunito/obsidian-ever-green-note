import { EssayCard } from "@web/components/cards";
import {
	Footer,
	KeyboardBack,
	Nav,
	NavBack,
	SpatialNavRegion,
} from "@web/components/system";
import { getContentStore } from "@web/lib/content";
import Link from "next/link";

interface EssaysPageProps {
	searchParams: Promise<{ topic?: string }>;
}

function topicPillClass(active: boolean): string {
	return `border px-1.5 py-0.5 font-dot text-[calc(10px*var(--font-scale))] transition-colors ${
		active
			? "border-arch-cyan bg-arch-cyan-faint text-arch-cyan"
			: "border-arch-border text-arch-muted hover:text-arch-cyan"
	}`;
}

/**
 * SC-005 Essays 一覧（design §9.3、spec SC-005）。
 * v1 は native（Permanent 由来）のみを表示し、note RSS 由来は v2 のため対象外
 * （spec SC-005 v1 スコープ注記 / 本計画 Phase 8 のスコープ注記）。
 * topic フィルタは spec 5.2 の「（任意）topic フィルタ」に対応する単一選択（`?topic=`）。
 */
export default async function EssaysPage({ searchParams }: EssaysPageProps) {
	const { topic: selectedTopic } = await searchParams;

	const store = getContentStore();
	const articles = await store.getArticles();
	const nativeEssays = articles.filter(
		(a) => a.layer === "essay" && a.channel === "native",
	);
	const allTopics = Array.from(
		new Set(nativeEssays.flatMap((e) => e.topics)),
	).sort();
	const filtered = (
		selectedTopic
			? nativeEssays.filter((e) => e.topics.includes(selectedTopic))
			: nativeEssays
	)
		.slice()
		.sort((a, b) => b.updated.localeCompare(a.updated));

	return (
		<>
			<KeyboardBack href="/home" />
			<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-5">
				{/* 十字キーの対象（spec SC-005 §5.3）：topic フィルタ・EssayCard グリッド。 */}
				<SpatialNavRegion className="flex flex-1 flex-col gap-4">
					<div className="flex flex-wrap items-center gap-3">
						<NavBack label="◀ HOME" href="/home" />
						<h1 className="font-dot text-arch-sm text-arch-text">
							ARTICLE / Essays
						</h1>
					</div>
					<Nav />

					{allTopics.length > 0 ? (
						<div className="flex flex-wrap items-center gap-1.5">
							<span className="font-mon text-[calc(9px*var(--font-scale))] text-arch-muted">
								TOPIC:
							</span>
							<Link href="/essays" className={topicPillClass(!selectedTopic)}>
								すべて
							</Link>
							{allTopics.map((topic) => (
								<Link
									key={topic}
									href={`/essays?topic=${encodeURIComponent(topic)}`}
									className={topicPillClass(selectedTopic === topic)}
								>
									{topic}
								</Link>
							))}
						</div>
					) : null}

					{filtered.length === 0 ? (
						<div className="p-8 text-center font-min text-[calc(13px*var(--font-scale))] text-arch-muted">
							<p>まだ記事がありません</p>
							{selectedTopic ? (
								<Link
									href="/essays"
									className="mt-2 inline-block font-mon text-[calc(10px*var(--font-scale))] text-arch-cyan underline"
								>
									フィルタを解除
								</Link>
							) : null}
						</div>
					) : (
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{filtered.map((essay, i) => (
								<EssayCard
									key={essay.slug}
									essay={essay}
									defaultFocus={i === 0}
								/>
							))}
						</div>
					)}
				</SpatialNavRegion>
			</main>
			<Footer />
		</>
	);
}
