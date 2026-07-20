export interface FooterLink {
	label: string;
	href: string;
}

interface FooterProps {
	/** 外部リンク（GitHub / note 等）。未確定のため既定は空。実 URL は利用側が渡す。 */
	links?: readonly FooterLink[];
}

/**
 * バージョン表記（`ver 1.99`）と外部リンクのフッタ（§9.1）。
 * 外部リンクは `rel="noreferrer"` を付け新規タブで開く。
 */
export function Footer({ links = [] }: FooterProps) {
	return (
		<footer className="mt-auto flex flex-wrap items-center justify-between gap-3 px-4 py-3 font-mon text-[calc(10px*var(--font-scale))] tracking-[0.08em] text-arch-muted">
			<span className="opacity-70">ver 1.99</span>
			{links.length > 0 ? (
				<ul className="flex flex-wrap gap-4">
					{links.map((link) => (
						<li key={link.href}>
							<a
								href={link.href}
								target="_blank"
								rel="noreferrer"
								className="transition-colors hover:text-arch-cyan"
							>
								{link.label}
							</a>
						</li>
					))}
				</ul>
			) : null}
		</footer>
	);
}
