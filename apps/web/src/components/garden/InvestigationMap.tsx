"use client";

import { Badge } from "@web/components/notes";
import { SpatialNavRegion } from "@web/components/system";
import type { GardenFilters } from "@web/lib/garden-filters";
import { gardenFilterMatchesNode } from "@web/lib/garden-filters";
import { useFlashNavigate } from "@web/lib/use-flash-navigate";
import { C, font, fs, statusColor } from "@web/styles/tokens";
import type {
	Article,
	Graph,
	GraphEdge,
	GraphNode,
	GraphTopic,
} from "@web/types/content";
import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

interface InvestigationMapProps {
	graph: Graph;
	/** ツールチップの summary 表示用（graph.json は summary を持たないため articles.json と結合する）。 */
	articles: readonly Article[];
	filters: GardenFilters;
	/** 遷移確認モーダルの開閉状態。呼び出し側（`GardenScreen`）が保持する（design §9.6.2 v1.18：
	 * ページ全体を 1 つのセレクタ型 UI 領域にするため、モーダル開閉に応じた領域の有効/無効切り替えを
	 * 呼び出し側に委ねる）。 */
	pendingNav: PendingNavigation | null;
	setPendingNav: (pending: PendingNavigation | null) => void;
}

// design §9.5：トピックは生成時に中心 (450,300) を基準に円周配置される。クライアントはこの基準点だけ共有し、座標自体は再計算しない。
const CENTER = { x: 450, y: 300 };
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3.5;
const ZOOM_STEP = 0.25;

