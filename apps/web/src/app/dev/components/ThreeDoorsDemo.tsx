"use client";

import type { DoorItem } from "@web/components/doors";
import { ThreeDoors } from "@web/components/doors";
import { useState } from "react";

interface ThreeDoorsDemoProps {
	initialDoors: readonly DoorItem[];
}

/**
 * カタログページ用のデモ実装。実際の選定アルゴリズム（design §5.5）は Phase 5 で `app/page.tsx` に実装するため、
 * ここでは「引き直す」で並びを反転するだけの見た目確認用ラッパー。
 */
export function ThreeDoorsDemo({ initialDoors }: ThreeDoorsDemoProps) {
	const [doors, setDoors] = useState(initialDoors);
	return (
		<ThreeDoors
			doors={doors}
			onReroll={() => setDoors((prev) => [...prev].reverse())}
		/>
	);
}
