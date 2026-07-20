interface TagProps {
	label: string;
}

/**
 * トピック/技術タグ（design §9.2、figma `Tag` を正準）。NoteCard 等の topics 表示で使う。
 */
export function Tag({ label }: TagProps) {
	return (
		<span className="border border-arch-border-faint bg-arch-cyan-faint px-[5px] py-px font-dot text-[calc(10px*var(--font-scale))] text-arch-muted">
			{label}
		</span>
	);
}