function clampZoom(zoom: number): number {
	return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

function pointerDistance(
	a: { x: number; y: number },
	b: { x: number; y: number },
): number {
	return Math.hypot(a.x - b.x, a.y - b.y);
}

// CENTER はコンテナ左上からの絶対ピクセル位置ではなく、コンテナの実サイズから中央寄せする
// （狭いモバイル幅で CENTER.x=450 のまま固定すると、コンテンツがキャンバス外に押し出されて何も見えなくなるため）。
function computeCenteredPan(el: HTMLDivElement | null): {
	x: number;
	y: number;
} {
	if (!el) return { x: 0, y: 0 };
	const rect = el.getBoundingClientRect();
	return { x: rect.width / 2 - CENTER.x, y: rect.height / 2 - CENTER.y };
}

/** kind:"note" の辺は生成時に双方向（source⇄target）で重複するため、無向辺として重複排除する。 */
function dedupeNoteEdges(edges: readonly GraphEdge[]): GraphEdge[] {
	const seen = new Set<string>();
	const result: GraphEdge[] = [];
	for (const edge of edges) {
		if (edge.kind !== "note") continue;
		const key =
			edge.source < edge.target
				? `${edge.source}|${edge.target}`
				: `${edge.target}|${edge.source}`;
		if (seen.has(key)) continue;
		seen.add(key);
		result.push(edge);
	}
	return result;
}

// cursor-pointer は明示必須：コンテナ側が cursor:grab/grabbing を指定しており、
// これは inherit されるためボタン側で上書きしないと指カーソルにならない。
const zoomButtonClass =
	"flex h-7 w-7 cursor-pointer items-center justify-center border border-arch-border bg-arch-panel-dark font-mon text-arch-sm text-arch-cyan";

export interface PendingNavigation {
	href: string;
	title: string;
}

/**
 * ノートノードクリック時の遷移確認モーダル（spec SC-003 §3.2/§3.3、F-MAP-003）。
 * マップ上に直接遷移せず、いったん確認を挟む。
 */
function NavigateConfirmDialog({
	pending,
	onConfirm,
	onCancel,
	confirmFlashing,
}: {
	pending: PendingNavigation;
	onConfirm: () => void;
	onCancel: () => void;
	/** 「移動する」押下後のビビビ点滅演出中か（useFlashNavigate、v1.12）。 */
	confirmFlashing: boolean;
}) {
	return (
		// 地図側のパン操作（コンテナの onPointerDown/Move/Up）へイベントが伝播すると、
		// モーダル内のボタンクリックがドラッグ開始と競合して効かなくなるため止める。
		<div
			className="fixed inset-0 z-[200] flex items-center justify-center p-4"
			onPointerDown={(e) => e.stopPropagation()}
			onPointerMove={(e) => e.stopPropagation()}
			onPointerUp={(e) => e.stopPropagation()}
		>
			<button
				type="button"
				aria-label="キャンセル"
				onClick={onCancel}
				className="absolute inset-0 bg-black/70"
			/>
			<div
				className="relative min-w-[260px] max-w-[90vw] border-2"
				style={{
					borderColor: C.cyan,
					background: C.panel,
					boxShadow: `inset 1px 1px 0 ${C.borderHi}, inset -1px -1px 0 ${C.borderSh}, 0 0 22px ${C.cyanDim}`,
				}}
			>
				<div
					className="flex items-center gap-2 px-3 py-2"
					style={{
						background:
							"linear-gradient(90deg, #1c3a56 0%, #112230 60%, #0c1a28 100%)",
						borderBottom: `2px solid ${C.border}`,
						fontFamily: font.dot,
						fontSize: fs(11),
						color: C.cyan,
						letterSpacing: "0.08em",
					}}
				>
					<span style={{ opacity: 0.35 }}>▪</span>
					SYSTEM CONFIRM
				</div>
				<div className="p-4">
					<p className="font-min text-[calc(13px*var(--font-scale))] text-arch-text">
						「{pending.title}」へ移動する
					</p>
					{/* 十字キーの対象（spec SC-003 §3.3）：モーダル表示中はこの 2 ボタンのみ。 */}
					<SpatialNavRegion className="mt-4 flex justify-end gap-2">
						<button
							type="button"
							onClick={onCancel}
							className="cursor-pointer border border-arch-border px-3 py-1.5 font-dot text-[calc(11px*var(--font-scale))] text-arch-muted"
						>
							キャンセル
						</button>
						<button
							type="button"
							onClick={onConfirm}
							className={`cursor-pointer border-2 px-3 py-1.5 font-dot text-[calc(11px*var(--font-scale))] text-arch-cyan ${confirmFlashing ? "arch-animated" : ""}`}
							style={{
								borderColor: C.cyan,
								boxShadow: `inset 1px 1px 0 ${C.borderHi}, inset -1px -1px 0 ${C.borderSh}`,
								animation: confirmFlashing
									? "navFlash 0.3s steps(1) 1"
									: "none",
							}}
						>
							移動する
						</button>
					</SpatialNavRegion>
				</div>
			</div>
		</div>
	);
}

/**
 * SC-003 調査マップ（design §9.3・§9.5、spec SC-003、figma `MapScreen` を正準）。
 * `graph.json` の座標を読むだけで、パン／ズーム／Lens フィルタによる dim／ツールチップ／
 * ノードクリック遷移（`/garden/[slug]` への直リンク、Stack は経由しない）を担う。
 * 十字キー・B ボタンの制御（セレクタ型 UI 領域・戻る処理）は呼び出し側の `GardenScreen` が担う
 * （design §9.6.2 v1.18：マップとその外側の `Nav`/Lens フィルタを同一領域にするため）。
 */
export function InvestigationMap({
	graph,
	articles,
	filters,
	pendingNav,
	setPendingNav,
}: InvestigationMapProps) {
	const { flashingKey: navFlashingKey, navigate: navigateWithFlash } =
		useFlashNavigate();
	const containerRef = useRef<HTMLDivElement>(null);
	const pointers = useRef(new Map<number, { x: number; y: number }>());
	const dragStart = useRef<{
		x: number;
		y: number;
		panX: number;
		panY: number;
	} | null>(null);
	const pinchStart = useRef<{ dist: number; zoom: number } | null>(null);
	const hasInteractedRef = useRef(false);

	const [pan, setPan] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [dragging, setDragging] = useState(false);
	const [hoverId, setHoverId] = useState<string | null>(null);
	const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
	// 十字キーでノードを選択したときも、マウスホバーと同じツールチップを出す（design §9.6.2）。
	// GardenScreen がマップとその外側を1つの十字キー領域にしているため、選択状態は自 DOM の
	// `data-roving-selected` 属性の変化としてしか観測できない（`useSpatialNavigation` は実 DOM
	// フォーカスを移動しないため onFocus では検知できない）。マウス由来の hoverId とは独立させ、
	// 表示時はマウスを優先する（マウス操作中に不用意に消えないようにするため）。
	const [keyboardHoverId, setKeyboardHoverId] = useState<string | null>(null);
	const [keyboardTooltipPos, setKeyboardTooltipPos] = useState({ x: 0, y: 0 });

	const nodesById = useMemo(
		() => new Map<string, GraphNode>(graph.nodes.map((n) => [n.id, n])),
		[graph.nodes],
	);
	const topicsById = useMemo(
		() => new Map<string, GraphTopic>(graph.topics.map((t) => [t.id, t])),
		[graph.topics],
	);
	const summaryBySlug = useMemo(
		() => new Map(articles.map((a) => [a.slug, a.summary])),
		[articles],
	);
	const topicEdges = useMemo(
		() => graph.edges.filter((e) => e.kind === "topic"),
		[graph.edges],
	);
	const noteEdges = useMemo(() => dedupeNoteEdges(graph.edges), [graph.edges]);
	const nodeVisibility = useMemo(() => {
		const map = new Map<string, boolean>();
		for (const node of graph.nodes)
			map.set(node.id, gardenFilterMatchesNode(node, filters));
		return map;
	}, [graph.nodes, filters]);

	// ホイールは preventDefault が必要（ページスクロールと競合するため）。
	// React の onWheel は passive 扱いになりうるため、ref 経由でネイティブリスナーを張る。
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		function handleWheel(e: WheelEvent) {
			e.preventDefault();
			setZoom((z) => clampZoom(z * (1 - e.deltaY * 0.001)));
		}
		el.addEventListener("wheel", handleWheel, { passive: false });
		return () => el.removeEventListener("wheel", handleWheel);
	}, []);

	// 十字キーでのノード選択を検知してツールチップを出す。ノード <Link> の `data-node-id` を
	// 目印に、コンテナ配下で `data-roving-selected="true"` を持つ要素を都度探し直す。
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		function syncKeyboardHover() {
			const selected = el?.querySelector<HTMLElement>(
				'[data-roving-selected="true"]',
			);
			const nodeId = selected?.dataset.nodeId;
			if (!nodeId) {
				setKeyboardHoverId(null);
				return;
			}
			const rect = selected.getBoundingClientRect();
			setKeyboardTooltipPos({
				x: rect.left + rect.width / 2,
				y: rect.top + rect.height / 2,
			});
			setKeyboardHoverId(nodeId);
		}
		const observer = new MutationObserver(syncKeyboardHover);
		observer.observe(el, {
			attributes: true,
			attributeFilter: ["data-roving-selected"],
			subtree: true,
		});
		return () => observer.disconnect();
	}, []);

	// 初期表示はコンテナ中央にマップの原点が来るよう pan を補正する（狭いモバイル幅対応）。
	// ユーザーが一度でも操作したら、以降のリサイズでは中央寄せし直さない。
	useLayoutEffect(() => {
		function recenter() {
			if (hasInteractedRef.current) return;
			setPan(computeCenteredPan(containerRef.current));
		}
		recenter();
		window.addEventListener("resize", recenter);
		return () => window.removeEventListener("resize", recenter);
	}, []);

	function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
		hasInteractedRef.current = true;
		e.currentTarget.setPointerCapture(e.pointerId);
		pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
		if (pointers.current.size === 2) {
			const [p1, p2] = Array.from(pointers.current.values());
			pinchStart.current = { dist: pointerDistance(p1, p2), zoom };
			dragStart.current = null;
		} else if (pointers.current.size === 1) {
			setDragging(true);
			dragStart.current = {
				x: e.clientX,
				y: e.clientY,
				panX: pan.x,
				panY: pan.y,
			};
		}
	}

	function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
		if (!pointers.current.has(e.pointerId)) return;
		pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
		if (pointers.current.size === 2 && pinchStart.current) {
			const [p1, p2] = Array.from(pointers.current.values());
			const dist = pointerDistance(p1, p2);
			setZoom(
				clampZoom(pinchStart.current.zoom * (dist / pinchStart.current.dist)),
			);
			return;
		}
		if (pointers.current.size === 1 && dragStart.current) {
			setPan({
				x: dragStart.current.panX + e.clientX - dragStart.current.x,
				y: dragStart.current.panY + e.clientY - dragStart.current.y,
			});
		}
	}

	function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
		pointers.current.delete(e.pointerId);
		pinchStart.current = null;
		if (pointers.current.size === 1) {
			const remaining = Array.from(pointers.current.values())[0];
			dragStart.current = {
				x: remaining.x,
				y: remaining.y,
				panX: pan.x,
				panY: pan.y,
			};
			setDragging(true);
		} else {
			dragStart.current = null;
			setDragging(false);
		}
	}

	// マウスホバー中はマウスを優先し、無ければ十字キーでの選択を採用する。
	const activeHoverId = hoverId ?? keyboardHoverId;
	const activeTooltipPos = hoverId ? tooltipPos : keyboardTooltipPos;
	const hoverNode = activeHoverId ? nodesById.get(activeHoverId) : undefined;
	const hoverTopic =
		activeHoverId && !hoverNode ? topicsById.get(activeHoverId) : undefined;

	return (
		<div
			ref={containerRef}
			// 自由配置のノードグラフのため左右キーの「同じ行」制約を適用しない（design §9.6.2 v1.18）。
			data-roving-free="true"
			className="relative h-[70vh] min-h-[420px] overflow-hidden border border-arch-border bg-arch-panel-dark"
			style={{ touchAction: "none", cursor: dragging ? "grabbing" : "grab" }}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerUp}
			onPointerCancel={handlePointerUp}
		>
			<svg width="100%" height="100%" style={{ userSelect: "none" }}>
				<title>調査マップ</title>
				<defs>
					<pattern
						id="map-grid"
						width={50}
						height={50}
						patternUnits="userSpaceOnUse"
					>
						<path
							d="M 50 0 L 0 0 0 50"
							fill="none"
							stroke="rgba(127,227,224,0.025)"
							strokeWidth={0.5}
						/>
					</pattern>
					<filter id="map-glow" x="-60%" y="-60%" width="220%" height="220%">
						<feGaussianBlur stdDeviation={4} result="b" />
						<feMerge>
							<feMergeNode in="b" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>

				<g
					transform={`translate(${CENTER.x + pan.x} ${CENTER.y + pan.y}) scale(${zoom})`}
				>
					<rect
						x={-600}
						y={-450}
						width={1200}
						height={900}
						fill="url(#map-grid)"
					/>

					{graph.topics.map((topic, i) => {
						const next = graph.topics[(i + 1) % graph.topics.length];
						if (!next || next.id === topic.id) return null;
						return (
							<line
								key={`ring-${topic.id}`}
								x1={topic.x - CENTER.x}
								y1={topic.y - CENTER.y}
								x2={next.x - CENTER.x}
								y2={next.y - CENTER.y}
								stroke="rgba(127,227,224,0.05)"
								strokeWidth={0.7}
								strokeDasharray="6,14"
							/>
						);
					})}

					{graph.topics.map((topic) => (
						<line
							key={`radial-${topic.id}`}
							x1={0}
							y1={0}
							x2={topic.x - CENTER.x}
							y2={topic.y - CENTER.y}
							stroke="rgba(127,227,224,0.04)"
							strokeWidth={0.5}
						/>
					))}

					{topicEdges.map((edge) => {
						const node = nodesById.get(edge.source);
						const topic = topicsById.get(edge.target);
						if (!node || !topic) return null;
						const dimmed = !nodeVisibility.get(node.id);
						return (
							<line
								key={`nt-${edge.source}-${edge.target}`}
								x1={node.x - CENTER.x}
								y1={node.y - CENTER.y}
								x2={topic.x - CENTER.x}
								y2={topic.y - CENTER.y}
								stroke="rgba(127,227,224,0.16)"
								strokeWidth={0.8}
								opacity={
									dimmed
										? 0.15
										: activeHoverId === node.id || activeHoverId === topic.id
											? 1
											: 0.7
								}
							/>
						);
					})}

					{noteEdges.map((edge) => {
						const a = nodesById.get(edge.source);
						const b = nodesById.get(edge.target);
						if (!a || !b) return null;
						const dimmed =
							!nodeVisibility.get(a.id) || !nodeVisibility.get(b.id);
						return (
							<line
								key={`ll-${edge.source}-${edge.target}`}
								x1={a.x - CENTER.x}
								y1={a.y - CENTER.y}
								x2={b.x - CENTER.x}
								y2={b.y - CENTER.y}
								stroke="rgba(127,227,224,0.28)"
								strokeWidth={1}
								strokeDasharray="2,6"
								opacity={dimmed ? 0.15 : 1}
							/>
						);
					})}

					<circle cx={0} cy={0} r={2.5} fill="rgba(127,227,224,0.12)" />

					{graph.topics.map((topic) => {
						const x = topic.x - CENTER.x;
						const y = topic.y - CENTER.y;
						const isHover = activeHoverId === topic.id;
						const dimmed =
							filters.topics.length > 0 && !filters.topics.includes(topic.id);
						// 菱形（45°回転した正方形）で描画（丸い形より荒削りな印象、§10.2 v1.8）。
						const r = isHover ? 19 : 16;
						return (
							// biome-ignore lint/a11y/noStaticElementInteractions: トピックはリンク先を持たずクリック不可（hover ツールチップのみ）。マウス専用の補助表示のため、キーボード等価は設けない
							<g
								key={topic.id}
								onMouseEnter={(e) => {
									setHoverId(topic.id);
									setTooltipPos({ x: e.clientX, y: e.clientY });
								}}
								onMouseLeave={() => setHoverId(null)}
							>
								<rect
									x={x - r}
									y={y - r}
									width={r * 2}
									height={r * 2}
									fill="rgba(7,22,34,0.75)"
									stroke={dimmed ? C.borderFaint : isHover ? C.cyan : C.border}
									strokeWidth={isHover ? 1.5 : 1}
									opacity={dimmed ? 0.3 : 1}
									filter={isHover ? "url(#map-glow)" : undefined}
									transform={`rotate(45 ${x} ${y})`}
								/>
								<circle
									cx={x}
									cy={y}
									r={5}
									fill={dimmed ? C.cyanFaint : isHover ? C.cyan : C.cyanDim}
									opacity={dimmed ? 0.3 : 1}
								/>
								<text
									x={x}
									y={y + 38}
									textAnchor="middle"
									fill={dimmed ? C.borderFaint : isHover ? C.text : C.muted}
									style={{
										fontFamily: font.dot,
										fontSize: fs(11),
										pointerEvents: "none",
									}}
								>
									{topic.id}
								</text>
								{topic.count > 0 && !dimmed ? (
									<text
										x={x + 15}
										y={y - 18}
										fill={C.cyan}
										opacity={0.6}
										style={{
											fontFamily: font.mon,
											fontSize: fs(9),
											pointerEvents: "none",
										}}
									>
										×{topic.count}
									</text>
								) : null}
							</g>
						);
					})}

					{graph.nodes.map((node) => {
						const x = node.x - CENTER.x;
						const y = node.y - CENTER.y;
						const visible = nodeVisibility.get(node.id) ?? true;
						const isHover = activeHoverId === node.id;
						const color = node.status ? statusColor(node.status) : C.muted;
						const href = `/garden/${node.id}`;
						// 小さな四角ドットで描画（丸い形より荒削りな印象、§10.2 v1.8）。
						const s = isHover ? 6 : 4;
						return (
							<Link
								key={node.id}
								href={href}
								aria-label={node.title}
								// 十字キー選択時にツールチップを出すための目印（MutationObserver から参照）。
								data-node-id={node.id}
								onPointerDown={(e) => e.stopPropagation()}
								onMouseEnter={(e) => {
									setHoverId(node.id);
									setTooltipPos({ x: e.clientX, y: e.clientY });
								}}
								onMouseLeave={() => setHoverId(null)}
								onClick={(e) => {
									// 直接遷移せず確認モーダルを挟む（spec SC-003 §3.2/§3.3、F-MAP-003）。
									e.preventDefault();
									setPendingNav({ href, title: node.title });
								}}
								style={{ cursor: "pointer", opacity: visible ? 1 : 0.15 }}
							>
								{/* あたり判定用の透明な広めの円。可視の点(r=6〜9)だけだとクリック/タップ判定が小さすぎるため（design §10.6 モバイル操作性）。 */}
								<circle cx={x} cy={y} r={16} fill="transparent" />
								<rect
									x={x - s}
									y={y - s}
									width={s * 2}
									height={s * 2}
									fill="rgba(7,22,34,0.8)"
									stroke={color}
									strokeWidth={isHover ? 1.5 : 1}
									filter={isHover ? "url(#map-glow)" : undefined}
								/>
								<rect
									x={x - 2}
									y={y - 2}
									width={4}
									height={4}
									fill={color}
									opacity={0.9}
								/>
								<text
									x={x}
									y={y - 13}
									textAnchor="middle"
									fill={isHover ? C.text : C.muted}
									opacity={isHover ? 0.9 : 0.45}
									style={{
										fontFamily: font.mon,
										fontSize: fs(8),
										pointerEvents: "none",
									}}
								>
									{node.file}
								</text>
							</Link>
						);
					})}
				</g>
			</svg>

			{hoverNode ? (
				<div
					className="pointer-events-none fixed z-[100] max-w-[220px] border-2 border-arch-border bg-arch-panel p-3"
					style={{ left: activeTooltipPos.x + 14, top: activeTooltipPos.y - 8 }}
				>
					<div className="mb-1 font-mon text-[calc(9px*var(--font-scale))] text-arch-cyan">
						{hoverNode.file}
					</div>
					<div className="mb-1.5 font-dot text-arch-xs text-arch-text">
						{hoverNode.title}
					</div>
					{hoverNode.status ? (
						<div className="mb-1.5">
							<Badge status={hoverNode.status} />
						</div>
					) : null}
					<div className="font-min text-[calc(11px*var(--font-scale))] text-arch-muted leading-relaxed">
						{summaryBySlug.get(hoverNode.id) ?? ""}
					</div>
					<div className="mt-1.5 font-mon text-[calc(8px*var(--font-scale))] text-arch-cyan-dim tracking-wide">
						クリックで詳細を開く →
					</div>
				</div>
			) : hoverTopic ? (
				<div
					className="pointer-events-none fixed z-[100] max-w-[220px] border-2 border-arch-border bg-arch-panel p-3"
					style={{ left: activeTooltipPos.x + 14, top: activeTooltipPos.y - 8 }}
				>
					<div className="mb-1 font-dot text-arch-sm text-arch-cyan">
						{hoverTopic.id}
					</div>
					<div className="font-mon text-[calc(9px*var(--font-scale))] text-arch-muted">
						{hoverTopic.count} notes
					</div>
				</div>
			) : null}

			{/* コンテナの onPointerDown/Move/Up（地図のパン操作）へイベントが伝播すると、
			 * ボタンクリックがドラッグ開始と競合して効かなくなるため止める（NavigateConfirmDialog と同様）。 */}
			<div
				className="absolute right-4 bottom-4 z-10 flex flex-col gap-1"
				onPointerDown={(e) => e.stopPropagation()}
				onPointerMove={(e) => e.stopPropagation()}
				onPointerUp={(e) => e.stopPropagation()}
			>
				<button
					type="button"
					onClick={() => setZoom((z) => clampZoom(z + ZOOM_STEP))}
					className={zoomButtonClass}
					aria-label="ズームイン"
				>
					+
				</button>
				<button
					type="button"
					onClick={() => setZoom((z) => clampZoom(z - ZOOM_STEP))}
					className={zoomButtonClass}
					aria-label="ズームアウト"
				>
					−
				</button>
				<button
					type="button"
					onClick={() => {
						setZoom(1);
						setPan(computeCenteredPan(containerRef.current));
					}}
					className={zoomButtonClass}
					aria-label="表示をリセット"
				>
					⌂
				</button>
			</div>

			<div className="absolute bottom-4 left-4 font-mon text-[calc(9px*var(--font-scale))] text-arch-muted tracking-wide opacity-35">
				ドラッグ: パン　スクロール: ズーム
			</div>

			{pendingNav ? (
				<NavigateConfirmDialog
					pending={pendingNav}
					onCancel={() => setPendingNav(null)}
					onConfirm={() => navigateWithFlash(pendingNav.href, pendingNav.href)}
					confirmFlashing={navFlashingKey === pendingNav.href}
				/>
			) : null}
		</div>
	);
}
