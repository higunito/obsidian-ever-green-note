import articlesJson from "../fixtures/articles.json";
import collectionsJson from "../fixtures/collections.json";
import graphJson from "../fixtures/graph.json";
import pagesJson from "../fixtures/pages.json";
import pathsJson from "../fixtures/paths.json";
import searchIndexJson from "../fixtures/search-index.json";
import type { Article } from "./article";
import { articlesSchema } from "./article";
import type { Collections } from "./collection";
import { collectionsSchema } from "./collection";
import type { Graph } from "./graph";
import { graphSchema } from "./graph";
import type { Pages } from "./pages";
import { pagesSchema } from "./pages";
import type { PathItem } from "./path";
import { pathsSchema } from "./path";
import type { SearchIndex } from "./search";
import { searchIndexSchema } from "./search";

export const fixtureArticles: Article[] = articlesSchema.parse(articlesJson);
export const fixtureGraph: Graph = graphSchema.parse(graphJson);
export const fixtureSearchIndex: SearchIndex =
	searchIndexSchema.parse(searchIndexJson);
export const fixtureCollections: Collections =
	collectionsSchema.parse(collectionsJson);
export const fixturePaths: PathItem[] = pathsSchema.parse(pathsJson);
export const fixturePages: Pages = pagesSchema.parse(pagesJson);
