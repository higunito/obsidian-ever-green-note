import { z } from "zod";
import { articleLayerSchema } from "./article.ts";

export const searchItemSchema = z.object({
	slug: z.string(),
	layer: articleLayerSchema,
	title: z.string(),
	summary: z.string(),
	topics: z.array(z.string()),
	text: z.string(),
});
export type SearchItem = z.infer<typeof searchItemSchema>;

export const searchIndexSchema = z.object({
	items: z.array(searchItemSchema),
});
export type SearchIndex = z.infer<typeof searchIndexSchema>;
