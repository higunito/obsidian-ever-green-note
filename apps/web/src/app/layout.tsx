import { SceneBackground } from "@web/components/system";
import type { Metadata } from "next";
import { DotGothic16, Noto_Serif_JP, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

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
				{/* 最背面に固定する差し替え可能な夜景レイヤー（§9.1）。本文コンテンツは z-1 以上に載せる。 */}
				<SceneBackground />
				<div className="relative z-[1] flex min-h-full flex-col">
					{children}
				</div>
			</body>
		</html>
	);
}
