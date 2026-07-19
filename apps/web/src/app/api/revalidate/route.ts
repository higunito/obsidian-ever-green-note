import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

// Content CI（Obsidian 側）からの通知受け口。GitHub 認証は持たず共有 secret のみで認証する（design §6.2）。
export async function POST(request: NextRequest) {
	const secret = process.env.REVALIDATE_SECRET;
	if (!secret) {
		return NextResponse.json(
			{ error: "REVALIDATE_SECRET が未設定です" },
			{ status: 500 },
		);
	}

	const authHeader = request.headers.get("authorization");
	if (authHeader !== `Bearer ${secret}`) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// "content" タグの更新は push 起点の webhook でのみ起きる（時間経過での自動失効ではない）ため、
	// Next.js 16 の revalidateTag 第2引数には手動失効のみを行う "max" プロファイルを指定する。
	revalidateTag("content", "max");
	return NextResponse.json({ revalidated: true });
}
