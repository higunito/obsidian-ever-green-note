"use client";

import { Window } from "@web/components/system";
import { DoorCard, type DoorItem } from "./DoorCard";

interface ThreeDoorsProps {
	doors: readonly DoorItem[];
	onReroll: () => void;
	/** 引き直し中のローディング表示（spec SC-001 §1.5）。 */
	loading?: boolean;
}

/**
 * THREE DOORS — 3つの入口（spec SC-001 §1.3、design §9.3、figma `ThreeDoors` を正準）。
 * 3 枚の表示と「↺ 引き直す」操作のみを担う。選定アルゴリズム（design §5.5）は Phase 5 が
 * `doors`/`onReroll` を通じて注入する（本コンポーネントは graph.json を直接読まない）。
 */
export function ThreeDoors({ doors, onReroll, loading }: ThreeDoorsProps) {
	return (
		<Window title="THREE DOORS — 3つの入口">
			<div className="py-1">
				{doors.map((door) => (
					<DoorCard key={door.slug} door={door} />
				))}
				<div className="px-3 py-1.5 text-right">
					<button
						type="button"
						onClick={onReroll}
						disabled={loading}
						className="font-mon text-[9px] tracking-[0.06em] text-arch-muted transition-colors hover:text-arch-cyan disabled:opacity-40"
					>
						{loading ? "引き直し中…" : "↺ 引き直す"}
					</button>
				</div>
			</div>
		</Window>
	);
}
