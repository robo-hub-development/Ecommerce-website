import type { Element, ElementContent, Root } from "hast";

const PLACEHOLDER = /(\[(?:Date|X–Y business days|X business days|Name \/ Designation|Name and Contact Details)\])/;

function flag(node: Element | Root) {
  const next: ElementContent[] = [];
  for (const child of node.children as ElementContent[]) {
    if (child.type === "text" && PLACEHOLDER.test(child.value)) {
      for (const part of child.value.split(PLACEHOLDER)) {
        if (!part) continue;
        next.push(
          PLACEHOLDER.test(part)
            ? {
                type: "element",
                tagName: "mark",
                properties: { className: ["policy-todo"], title: "To be completed before launch" },
                children: [{ type: "text", value: part }],
              }
            : { type: "text", value: part },
        );
      }
    } else {
      if (child.type === "element") flag(child);
      next.push(child);
    }
  }
  node.children = next as typeof node.children;
}

/** Rehype plugin: wraps unfilled placeholders in <mark> without changing the text. */
export function rehypeFlagPlaceholders() {
  return (tree: Root) => flag(tree);
}
