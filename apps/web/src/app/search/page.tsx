import { SearchPanel } from "@web/components/search";
import { Footer, Nav, NavBack } from "@web/components/system";
import { getContentStore } from "@web/lib/content";

interface SearchPageProps {
	searchParams: Promise<{ q?: string }>;
}

/**
 * SC-012 Search（design §4.4、spec SC-012）。search-index.json はこのページでのみ取得する
 * （design §12.1「必要ページで遅延読み込み」）。実検索・ハイライトは `SearchPanel`（クライアント）に委譲する。
 */
export default async function SearchPage({ searchParams }: SearchPageProps) {
	const { q } = await searchParams;

	const store = getContentStore();
	const { items } = await store.getSearchIndex();

	return (
		<>
			<main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-5">
				<div className="flex flex-wrap items-center gap-3">
					<NavBack label="◀ HOME" href="/" />
					<h1 className="font-dot text-sm text-arch-text">SEARCH / 検索</h1>
				</div>
				<Nav />

				<SearchPanel items={items} initialQuery={q ?? ""} />
			</main>
			<Footer />
		</>
	);
}
