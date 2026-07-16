import { ConfigPanel } from "@web/components/config";
import { Footer, Nav, NavBack, Window } from "@web/components/system";

/**
 * SC-013 Config（design §11.2/§11.3、spec SC-013、F-CFG-001/F-NAV-002）。
 */
export default function ConfigPage() {
	return (
		<>
			{/* main の幅は他の Nav 設置ページ（/garden 等）と完全に揃える（spec SC-013 §13.2）。
			    CONFIG ウィンドウは mx-auto で中央寄せしつつ、他画面と同じ幅の中で大きく表示する。 */}
			<main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-5">
				<div className="flex flex-wrap items-center gap-3">
					<NavBack label="◀ HOME" href="/home" />
					<h1 className="font-dot text-sm text-arch-text">CONFIG</h1>
				</div>
				<Nav />

				<div className="mx-auto w-full max-w-xl">
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
