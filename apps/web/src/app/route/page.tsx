import { PathCard } from "@web/components/cards";
import {
	Footer,
	KeyboardBack,
	Nav,
	NavBack,
	SpatialNavRegion,
} from "@web/components/system";
import { getContentStore } from "@web/lib/content";

/**
 * SC-007 Paths 一覧（design §4.6 / §5.3、spec SC-007）。`paths.json`（`tags:[moc]` 由来）から
 * `PathCard` 一覧を表示する。
 */
export default async function PathsPage() {
	const store = getContentStore();
	const paths = await store.getPaths();

	return (
		<>
			<KeyboardBack href="/home" />
			<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-5">
				{/* 十字キーの対象（spec SC-007 §7.3）：PathCard 一覧。 */}
				<SpatialNavRegion className="flex flex-1 flex-col gap-4">
					<div className="flex flex-wrap items-center gap-3">
						<NavBack label="◀ HOME" href="/home" />
						<h1 className="font-dot text-arch-sm text-arch-text">ROUTE</h1>
					</div>
					<Nav />

					{paths.length === 0 ? (
						<div className="p-8 text-center font-min text-[calc(13px*var(--font-scale))] text-arch-muted">
							まだルートがありません
						</div>
					) : (
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{paths.map((path, i) => (
								<PathCard key={path.slug} path={path} defaultFocus={i === 0} />
							))}
						</div>
					)}
				</SpatialNavRegion>
			</main>
			<Footer />
		</>
	);
}
