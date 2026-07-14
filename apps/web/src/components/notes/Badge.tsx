import { font, STATUS_LABEL, statusColor } from "@web/styles/tokens";
import type { NoteStatus } from "@web/types/content";

interface BadgeProps {
	status: NoteStatus;
}

/**
 * status バッジ（Fragment/Developing/Archived、design §9.2 / §10.5、figma `Badge` を正準）。
 */
export function Badge({ status }: BadgeProps) {
	const color = statusColor(status);
	return (
		<span
			style={{
				border: `1px solid ${color}`,
				color,
				padding: "1px 5px",
				fontFamily: font.mon,
				fontSize: "9px",
				letterSpacing: "0.1em",
			}}
		>
			{STATUS_LABEL[status].toUpperCase()}
		</span>
	);
}
