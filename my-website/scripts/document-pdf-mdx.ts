import fs from "node:fs";
import path from "node:path";
import {unified} from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import {isDocumentPdfDisplay, isDocumentPdfSrc} from "../src/components/documents/mdx/documentPdfContract";

const parser = unified().use(remarkParse).use(remarkMdx);
const ALLOWED_ATTRIBUTES = new Set(["src", "title", "caption", "display"]);

export function analyzeDocumentPdfMdx(source: string): {errors: string[]; sources: string[]} {
  const errors: string[] = [];
  const sources: string[] = [];
  let tree;
  try { tree = parser.parse(source); }
  catch (error) { return {errors: [`Invalid narrative MDX: ${error instanceof Error ? error.message : String(error)}`], sources}; }

  function visit(node: any, parent?: any) {
    if ((node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") && node.name === "DocumentPdf") {
      const attributes = Array.isArray(node.attributes) ? node.attributes : [];
      const literal = new Map<string, string>();
      let valid = node.type === "mdxJsxFlowElement" && parent?.type === "root" && (node.children?.length ?? 0) === 0;
      for (const attribute of attributes) {
        if (attribute.type !== "mdxJsxAttribute" || !ALLOWED_ATTRIBUTES.has(attribute.name) ||
            typeof attribute.value !== "string" || literal.has(attribute.name)) {
          valid = false;
        } else literal.set(attribute.name, attribute.value);
      }
      const src = literal.get("src");
      if (!isDocumentPdfSrc(src) || !literal.get("title")?.trim() ||
          (literal.has("display") && !isDocumentPdfDisplay(literal.get("display")))) valid = false;
      if (!valid) errors.push("DocumentPdf requires a standalone block with a literal public /handouts/...pdf src, nonempty title, optional caption and embedded or card display; no other attributes or children are allowed.");
      else sources.push(src);
    }
    for (const child of node.children ?? []) visit(child, node);
  }
  visit(tree);
  return {errors: [...new Set(errors)], sources};
}

export function validatePublicDocumentPdfFiles(projectRoot: string, sources: string[]): string[] {
  const errors: string[] = [];
  for (const src of new Set(sources)) {
    if (!isDocumentPdfSrc(src)) { errors.push(`Unsafe DocumentPdf source: ${src}`); continue; }
    const relative = ["static", ...src.slice(1).split("/")];
    let current = projectRoot;
    try {
      for (const segment of relative) {
        current = path.join(current, segment);
        const stat = fs.lstatSync(current);
        if (stat.isSymbolicLink()) throw new Error("symlink");
      }
      const stat = fs.statSync(current);
      if (!stat.isFile()) throw new Error("not a regular file");
    } catch {
      errors.push(`Required public DocumentPdf asset is missing or unsafe: ${src}`);
    }
  }
  return errors;
}
