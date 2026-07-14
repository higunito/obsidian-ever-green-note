"use client";

import { C, font } from "@web/styles/tokens";
import { useStackNavigation } from "./StackNavigationProvider";

export interface LocalMapNeighbor {
	slug: string;
	file: string;
	title: string;
}

interface LocalMapProps {
	currentFile: string;
	neighbors: readonly LocalMapNeighbor[];
}

const WIDTH = 180;
const HEIGHT = 116;
const CENTER_X = WIDTH / 2;
const CENTER_Y = 58;
const RADIUS = 46;

/**
 * LOCAL MAP（spec SC-004 §4.2 項目5、design §9.2、figma `LocalGraph` を正準）。
 * 中心＝現在ノート、1 階層の関連ノード（Garden 限定、graph.json 由来）を小さな SVG で表示する。
 * ノードクリックは Stack の `open()`（design §5.2）に委ねる（他の入口と同じ遷移経路）。
 */
export function LocalMap({ currentFile, neighbors }: LocalMapProps) {
	const { open } = useStackNavigation();

	return (
		<svg
			width={WIDTH}
			height={HEIGHT}
			style={{ overflow: "visible" }}
			aria-label={`${currentFile} の関連ノート地図`}
		>
			<circle cx={CENTER_X} cy={CENTER_Y} r={7} fill={C.cyan} opacity={0.9} />
			<text
				x={CENTER_X}
				y={CENTER_Y - 12}
				textAnchor="middle"
				style={{ fontFamily: font.dot, fontSize: "8px" }}
				fill={C.cyan}
			>
				{currentFile}
			</text>
			{neighbors.map((neighbor, i) => {
				const angle =
					(i / Math.max(neighbors.length, 1)) * 2 * Math.PI - Math.PI / 2;
				const x = CENTER_X + Math.cos(angle) * RADIUS;
				const y = CENTER_Y + Math.sin(angle) * RADIUS;
				return (
					// biome-ignore lint/a11y/useSemanticElements: SVG <g> は <button> を子に取れないため role+tabIndex+onKeyDown で代替する
					<g
						key={neighbor.slug}
						role="button"
						tabIndex={0}
						aria-label={neighbor.title}
						onClick={() => open(neighbor.slug)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								open(neighbor.slug);
							}
						}}
						style={{ cursor: "pointer" }}
					>
						<title>{neighbor.title}</title>
						<line
							x1={CENTER_X}
							y1={CENTER_Y}
							x2={x}
							y2={y}
							stroke={C.cyanDim}
							strokeWidth={0.8}
						/>
						<circle
							cx={x}
							cy={y}
							r={4}
							fill={C.panelDark}
							stroke={C.cyanDim}
							strokeWidth={0.8}
						/>
						<text
							x={x}
							y={y + 13}
							textAnchor="middle"
							style={{ fontFamily: font.mon, fontSize: "7px" }}
							fill={C.muted}
						>
							{neighbor.file}
						</text>
					</g>
				);
			})}
		</svg>
	);
}
