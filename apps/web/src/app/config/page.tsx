import { ConfigPanel } from "@web/components/config";
import { Footer, Nav, NavBack, Window } from "@web/components/system";

/**
 * SC-013 Config（design §11.2/§11.3、spec SC-013、F-CFG-001/F-NAV-002）。
 */
export default function ConfigPage() {
	return (
		<>
			{/* main の幅は他の Nav 設置ページ（/search 等）と揃える（Phase 9 レビュー：以前は
			    max-w-md で CONFIG ウィンドウ自体の幅に Nav も引きずられて折り返しが窮屈だった）。
			    CONFIG ウィンドウ自体は従来通りコンパクトに保つため、内側の div で幅を絞る。 */}
			<main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-5">
				<div className="flex flex-wrap items-center gap-3">
					<NavBack label="◀ HOME" href="/" />
					<h1 className="font-dot text-sm text-arch-text">CONFIG</h1>
				</div>
				<Nav />

				<div className="max-w-sm">
					<Window title="CONFIG">
						<div className="p-2">
							<ConfigPanel />
						</div>
					</Window>
				</div>
			</main>
			<Footer />
		</>
	);
}
