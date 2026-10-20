/**
 * Developer Resources & Technical Articles API Route Tests
 * Location: tests/backend/resources-articles.test.ts
 */

import { GET } from "../../app/api/resources/articles/route";
import { NextRequest } from "next/server";
import { TestSuite, SuiteResult } from "./test-utils";

export async function runResourcesArticlesTests(): Promise<SuiteResult> {
  const suite = new TestSuite(
    "Developer Resources & Technical Articles API"
  );
  suite.start();

  function makeReq(url: string): NextRequest {
    return new NextRequest(new URL(url, "http://localhost:3000"));
  }

  try {
    // 1. Basic collection retrieval
    const resAll = await GET(makeReq("/api/resources/articles"));
    suite.assertEqual(resAll.status, 200, "GET /api/resources/articles returns 200 OK");

    const dataAll = await resAll.json();
    suite.assertEqual(dataAll.success, true, "Response reports success: true");
    suite.assert(Array.isArray(dataAll.articles), "articles is an array");
    suite.assert(dataAll.articles.length >= 5, "Contains at least 5 curated technical articles");
    suite.assertEqual(dataAll.count, dataAll.articles.length, "count matches articles array length");
    suite.assert(Array.isArray(dataAll.categories), "categories is an array");
    suite.assertEqual(dataAll.categories.length, 5, "Contains exactly 5 topic categories");

    // 2. Schema integrity
    const firstArticle = dataAll.articles[0];
    suite.assert(typeof firstArticle.slug === "string", "Article has slug string");
    suite.assert(typeof firstArticle.title === "string", "Article has title string");
    suite.assert(typeof firstArticle.category === "string", "Article has category string");
    suite.assert(typeof firstArticle.categorySlug === "string", "Article has categorySlug");
    suite.assert(typeof firstArticle.author === "string", "Article has author string");
    suite.assert(typeof firstArticle.authorRole === "string", "Article has authorRole string");
    suite.assert(typeof firstArticle.readTime === "string", "Article has readTime string");
    suite.assert(firstArticle.readTimeMinutes > 0, "Article has positive readTimeMinutes");
    suite.assert(
      ["Beginner", "Intermediate", "Advanced"].includes(firstArticle.difficulty),
      "Article has valid difficulty enum"
    );
    suite.assert(Array.isArray(firstArticle.keyTakeaways), "Article keyTakeaways is an array");
    suite.assert(firstArticle.keyTakeaways.length >= 3, "Article has at least 3 key takeaways");
    suite.assert(
      typeof firstArticle.markdownContent === "string" &&
        firstArticle.markdownContent.includes("#"),
      "Article has formatted markdown content with headings"
    );
    suite.assert(Array.isArray(firstArticle.tags), "Article tags is an array");
    suite.assert(firstArticle.tags.length > 0, "Article has non-empty tags");

    // 3. Category filtering
    const resCareer = await GET(makeReq("/api/resources/articles?category=career"));
    suite.assertEqual(resCareer.status, 200, "GET ?category=career returns 200 OK");
    const dataCareer = await resCareer.json();
    suite.assert(dataCareer.count > 0, "Career category returns articles");
    suite.assert(
      dataCareer.articles.every((a: any) => a.categorySlug === "career"),
      "All filtered articles have categorySlug: 'career'"
    );

    const resGit = await GET(makeReq("/api/resources/articles?category=git"));
    suite.assertEqual(resGit.status, 200, "GET ?category=git returns 200 OK");
    const dataGit = await resGit.json();
    suite.assert(
      dataGit.articles.length >= 2,
      "Git category contains multiple Git deep dives"
    );
    suite.assert(
      dataGit.articles.every((a: any) => a.categorySlug === "git"),
      "All filtered articles have categorySlug: 'git'"
    );

    const resArch = await GET(makeReq("/api/resources/articles?category=architecture"));
    suite.assertEqual(resArch.status, 200, "GET ?category=architecture returns 200 OK");
    const dataArch = await resArch.json();
    suite.assert(
      dataArch.articles.some((a: any) => a.slug === "realtime-multitheme-css-engine"),
      "Architecture category contains the theme engine article"
    );

    // 4. Search filtering
    const resSearchGsoc = await GET(makeReq("/api/resources/articles?search=gsoc"));
    suite.assertEqual(resSearchGsoc.status, 200, "GET ?search=gsoc returns 200 OK");
    const dataSearchGsoc = await resSearchGsoc.json();
    suite.assert(dataSearchGsoc.count > 0, "Search for 'gsoc' finds matching articles");
    suite.assert(
      dataSearchGsoc.articles.some((a: any) => a.slug === "cracking-gsoc-sophomore"),
      "Search finds the GSoC sophomore guide"
    );

    const resSearchEmpty = await GET(
      makeReq("/api/resources/articles?search=nonexistentxyz123456")
    );
    suite.assertEqual(resSearchEmpty.status, 200, "Unmatched search returns 200 OK");
    const dataSearchEmpty = await resSearchEmpty.json();
    suite.assertEqual(dataSearchEmpty.count, 0, "Unmatched search returns count 0");
    suite.assertEqual(dataSearchEmpty.articles.length, 0, "Unmatched search returns empty array");

    // 5. Difficulty filtering
    const resBeginner = await GET(makeReq("/api/resources/articles?difficulty=beginner"));
    suite.assertEqual(resBeginner.status, 200, "GET ?difficulty=beginner returns 200 OK");
    const dataBeginner = await resBeginner.json();
    suite.assert(
      dataBeginner.articles.every((a: any) => a.difficulty.toLowerCase() === "beginner"),
      "All returned items have beginner difficulty"
    );

    // 6. Featured filter
    const resFeatured = await GET(makeReq("/api/resources/articles?featured=true"));
    suite.assertEqual(resFeatured.status, 200, "GET ?featured=true returns 200 OK");
    const dataFeatured = await resFeatured.json();
    suite.assert(
      dataFeatured.articles.every((a: any) => a.featured === true),
      "All returned items are marked featured: true"
    );

    // 7. Single article lookup by slug
    const resSlug = await GET(
      makeReq("/api/resources/articles?slug=git-internals-dag-blobs")
    );
    suite.assertEqual(resSlug.status, 200, "GET ?slug=git-internals-dag-blobs returns 200 OK");
    const dataSlug = await resSlug.json();
    suite.assertEqual(dataSlug.success, true, "Slug lookup reports success: true");
    suite.assert(dataSlug.article !== undefined, "Response includes single article object");
    suite.assertEqual(
      dataSlug.article.slug,
      "git-internals-dag-blobs",
      "Resolved article slug matches requested slug"
    );
    suite.assert(
      dataSlug.article.title.includes("Git Under the Hood"),
      "Article title verified accurately"
    );

    // 8. Single article 404 handling
    const resNotFound = await GET(
      makeReq("/api/resources/articles?slug=non-existent-article-xyz")
    );
    suite.assertEqual(resNotFound.status, 404, "Invalid slug returns 404 Not Found");
    const dataNotFound = await resNotFound.json();
    suite.assertEqual(dataNotFound.success, false, "404 response reports success: false");
    suite.assert(
      dataNotFound.error.includes("not found"),
      "404 error message indicates article was not found"
    );
  } catch (error) {
    suite.assert(false, "Exception during Developer Resources articles tests: " + error);
  }

  return suite.summary();
}
