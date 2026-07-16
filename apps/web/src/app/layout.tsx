import { SceneBackground } from "@web/components/system";
import type { Metadata } from "next";
import { DotGothic16, Noto_Serif_JP, Share_Tech_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Config の「アニメーション低減」（lib/config.ts）を初回ペイント前に <html> へ反映する。
// クライアント側 Effect だけだと一瞬 OS 既定のまま演出が動いてしまうため（FOUC 対策）、
// hydration 前に実行される beforeInteractive スクリプトで先に属性を立てる。
// キー名 "ta_reduced_motion" は lib/config.ts の REDUCED_MOTION_KEY と一致させること。
const REDUCED_MOTION_INIT_SCRIPT = `
try {
	var v = localStorage.getItem("ta_reduced_motion");
	if (v === "true") document.documentElement.setAttribute("data-reduced-motion", "true");
} catch (e) {}
`;

// 用途別書体（§10.3）を CSS 変数として提供し、globals.css の @theme（--font-dot/min/mon）が参照する。
// DotGothic16 / Noto Serif JP は日本語グリフを含み重いため preload しない（初期ペイロード抑制、§12.1）。
const fontDot = DotGothic16({
	weight: "400",
	subsets: ["latin"],
	variable: "--font-dot-gothic",
	display: "swap",
	preload: false,
});

const fontMin = Noto_Serif_JP({
	weight: ["400", "600"],
	subsets: ["latin"],
	variable: "--font-noto-serif",
	display: "swap",
	preload: false,
});

const fontMon = Share_Tech_Mono({
	weight: "400",
	subsets: ["latin"],
	variable: "--font-share-tech",
	display: "swap",
});

export const metadata: Metadata = {
	title: {
		default: "思考アーカイブ — THOUGHT ARCHIVE",
		template: "%s — 思考アーカイブ",
	},
	description:
		"忘れられた個人用知識探索ソフトウェア。美学・文学・音楽・技術についてのノートと断片の記録。",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="ja"
			className={`${fontDot.variable} ${fontMin.variable} ${fontMon.variable} h-full antialiased`}
		>
			<body className="min-h-full">
				<Script id="reduced-motion-init" strategy="beforeInteractive">
					{REDUCED_MOTION_INIT_SCRIPT}
				</Script>
				{/* 最背面に固定する差し替え可能な夜景レイヤー（§9.1）。本文コンテンツは z-1 以上に載せる。 */}
				<SceneBackground />
				{/*
				 * min-h-dvh を使う（min-h-full ではない）：body は min-height のみで height を持たないため
				 * “height”が未定義な祖先を percentage で継承しようとすると auto 扱いになり、
				 * ここでの min-h-full が実効高さゼロになって Title 等の justify-center が効かなくなる。
				 * dvh はビューポート基準で解決されるためこの連鎖に依存しない。
				 */}
				<div className="relative z-[1] flex min-h-dvh flex-col">{children}</div>
			</body>
		</html>
	);
}
