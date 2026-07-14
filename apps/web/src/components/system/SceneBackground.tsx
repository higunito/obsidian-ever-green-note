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

// ディザリング（PC-98 期のドット装飾、§10.1）。URL エンコード内は var() を使えないため装飾用の固定色。
const dither: CSSProperties = {
	position: "absolute",
	inset: 0,
	backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect x='0' y='0' width='1' height='1' fill='%231a3a48' opacity='0.2'/%3E%3Crect x='2' y='2' width='1' height='1' fill='%231a3a48' opacity='0.2'/%3E%3C/svg%3E")`,
	backgroundSize: "4px 4px",
};

const scanlines: CSSProperties = {
	position: "absolute",
	inset: 0,
	backgroundImage:
		"repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 3px)",
};

const vignette: CSSProperties = {
	position: "absolute",
	inset: 0,
	background:
		"radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.62) 100%)",
};

/**
 * 夜景の背景レイヤー（§9.1）。グラデ＋ディザ＋雨パーティクル＋走査線＋ビネットを
 * 最背面（fixed, z-0）に敷く。差し替え可能なよう他の描画から独立させる。
 * 雨・点滅は globals.css の `.arch-rain` / `prefers-reduced-motion` で停止する（§10.6）。
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
		</div>
	);
}
