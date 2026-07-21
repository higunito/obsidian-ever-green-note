// 効果音（SE）システム（design §9.7、spec SC-011 §11.2）。
// 実音声ファイル（apps/web/public/sounds/*.mp3）を Web Audio API でデコード・再生する。
// 呼び出し側は種類ごとの play*Sound() だけを使い、内部実装（デコード・再生）を意識しない。

import { getSeMutedPreference } from "@web/lib/config";

let audioContext: AudioContext | null = null;
const bufferCache = new Map<string, Promise<AudioBuffer | null>>();

function getAudioContext(): AudioContext | null {
	if (typeof window === "undefined") return null;
	const Ctor = window.AudioContext;
	if (!Ctor) return null;
	if (!audioContext) audioContext = new Ctor();
	if (audioContext.state === "suspended") void audioContext.resume();
	return audioContext;
}

/** 音声ファイルの取得・デコードは初回のみ行い、以降は Promise ごとキャッシュして使い回す。 */
function loadBuffer(ctx: AudioContext, url: string): Promise<AudioBuffer | null> {
	let cached = bufferCache.get(url);
	if (!cached) {
		cached = fetch(url)
			.then((res) => res.arrayBuffer())
			.then((data) => ctx.decodeAudioData(data))
			.catch(() => null);
		bufferCache.set(url, cached);
	}
	return cached;
}

/**
 * 素材ファイルを鳴らす。`gain` は素材間の原音量差を吸収するための再生ゲイン（1 が基準）。
 * デコード待ちの間に設定が変わる場合があるため、ミュート判定は取得直後と再生直前の 2 回行う。
 */
function play(url: string, gain: number): void {
	if (getSeMutedPreference()) return;
	const ctx = getAudioContext();
	if (!ctx) return;
	void loadBuffer(ctx, url).then((buffer) => {
		if (!buffer || getSeMutedPreference()) return;
		const source = ctx.createBufferSource();
		const gainNode = ctx.createGain();
		source.buffer = buffer;
		gainNode.gain.value = gain;
		source.connect(gainNode);
		gainNode.connect(ctx.destination);
		source.start();
	});
}

/** カーソル移動音：十字キーでの仮想カーソル移動時（design §9.6.2）。 */
export function playCursorSound(): void {
	play("/sounds/cursor.mp3", 1);
}

/** 決定音：Enter/Z（A ボタン）による決定操作時。 */
export function playDecideSound(): void {
	play("/sounds/decide.mp3", 1);
}

/** キャンセル/戻る音：Escape/X（B ボタン）（design §9.6.3）。 */
export function playCancelSound(): void {
	play("/sounds/cancel.mp3", 1);
}

/**
 * 画面遷移確定音：`useFlashNavigate` の点滅→遷移演出に同期。
 * 素材の実測 RMS 音量が他 3 素材（cursor -46dBFS/decide -40dBFS/cancel -33dBFS）より
 * 約 12dB 大きい（-19dBFS）ため、gain 0.2 で cancel 相当まで下げて揃えている。
 */
export function playTransitionSound(): void {
	play("/sounds/transition.mp3", 0.2);
}
