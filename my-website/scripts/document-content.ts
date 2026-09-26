import fs from "node:fs";
import path from "node:path";

export const DOCUMENT_CONTENT_DIRECTORY = path.join("src", "content", "documents");
export const ALLOWED_DOCUMENT_MDX_COMPONENTS = [
  "Quote",
  "Callout",
  "Spoiler",
  "DocumentImage",
  "Divider",
] as const;

const ALLOWED_COMPONENT_SET = new Set<string>(ALLOWED_DOCUMENT_MDX_COMPONENTS);

export type DocumentContentFormat = "markdown" | "mdx";

export type DocumentContentRecord = {
  id?: unknown;
  status?: unknown;
  documentKind?: unknown;
  content?: unknown;
  contentFormat?: unknown;
  contentPath?: unknown;
};

export type ResolvedDocumentMdxPath = {
  absolutePath: string;
  contentPath: string;
  importPath: string;
};

export function getDocumentContentFormat(document: DocumentContentRecord): DocumentContentFormat | undefined {
  if (document.contentFormat === undefined) return "markdown";
  if (document.contentFormat === "markdown" || document.contentFormat === "mdx") {
    return document.contentFormat;
  }
  return undefined;
}

export function validateDocumentContentPath(contentPath: unknown): string[] {
  if (typeof contentPath !== "string" || contentPath.trim() === "") {
    return ["contentPath is required and must be a non-empty string when contentFormat is \"mdx\"."];
  }

  if (path.isAbsolute(contentPath) || path.win32.isAbsolute(contentPath) || path.posix.isAbsolute(contentPath)) {
    return [`contentPath must be relative to ${DOCUMENT_CONTENT_DIRECTORY}; absolute paths are not allowed.`];
  }

  const segments = contentPath.split(/[\\/]+/);
  if (segments.includes("..")) {
    return ["contentPath must not contain \"..\" or traverse outside the document content directory."];
  }

  if (!contentPath.toLowerCase().endsWith(".mdx")) {
    return ["contentPath must end in .mdx."];
  }

  return [];
}

export function resolveDocumentMdxPath(
  projectRoot: string,
  contentPath: unknown,
): ResolvedDocumentMdxPath {
  const errors = validateDocumentContentPath(contentPath);
  if (errors.length > 0) throw new Error(errors.join(" "));

  const safeContentPath = contentPath as string;
  const segments = safeContentPath.split(/[\\/]+/);
  const contentRoot = path.resolve(projectRoot, DOCUMENT_CONTENT_DIRECTORY);
  const absolutePath = path.resolve(contentRoot, ...segments);
  const relativeToRoot = path.relative(contentRoot, absolutePath);

  if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
    throw new Error(`contentPath must stay inside ${DOCUMENT_CONTENT_DIRECTORY}.`);
  }

  const normalizedContentPath = segments.join("/");
  return {
    absolutePath,
    contentPath: normalizedContentPath,
    importPath: `@site/src/content/documents/${normalizedContentPath}`,
  };
}

function stripFencedCode(source: string): string {
  return source.replace(/^( {0,3})(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\2\s*$/gm, "");
}

export function validateControlledMdx(source: string): string[] {
  const errors: string[] = [];
  const content = stripFencedCode(source);

  if (/^\s*import(?:\s|\{)/m.test(content)) {
    errors.push("imports are not allowed in narrative MDX documents");
  }
  if (/^\s*export(?:\s|\{)/m.test(content)) {
    errors.push("exports are not allowed in narrative MDX documents");
  }
  if (/[{}]/.test(content)) {
    errors.push("JavaScript expressions in braces are not allowed in narrative MDX documents");
  }
  if (/<\s*(?:script|iframe|object|embed)\b/i.test(content)) {
    errors.push("executable or embedded HTML elements are not allowed in narrative MDX documents");
  }
  if (/\b(?:href|src)\s*=\s*["']\s*javascript:/i.test(content) || /\]\(\s*javascript:/i.test(content)) {
    errors.push("javascript: URLs are not allowed in narrative MDX documents");
  }

  const componentPattern = /<\/?([A-Z][A-Za-z0-9.]*)\b/g;
  for (const match of content.matchAll(componentPattern)) {
    const componentName = match[1];
    if (!ALLOWED_COMPONENT_SET.has(componentName)) {
      errors.push(
        `component <${componentName}> is not registered; allowed components: ${ALLOWED_DOCUMENT_MDX_COMPONENTS.join(", ")}`,
      );
    }
  }

  return [...new Set(errors)];
}

export function validateDocumentMdxFile(
  document: DocumentContentRecord,
  projectRoot = process.cwd(),
): string[] {
  const format = getDocumentContentFormat(document);
  if (format === undefined) {
    return [`contentFormat must be either \"markdown\" or \"mdx\", received ${JSON.stringify(document.contentFormat)}.`];
  }
  if (format !== "mdx") return [];

  let resolved: ResolvedDocumentMdxPath;
  try {
    resolved = resolveDocumentMdxPath(projectRoot, document.contentPath);
  } catch (error) {
    return [error instanceof Error ? error.message : String(error)];
  }

  if (!fs.existsSync(resolved.absolutePath) || !fs.statSync(resolved.absolutePath).isFile()) {
    return [`MDX file does not exist: ${resolved.contentPath} (expected under ${DOCUMENT_CONTENT_DIRECTORY}).`];
  }

  const realContentRoot = fs.realpathSync(path.resolve(projectRoot, DOCUMENT_CONTENT_DIRECTORY));
  const realFilePath = fs.realpathSync(resolved.absolutePath);
  const realRelativePath = path.relative(realContentRoot, realFilePath);
  if (realRelativePath.startsWith("..") || path.isAbsolute(realRelativePath)) {
    return [`MDX file resolves outside ${DOCUMENT_CONTENT_DIRECTORY}; symlink traversal is not allowed.`];
  }

  const source = fs.readFileSync(realFilePath, "utf8");
  return validateControlledMdx(source);
}
