import { z } from "zod";

export const collectionKindSchema = z.enum(["book", "album", "other"]);
export type CollectionKind = z.infer<typeof collectionKindSchema>;

// source_ref（元Literatureノートへの非公開参照）は意図的にフィールドを持たない。
// 生成時にサニタイズされ、出力に含まれない契約（design.md §4.5）。
export const collectionItemSchema = z.object({
	slug: z.string(),
	title: z.string(),
	creator: z.string(),
	year: z.number(),
	kind: collectionKindSchema,
	cover: z.string().optional(),
	external_url: z.string().optional(),
	topics: z.array(z.string()),
	summary: z.string(),
	publish: z.boolean(),
});
export type CollectionItem = z.infer<typeof collectionItemSchema>;

export const collectionsSchema = z.object({
	items: z.array(collectionItemSchema),
});
export type Collections = z.infer<typeof collectionsSchema>;
