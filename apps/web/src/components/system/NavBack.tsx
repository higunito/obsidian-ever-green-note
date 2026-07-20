import Link from "next/link";

interface NavBackProps {
	/** 表示ラベル（例 `◀ TITLE`）。ゲーム名＋通常名の併記は呼び出し側で行う。 */
	label: string;
	href: string;
}

/**
 * 戻り導線（§9.1、figma `NavBack`）。等幅・補助色で控えめに置き、hover でシアン。
 * hover は CSS（Tailwind）で表現し Server Component のまま保つ。
 */
export function NavBack({ label, href }: NavBackProps) {
	return (
		<Link
			href={href}
			className="font-mon text-[calc(10px*var(--font-scale))] tracking-[0.08em] text-arch-muted transition-colors hover:text-arch-cyan"
		>
			{label}
		</Link>
	);
}
