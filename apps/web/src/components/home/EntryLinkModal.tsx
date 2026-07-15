import { C } from "@web/styles/tokens";
import Link from "next/link";

interface EntryLinkModalProps {
	/** 表示ラベル（例 `思考マップへ`）。 */
	label: string;
	href: string;
}

/**
 * `SelectEntryPanel` の MAP/ARTICLE タブ選択時にボタン列の右側へ出す遷移確認パネル
 * （spec SC-001 §1.2、design §9.1 `EntryLinkModal`）。両タブで共通のコンポーネントを使う。
 * PC 幅（≥900px）ではボタン列の右側、モバイルでは下に積む。
 */
export function EntryLinkModal({ label, href }: EntryLinkModalProps) {
	return (
		<div className="mt-3 min-[900px]:absolute min-[900px]:top-0 min-[900px]:left-full min-[900px]:mt-0 min-[900px]:ml-3">
			<Link
				href={href}
				className="block px-4 py-3 font-dot text-xs whitespace-nowrap text-arch-cyan transition-colors hover:text-arch-text"
				style={{
					border: `1px solid ${C.cyan}`,
					background: C.panel,
					boxShadow: `0 0 16px ${C.cyanDim}`,
					backdropFilter: "blur(6px)",
				}}
			>
				▶ {label}
			</Link>
		</div>
	);
}
