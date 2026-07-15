import { CollectionCard } from "@web/components/cards";
import { Footer, Nav, NavBack } from "@web/components/system";
import { getContentStore } from "@web/lib/content";
import type { CollectionKind } from "@web/types/content";
import Link from "next/link";

interface CollectionsPageProps {
	searchParams: Promise<{ kind?: string }>;
}

const KIND_TABS: readonly { value: CollectionKind; label: string }[] = [
	{ value: "book", label: "Books" },
	{ value: "album", label: "Albums" },
	{ value: "film", label: "Films" },
	{ value: "link", label: "Links" },
];

const KIND_VALUES = new Set<string>(KIND_TABS.map((t) => t.value));

function parseKind(value: string | undefined): CollectionKind {
	return value && KIND_VALUES.has(value) ? (value as CollectionKind) : "book";
}

function tabClass(active: boolean): string {
	return `font-dot text-xs tracking-[0.06em] transition-colors ${
		active ? "text-arch-cyan" : "text-arch-muted hover:text-arch-cyan"
	}`;
}

/**
 * SC-007 Collections（design §9.3 / §4.5、spec SC-007）。
 * kind タブは常に 1 つ選択済み（spec は「すべて」タブを定義していないため既定は先頭の Books）。
 * `source_ref` は生成時サニタイズ済みでそもそも受け取らない（design §12.5）。
 */
export default async function CollectionsPage({
	searchParams,
}: CollectionsPageProps) {
	const { kind: kindParam } = await searchParams;
	const kind = parseKind(kindParam);

	const store = getContentStore();
	const { items } = await store.getCollections();
	const filtered = items.filter((item) => item.kind === kind);

	// Albums タブは JUKEBOX 風の見せ方にしてよい（spec SC-007 §7.2）。密なグリッドで音の資料室らしさを出す。
	const isAlbums = kind === "album";

	return (
		<>
			<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-5">
				<div className="flex flex-wrap items-center gap-3">
					<NavBack label="◀ HOME" href="/" />
					<h1 className="font-dot text-sm text-arch-text">
						INFLUENCE / Collections
					</h1>
				</div>
				<Nav />

				<div className="flex flex-wrap gap-4 border-b border-arch-border-faint pb-2">
					{KIND_TABS.map((tab) => (
						<Link
							key={tab.value}
							href={`/collections?kind=${tab.value}`}
							className={tabClass(kind === tab.value)}
						>
							{tab.label}
						</Link>
					))}
				</div>

				{isAlbums ? (
					<div className="font-mon text-[9px] tracking-[0.14em] text-arch-muted">
						♪ JUKEBOX — 音の資料室
					</div>
				) : null}

				{filtered.length === 0 ? (
					<div className="p-8 text-center font-min text-[13px] text-arch-muted">
						このカテゴリの収集物はまだありません
					</div>
				) : (
					<div
						className={
							isAlbums
								? "grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5"
								: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
						}
					>
						{filtered.map((item) => (
							<CollectionCard key={item.slug} item={item} />
						))}
					</div>
				)}
			</main>
			<Footer />
		</>
	);
}
