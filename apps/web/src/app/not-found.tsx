import {
	Footer,
	KeyboardBack,
	NavBack,
	SpatialNavRegion,
	Window,
} from "@web/components/system";
import { C, font, fs } from "@web/styles/tokens";

/**
 * SC-012 404 Not Found（design §10.6、spec SC-012）。存在しない/非公開ページ・
 * `notFound()`（Garden/Essay/Path の slug 不明時、spec §12.3）両方でこのページが使われる。
 * 走査線・ノイズ演出は控えめにし、本文は可読なまま維持する（可読性ガードレール §10.6）。
 */
export default function NotFound() {
	return (
		<>
			<KeyboardBack href="/home" />
			<main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 p-5">
				<Window title="SYSTEM ERROR" className="w-full">
					<div className="flex flex-col items-center gap-3 p-6 text-center">
						<div
							style={{ fontFamily: font.dot, fontSize: fs(14), color: C.text }}
						>
							SYSTEM ERROR
						</div>
						<p
							style={{ fontFamily: font.min, fontSize: fs(13), color: C.muted }}
						>
							記録が見つかりません。指定されたページは存在しないか、非公開です。
						</p>
						{/* 十字キーの対象（spec SC-012 §12.4）：この 2 項目のみ。 */}
						<SpatialNavRegion className="mt-2 flex gap-5">
							<NavBack label="◀ HOME" href="/home" />
							<NavBack label="SEARCH ▶" href="/search" />
						</SpatialNavRegion>
					</div>
				</Window>
			</main>
			<Footer />
		</>
	);
}
