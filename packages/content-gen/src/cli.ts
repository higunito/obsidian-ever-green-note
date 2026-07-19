import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
	articlesSchema,
	graphSchema,
	pathsSchema,
	searchIndexSchema,
} from "content-schema";
import type { ZodTypeAny } from "zod";
import { generateContent } from "./build.ts";

export interface CliArgs {
	vault: string;
	out: string;
	pretty: boolean;
}

export function parseArgs(argv: readonly string[]): CliArgs {
	let vault: string | undefined;
	let out: string | undefined;
	let pretty = false;

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === "--vault") {
			vault = argv[++i];
		} else if (arg.startsWith("--vault=")) {
			vault = arg.slice("--vault=".length);
		} else if (arg === "--out") {
			out = argv[++i];
		} else if (arg.startsWith("--out=")) {
			out = arg.slice("--out=".length);
		} else if (arg === "--pretty") {
			pretty = true;
		}
	}

	if (!vault) throw new Error("--vault <dir> is required");
	if (!out) throw new Error("--out <dir> is required");
	return { vault, out, pretty };
}

interface OutputSpec {
	file: string;
	schema: ZodTypeAny;
	data: unknown;
}

/**
 * CLI 本体。生成 → 出力直前に全 JSON を zod で検証 → 書き出し、の順で行う。
 * 検証に失敗した場合は何も書き出さず非 0 終了する（部分反映を避ける）。
 */
export function runCli(argv: readonly string[]): void {
	const args = parseArgs(argv);
	const vaultDir = resolve(process.cwd(), args.vault);
	const outDir = resolve(process.cwd(), args.out);

	const result = generateContent(vaultDir);

	const outputs: OutputSpec[] = [
		{ file: "articles.json", schema: articlesSchema, data: result.articles },
		{ file: "graph.json", schema: graphSchema, data: result.graph },
		{
			file: "search-index.json",
			schema: searchIndexSchema,
			data: result.searchIndex,
		},
		{ file: "paths.json", schema: pathsSchema, data: result.paths },
	];

	let hasError = false;
	for (const output of outputs) {
		const parsed = output.schema.safeParse(output.data);
		if (!parsed.success) {
			hasError = true;
			console.error(`✗ ${output.file} が zod 検証に失敗しました:`);
			console.error(parsed.error.format());
		}
	}
	if (hasError) {
		process.exit(1);
	}

	mkdirSync(outDir, { recursive: true });
	for (const output of outputs) {
		const json = JSON.stringify(output.data, null, args.pretty ? 2 : 0);
		writeFileSync(join(outDir, output.file), `${json}\n`, "utf8");
	}

	console.log(`✓ ${outputs.length} 件の JSON を ${outDir} に生成しました`);
}
