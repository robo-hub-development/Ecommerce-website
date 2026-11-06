import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import GithubSlugger from "github-slugger";

export type PolicyKey = "privacy-terms" | "shipping-returns-refunds";

export interface PolicyHeading {
  id: string;
  text: string;
}

export interface Policy {
  title: string;
  lastUpdated: string;
  /** Markdown after the title and "Last Updated" lines, unchanged. */
  body: string;
  headings: PolicyHeading[];
}

const stripInline = (text: string) => text.replace(/[*_`]/g, "").trim();

/** Reads a policy file and extracts what the page chrome needs; the legal text itself is never modified. */
export async function getPolicy(key: PolicyKey): Promise<Policy> {
  const source = await readFile(path.join(process.cwd(), "src/content/policies", `${key}.md`), "utf8");
  const lines = source.split(/\r?\n/);

  const title = lines.find((line) => line.startsWith("# "))?.slice(2).trim() ?? "";
  const lastUpdatedIndex = lines.findIndex((line) => /^Last Updated:/i.test(line));
  const lastUpdated = lastUpdatedIndex >= 0 ? lines[lastUpdatedIndex].replace(/^Last Updated:\s*/i, "").trim() : "";
  const body = lines
    .slice(Math.max(lastUpdatedIndex + 1, 1))
    .join("\n")
    .trim();

  // Same algorithm and heading order as rehype-slug, so TOC anchors match the rendered ids.
  const slugger = new GithubSlugger();
  const headings: PolicyHeading[] = [];
  for (const line of body.split("\n")) {
    const match = /^(#{1,6})\s+(.+)$/.exec(line);
    if (!match) continue;
    const text = stripInline(match[2]);
    const id = slugger.slug(text);
    if (match[1].length === 2) headings.push({ id, text });
  }

  return { title, lastUpdated, body, headings };
}
