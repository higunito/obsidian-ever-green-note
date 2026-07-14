import { C, font } from "@web/styles/tokens";
import { Window } from "./Window";

interface StatusPanelProps {
	/** 表示する日時（例 `2026.07.12 / 09:42`）。ライブ時計はクライアント側で更新する画面が渡す。 */
	datetime: string;
	/** 現在のトピック（無ければ非表示）。 */
	currentTopic?: string;
}

/**
 * 日時 / CURRENT TOPIC を出す小窓（§9.1、figma Home 内 `StatusWin`）。
 * 値は props で受け取る純表示コンポーネント（データ取得・時計更新は利用側の責務）。
 */
export function StatusPanel({ datetime, currentTopic }: StatusPanelProps) {
	return (
		<Window title="STATUS">
			<div
				style={{
					padding: "10px 12px",
					fontFamily: font.mon,
					fontSize: "11px",
					color: C.cyan,
					lineHeight: 1.85,
				}}
			>
				<div>{datetime}</div>
				{currentTopic ? (
					<>
						<div style={{ color: C.muted, fontSize: "10px", marginTop: "2px" }}>
							CURRENT TOPIC
						</div>
						<div
							style={{ color: C.text, fontFamily: font.dot, fontSize: "12px" }}
						>
							▶ {currentTopic}
						</div>
					</>
				) : null}
			</div>
		</Window>
	);
}
