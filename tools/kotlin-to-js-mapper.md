This document explains a conservative mapping strategy to help convert CloudStream Kotlin plugins (which use coroutines and CloudStream SDK types) into JS plugins.

1. Kotlin suspending functions -> async functions in JS.
   - e.g. `suspend fun search(query: String): List<SearchResponse>` -> `async function search(query){ return [...] }`

2. CloudStream models (SearchResponse, LoadResponse, ExtractorLink) -> JavaScript objects with documented fields.

3. Network calls: convert `Jsoup`/`OkHttp` usage to `axios` + `cheerio`.

4. Extractor patterns: inspect Kotlin extractors and mimic logic using helper functions.

5. Coroutines with parallelism -> `Promise.all` or `for await` patterns.

6. Test each converted plugin in an isolated environment before enabling in the main registry.
