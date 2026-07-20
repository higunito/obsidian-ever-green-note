import { z } from "zod";

export const noteStatusSchema = z.enum(["seed", "growing", "evergreen"]);
export type NoteStatus = z.infer<typeof noteStatusSchema>;

export const articleLayerSchema = z.enum(["garden", "article"]);
export type ArticleLayer = z.infer<typeof articleLayerSchema>;

export const articleChannelSchema = z.enum(["native", "note"]);
export type ArticleChannel = z.infer<typeof articleChannelSchema>;

export const articleSchema = z.object({
	slug: z.string(),
	layer: articleLayerSchema,
	title: z.string(),
	date: z.string(),
	updated: z.string(),
	status: noteStatusSchema.optional(),
	topics: z.array(z.string()),
	tags: z.array(z.string()),
	summary: z.string(),
	channel: articleChannelSchema.optional(),
	outboundLinks: z.array(z.string()),
	backlinks: z.array(z.string()),
	publish: z.boolean(),
	bodyHtml: z.string(),
});
export type Article = z.infer<typeof articleSchema>;

export const articlesSchema = z.array(articleSchema);
export type Articles = z.infer<typeof articlesSchema>;
