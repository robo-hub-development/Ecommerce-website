import Link from "next/link";
import Markdown, { type Components } from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { rehypeFlagPlaceholders } from "@/components/policy/placeholders";

const components: Components = {
  // The page title is the only h1, so "# Privacy Policy" style part headings render as h2 with a part style.
  h1: ({ id, children }) => (
    <h2 id={id} data-part="">
      {children}
    </h2>
  ),
  a: ({ href = "", children }) =>
    href.startsWith("/") ? (
      <Link href={href}>{children}</Link>
    ) : (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
};

export function PolicyArticle({ body }: { body: string }) {
  return (
    <div className="prose policy-prose max-w-none">
      <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug, rehypeFlagPlaceholders]} components={components}>
        {body}
      </Markdown>
    </div>
  );
}
