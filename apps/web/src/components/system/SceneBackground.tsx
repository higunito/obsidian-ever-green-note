import { C } from "@web/styles/tokens";
import type { CSSProperties } from "react";

// 雨粒はインデックスから決定論的に算出する（乱数・日時を使わないため SSR/CSR で揺れない）。
const DROPS = Array.from({ length: 72 }, (_, i) => ({
	id: i,
	left: ((i * 137 + 11) % 97).toFixed(1),
	delay: ((i * 0.23) % 4).toFixed(2),
	dur: (0.65 + ((i * 0.09) % 0.85)).toFixed(2),
	op: 0.05 + ((i * 0.004) % 0.18),
	h: Math.round(10 + ((i * 0.7) % 22)),
}));

const gradient: CSSProperties = {
	position: "absolute",
	inset: 0,
	background: `radial-gradient(ellipse at 28% 38%, ${C.bgTop} 0%, ${C.bgMid} 55%, ${C.bg} 100%)`,
};

// ディザリング（PC-98 期のドット装飾、§10.1）。粗め 6×6 の大きめドットパターン（§10.2 v1.8）。
// URL エンコード内は var() を使えないため装飾用の固定色。
const dither: CSSProperties = {
	position: "absolute",
	inset: 0,
	backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='6'%3E%3Crect x='0' y='0' width='2' height='2' fill='%231a3848' opacity='0.35'/%3E%3Crect x='3' y='3' width='2' height='2' fill='%231a3848' opacity='0.35'/%3E%3Crect x='0' y='3' width='1' height='1' fill='%23223040' opacity='0.2'/%3E%3Crect x='3' y='0' width='1' height='1' fill='%23223040' opacity='0.2'/%3E%3C/svg%3E")`,
	backgroundSize: "6px 6px",
};

// スキャンライン（§10.2 v1.8）。1px 線を 3px 間隔で。透明度を上げて存在感を出す。
const scanlines: CSSProperties = {
	position: "absolute",
	inset: 0,
	backgroundImage:
		"repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.22) 2px, rgba(0,0,0,0.22) 3px)",
};

const vignette: CSSProperties = {
	position: "absolute",
	inset: 0,
	background:
		"radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.62) 100%)",
};

/**
 * フィルムグレインオーバーレイ（§9.1 v1.8）。SVG feTurbulence（fractalNoise）を
 * 0.14 秒ステップでランダムにシフトさせ、粒感が動くノイズを全画面に重ねる。
 * 装飾アニメーションのため `arch-animated` を付け、reduced-motion で静止させる（§10.6）。
 */
function NoiseOverlay() {
	return (
		<div
			style={{
				position: "absolute",
				inset: 0,
				opacity: 0.045,
				mixBlendMode: "screen",
			}}
		>
			<svg width="100%" height="100%">
				<title>フィルムグレイン</title>
				<filter id="film-grain">
					<feTurbulence
						type="fractalNoise"
						baseFrequency={0.72}
						numOctaves={4}
						stitchTiles="stitch"
					/>
					<feColorMatrix type="saturate" values="0" />
				</filter>
				<rect
					className="arch-animated"
					width="120%"
					height="120%"
					x="-10%"
					y="-10%"
					filter="url(#film-grain)"
					style={{ animation: "filmGrainShift 0.14s steps(1) infinite" }}
				/>
			</svg>
		</div>
	);
}

/**
 * 夜景の背景レイヤー（§9.1）。グラデ＋ディザ＋雨パーティクル＋走査線＋フィルムグレイン＋ビネットを
 * 最背面（fixed, z-0）に敷く。差し替え可能なよう他の描画から独立させる。
 * 雨・点滅・グレインは globals.css の `.arch-rain` / `.arch-animated` / `prefers-reduced-motion` で停止する（§10.6）。
 */
export function SceneBackground() {
	return (
		<div
			aria-hidden
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 0,
				overflow: "hidden",
				pointerEvents: "none",
			}}
		>
			<div style={gradient} />
			<div style={dither} />
			<div className="arch-rain">
				{DROPS.map((d) => (
					<div
						key={d.id}
						style={{
							position: "absolute",
							left: `${d.left}%`,
							top: 0,
							width: "1px",
							height: `${d.h}px`,
							background: `linear-gradient(transparent, color-mix(in srgb, ${C.cyan} ${(d.op * 100).toFixed(0)}%, transparent), transparent)`,
							animation: `archRain ${d.dur}s linear ${d.delay}s infinite`,
						}}
					/>
				))}
			</div>
			<div style={scanlines} />
			<div style={vignette} />
			<NoiseOverlay />
		</div>
	);
}
