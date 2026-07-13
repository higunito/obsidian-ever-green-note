import { z } from "zod";
import { articleLayerSchema, noteStatusSchema } from "./article.ts";

export const graphTopicSchema = z.object({
	id: z.string(),
	x: z.number(),
	y: z.number(),
	count: z.number(),
});
export type GraphTopic = z.infer<typeof graphTopicSchema>;

export const graphNodeSchema = z.object({
	id: z.string(),
	layer: articleLayerSchema,
	status: noteStatusSchema.optional(),
	topics: z.array(z.string()),
	title: z.string(),
	file: z.string(),
	x: z.number(),
	y: z.number(),
});
export type GraphNode = z.infer<typeof graphNodeSchema>;

export const graphEdgeKindSchema = z.enum(["note", "topic"]);
export type GraphEdgeKind = z.infer<typeof graphEdgeKindSchema>;

export const graphEdgeSchema = z.object({
	source: z.string(),
	target: z.string(),
	kind: graphEdgeKindSchema,
});
export type GraphEdge = z.infer<typeof graphEdgeSchema>;

export const graphSchema = z.object({
	topics: z.array(graphTopicSchema),
	nodes: z.array(graphNodeSchema),
	edges: z.array(graphEdgeSchema),
});
export type Graph = z.infer<typeof graphSchema>;
