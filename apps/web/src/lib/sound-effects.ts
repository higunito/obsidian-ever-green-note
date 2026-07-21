// 効果音（SE）システム（design §9.7、spec SC-011 §11.2）。
// 実音声素材が未用意のため、v1 では Web Audio API でその場生成する短いビープ音で代用する。
// 呼び出し側は種類ごとの play*Sound() だけを使い、内部実装（合成音か実音声ファイル再生か）を
// 意識しない。実音声素材を用意でき次第、この関数群の内部実装のみを差し替える想定。

import { getSeMutedPreference } from "@web/lib/config";

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
	if (typeof window === "undefined") return null;
	const Ctor = window.AudioContext;
	if (!Ctor) return null;
	if (!audioContext) audioContext = new Ctor();
	if (audioContext.state === "suspended") void audioContext.resume();
	return audioContext;
}

interface ToneStep {
	freq: number;
	durationMs: number;
	type?: OscillatorType;
	/** 直前の音からの遅延（同一 SE 内で複数音を鳴らす場合に使う）。 */
	delayMs?: number;
}

/** クリックノイズを避けるため、短いアタック/リリースの envelope をかけて 1 音鳴らす。 */
function playTone(
	ctx: AudioContext,
	{ freq, durationMs, type = "square", delayMs = 0 }: ToneStep,
): void {
	const startTime = ctx.currentTime + delayMs / 1000;
	const duration = durationMs / 1000;
	const oscillator = ctx.createOscillator();
	const gain = ctx.createGain();
	oscillator.type = type;
	oscillator.frequency.setValueAtTime(freq, startTime);
	gain.gain.setValueAtTime(0, startTime);
	gain.gain.linearRampToValueAtTime(0.15, startTime + 0.005);
	gain.gain.linearRampToValueAtTime(0, startTime + duration);
	oscillator.connect(gain);
	gain.connect(ctx.destination);
	oscillator.start(startTime);
	oscillator.stop(startTime + duration + 0.02);
}

function play(steps: readonly ToneStep[]): void {
	if (getSeMutedPreference()) return;
	const ctx = getAudioContext();
	if (!ctx) return;
	for (const step of steps) playTone(ctx, step);
}

/** カーソル移動音：十字キーでの仮想カーソル移動時（design §9.6.2）。 */
export function playCursorSound(): void {
	play([{ freq: 880, durationMs: 30, type: "square" }]);
}

/** 決定音：Enter/Z（A ボタン）による決定操作時。 */
export function playDecideSound(): void {
	play([
		{ freq: 660, durationMs: 40, type: "square" },
		{ freq: 990, durationMs: 60, type: "square", delayMs: 40 },
	]);
}

/** キャンセル/戻る音：Escape/X（B ボタン）（design §9.6.3）。 */
export function playCancelSound(): void {
	play([
		{ freq: 520, durationMs: 40, type: "square" },
		{ freq: 330, durationMs: 70, type: "square", delayMs: 40 },
	]);
}

/** 画面遷移確定音：`useFlashNavigate` の点滅→遷移演出に同期。 */
export function playTransitionSound(): void {
	play([
		{ freq: 440, durationMs: 60, type: "triangle" },
		{ freq: 660, durationMs: 60, type: "triangle", delayMs: 60 },
		{ freq: 880, durationMs: 100, type: "triangle", delayMs: 120 },
	]);
}
