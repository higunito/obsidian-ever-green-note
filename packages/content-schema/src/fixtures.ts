import articlesJson from "../fixtures/articles.json" with { type: "json" };
import graphJson from "../fixtures/graph.json" with { type: "json" };
import pathsJson from "../fixtures/paths.json" with { type: "json" };
import searchIndexJson from "../fixtures/search-index.json" with {
	type: "json",
};
import type { Article } from "./article.ts";
import { articlesSchema } from "./article.ts";
import type { Graph } from "./graph.ts";
import { graphSchema } from "./graph.ts";
import type { PathItem } from "./path.ts";
import { pathsSchema } from "./path.ts";
import type { SearchIndex } from "./search.ts";
import { searchIndexSchema } from "./search.ts";

export const fixtureArticles: Article[] = articlesSchema.parse(articlesJson);
export const fixtureGraph: Graph = graphSchema.parse(graphJson);
export const fixtureSearchIndex: SearchIndex =
	searchIndexSchema.parse(searchIndexJson);
export const fixturePaths: PathItem[] = pathsSchema.parse(pathsJson);
