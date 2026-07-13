import { z } from "zod";

export const pageContentSchema = z.object({
	updated: z.string(),
	bodyHtml: z.string(),
	topics: z.array(z.string()),
});
export type PageContent = z.infer<typeof pageContentSchema>;

export const pagesSchema = z.object({
	now: pageContentSchema,
	about: pageContentSchema,
});
export type Pages = z.infer<typeof pagesSchema>;
