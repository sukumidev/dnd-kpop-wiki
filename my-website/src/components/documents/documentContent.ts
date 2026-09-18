import type {ReactNode} from "react";
import type {Document} from "../../data/documents";

export type SelectedDocumentContent =
  | {kind: "mdx"; content: ReactNode}
  | {kind: "legacy"; content: string}
  | {kind: "none"};

/** MDX has exclusive precedence; inline content is only a compatibility fallback. */
export function selectDocumentNarrativeContent(
  document: Document,
  mdxContent?: ReactNode,
): SelectedDocumentContent {
  if (document.contentFormat === "mdx") {
    return mdxContent === undefined || mdxContent === null
      ? {kind: "none"}
      : {kind: "mdx", content: mdxContent};
  }

  return typeof document.content === "string" && document.content.length > 0
    ? {kind: "legacy", content: document.content}
    : {kind: "none"};
}
