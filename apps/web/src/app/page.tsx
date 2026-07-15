import { TitleMenu } from "@web/components/title";

// SC-000 タイトル（design §11.3、spec SC-000）。`/` は常設のタイトルページ（v1.5〜）。
// ホーム（SC-001）は独立ルート `/home` に分離済み。
export default function TitlePage() {
	return (
		<main className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
			<TitleMenu />
		</main>
	);
}
