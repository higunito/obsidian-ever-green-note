import { z } from "zod";

export const pathItemSchema = z.object({
	slug: z.string(),
	title: z.string(),
	summary: z.string(),
	topics: z.array(z.string()),
	steps: z.array(z.string()),
});
export type PathItem = z.infer<typeof pathItemSchema>;

export const pathsSchema = z.array(pathItemSchema);
export type Paths = z.infer<typeof pathsSchema>;
