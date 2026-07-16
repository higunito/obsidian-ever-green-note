import { C, font } from "@web/styles/tokens";
import type { CSSProperties, ReactNode } from "react";

interface WindowProps {
	title: string;
	children: ReactNode;
	/** アクティブ時はシアン発光（Stack のアクティブカラム等で使用）。 */
	active?: boolean;
	style?: CSSProperties;
	className?: string;
}

/**
 * 二重枠＋タイトルバー付きウィンドウ（§9.1、figma `Win` を正準）。
 * べベルボーダー（Win95 的な inset ハイライト/シャドウ）＋太い 2px 外枠のソリッドパネル（`backdrop-filter` は使わない、§10.2 v1.8）。
 * タイトルバーはドット書体・システム表示色＋90年代ウィンドウクローム風のグラデ。本文領域には装飾をかけない（§10.4）。
 */
export function Window({
	title,
	children,
	active,
	style,
	className,
}: WindowProps) {
	return (
		<div
			className={className}
			style={{
				position: "relative",
				border: `2px solid ${active ? C.cyan : C.border}`,
				background: C.panel,
				boxShadow: active
					? `inset 1px 1px 0 ${C.borderHi}, inset -1px -1px 0 ${C.borderSh}, 0 0 22px ${C.cyanDim}`
					: `inset 1px 1px 0 ${C.borderHi}, inset -1px -1px 0 ${C.borderSh}, 0 4px 24px rgba(0,0,0,0.5)`,
				transition: "box-shadow 0.2s, border-color 0.2s",
				...style,
			}}
		>
			<div
				aria-hidden
				style={{
					position: "absolute",
					inset: "3px",
					border: `1px solid ${C.borderFaint}`,
					pointerEvents: "none",
					zIndex: 0,
				}}
			/>
			<div
				style={{
					background:
						"linear-gradient(90deg, #1c3a56 0%, #112230 60%, #0c1a28 100%)",
					borderBottom: `2px solid ${C.border}`,
					padding: "4px 10px",
					display: "flex",
					alignItems: "center",
					gap: "6px",
					fontFamily: font.dot,
					fontSize: "11px",
					color: C.cyan,
					letterSpacing: "0.08em",
					boxShadow: `inset 0 -1px 0 ${C.borderSh}`,
				}}
			>
				<span style={{ opacity: 0.35 }}>▪</span>
				{title}
				<span style={{ opacity: 0.35 }}>▪</span>
			</div>
			<div style={{ position: "relative", zIndex: 1 }}>{children}</div>
		</div>
	);
}
