import { ConfigPanel } from "@web/components/config";
import { Footer, Nav, NavBack, Window } from "@web/components/system";

/**
 * SC-014 Config（design §11.2/§11.3、spec SC-014、F-CFG-001/F-NAV-002）。
 */
export default function ConfigPage() {
	return (
		<>
			<main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 p-5">
				<div className="flex flex-wrap items-center gap-3">
					<NavBack label="◀ HOME" href="/" />
					<h1 className="font-dot text-sm text-arch-text">CONFIG</h1>
				</div>
				<Nav />

				<Window title="CONFIG">
					<div className="p-2">
						<ConfigPanel />
					</div>
				</Window>
			</main>
			<Footer />
		</>
	);
}
