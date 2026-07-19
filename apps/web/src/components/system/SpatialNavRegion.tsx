"use client";

import { useSpatialNavigation } from "@web/lib/use-spatial-navigation";
import type { ReactNode } from "react";

interface SpatialNavRegionProps {
	children: ReactNode;
	className?: string;
	itemSelector?: string;
	enabled?: boolean;
}

/**
 * セレクタ型 UI（design §9.6.2）のコンテナ。Server Component から渡された `children` を
 * そのまま描画しつつ、内部の `<a>`/`<button>`（既定）を十字キーで選択できるようにする。
 * `Nav`/`NavBack` はこの領域の外に置くことで十字キー操作の対象から除外する（design §9.6.2）。
 */
export function SpatialNavRegion({
	children,
	className,
	itemSelector,
	enabled,
}: SpatialNavRegionProps) {
	const ref = useSpatialNavigation<HTMLDivElement>({ itemSelector, enabled });
	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
}
