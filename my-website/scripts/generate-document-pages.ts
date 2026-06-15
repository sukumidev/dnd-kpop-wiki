import fs from "node:fs/promises";
import path from "node:path";

type DocumentStatus = "draft" | "published" | "archived";
type DocumentVisibility = "public" | "hidden" | "dm-only" | "secret";

type DocumentType =
  | "book"
  | "lore"
  | "rumor"
  | "guild-announcement"
  | "letter"
  | "note"
  | "newspaper"
  | "diary"
  | "report"
  | "decree"
  | "testimony"
  | "contract"
  | "prophecy"
  | "handout"
  | "other";

type DocumentSection = {
  id?: string;
  title?: string;
  content?: string;
};

type HallyuraDocument = {
  id: string;
  title: string;
  subtitle?: string;
  type: DocumentType;
  status?: DocumentStatus;
  visibility?: DocumentVisibility;
  summary?: string;
  content?: string;
  sections?: DocumentSection[];
  collectionId?: string;
  parentId?: string;
  order?: number;
  author?: string;
  source?: string;
  date?: string;
  locationIds?: string[];
  characterIds?: string[];
  factionIds?: string[];
  questIds?: string[];
  documentIds?: string[];
  relatedDocumentIds?: string[];
  tags?: string[];
  notes?: string;
};

type DocumentNavigation = {
  previous?: HallyuraDocument;
  next?: HallyuraDocument;
};

type RenderContext = {
  documentsById: Map<string, HallyuraDocument>;
  slugById: Map<string, string>;
  navigationById: Map<string, DocumentNavigation>;
};

type CliOptions = {
  inputPath: string;
  outputDir: string;
  clean: boolean;
  includePrivate: boolean;
  dryRun: boolean;
};

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  book: "Libro",
  lore: "Lore",
  rumor: "Rumor",
  "guild-announcement": "Anuncio del gremio",
  letter: "Carta",
  note: "Nota",
  newspaper: "Periódico",
  diary: "Diario",
  report: "Reporte",
  decree: "Decreto",
  testimony: "Testimonio",
  contract: "Contrato",
  prophecy: "Profecía",
  handout: "Handout",
  other: "Otro",
};

const DEFAULT_OPTIONS: CliOptions = {
  inputPath: "src/data/documents.json",
  outputDir: "docs/documents",
  clean: false,
  includePrivate: false,
  dryRun: false,
};

const DOCUMENT_TYPES = new Set(Object.keys(DOCUMENT_TYPE_LABELS));

function parseArgs(argv: string[]): CliOptions {
  const options = { ...DEFAULT_OPTIONS };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--input" && next) {
      options.inputPath = next;
      index += 1;
      continue;
    }

    if (arg === "--out" && next) {
      options.outputDir = next;
      index += 1;
      continue;
    }

    if (arg === "--clean") {
      options.clean = true;
      continue;
    }

    if (arg === "--include-private") {
      options.includePrivate = true;
      continue;
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    throw new Error(`Unknown or incomplete argument: ${arg}`);
  }

  return options;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeDocuments(raw: unknown): HallyuraDocument[] {
  if (Array.isArray(raw)) {
    return raw as HallyuraDocument[];
  }

  if (isRecord(raw)) {
    return Object.values(raw) as HallyuraDocument[];
  }

  throw new Error("documents.json must be either an array or an object record.");
}

function validateDocument(document: HallyuraDocument) {
  if (!document.id) {
    throw new Error("Every document must have an id.");
  }

  if (!document.title) {
    throw new Error(`Document "${document.id}" must have a title.`);
  }

  if (!DOCUMENT_TYPES.has(document.type)) {
    throw new Error(
      `Document "${document.id}" has invalid type "${document.type}".`,
    );
  }
}

function shouldGenerateDocument(
  document: HallyuraDocument,
  includePrivate: boolean,
) {
  if (includePrivate) {
    return document.status !== "archived";
  }

  return document.status === "published" && document.visibility === "public";
}

function getSidebarPosition(document: HallyuraDocument, index: number) {
  return typeof document.order === "number" ? document.order : index + 1;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getDocumentSlug(document: HallyuraDocument) {
  return slugify(document.id || document.title);
}

function escapeMdxText(value: string) {
  return value.replaceAll("{", "\\{").replaceAll("}", "\\}");
}

function escapeYamlString(value: string) {
  return JSON.stringify(value);
}

function renderYamlList(key: string, values?: string[]) {
  if (!values?.length) {
    return "";
  }

  const list = values.map((value) => `  - ${escapeYamlString(value)}`).join("\n");
  return `${key}:\n${list}`;
}

function renderFrontMatter(document: HallyuraDocument, sidebarPosition: number) {
  const description = document.summary || document.subtitle || document.title;

  return [
    "---",
    `id: ${escapeYamlString(document.id)}`,
    `title: ${escapeYamlString(document.title)}`,
    `sidebar_label: ${escapeYamlString(document.title)}`,
    `sidebar_position: ${sidebarPosition}`,
    `description: ${escapeYamlString(description)}`,
    `document_type: ${escapeYamlString(document.type)}`,
    `document_type_label: ${escapeYamlString(DOCUMENT_TYPE_LABELS[document.type])}`,
    document.collectionId
      ? `collection_id: ${escapeYamlString(document.collectionId)}`
      : "",
    document.parentId ? `parent_id: ${escapeYamlString(document.parentId)}` : "",
    document.date ? `date: ${escapeYamlString(document.date)}` : "",
    renderYamlList("tags", document.tags),
    "---",
  ]
    .filter(Boolean)
    .join("\n");
}

function renderInfoLine(label: string, value?: string) {
  if (!value) {
    return "";
  }

  return `**${label}:** ${escapeMdxText(value)}\n`;
}

function renderInfoList(label: string, values?: string[]) {
  if (!values?.length) {
    return "";
  }

  return `**${label}:** ${values.map(escapeMdxText).join(", ")}\n`;
}

function renderDocumentLink(
  documentId: string,
  context: RenderContext,
  fallbackLabel?: string,
) {
  const slug = context.slugById.get(documentId);
  const document = context.documentsById.get(documentId);
  const label = document?.title || fallbackLabel || documentId;

  if (!slug) {
    return escapeMdxText(label);
  }

  return `[${escapeMdxText(label)}](./${slug})`;
}

function renderInfoLinkList(
  label: string,
  values: string[] | undefined,
  context: RenderContext,
) {
  if (!values?.length) {
    return "";
  }

  return `**${label}:** ${values
    .map((value) => renderDocumentLink(value, context))
    .join(", ")}\n`;
}

function renderSections(document: HallyuraDocument) {
  if (document.content?.trim()) {
    return escapeMdxText(document.content.trim());
  }

  if (!document.sections?.length) {
    return "";
  }

  return document.sections
    .map((section) => {
      const title = section.title ? `## ${escapeMdxText(section.title)}\n\n` : "";
      const content = section.content ? escapeMdxText(section.content.trim()) : "";
      return `${title}${content}`.trim();
    })
    .filter(Boolean)
    .join("\n\n");
}

function renderRelations(document: HallyuraDocument, context: RenderContext) {
  const blocks = [
    renderInfoList("Personajes relacionados", document.characterIds),
    renderInfoList("Facciones relacionadas", document.factionIds),
    renderInfoList("Lugares relacionados", document.locationIds),
    renderInfoList("Quests relacionadas", document.questIds),
    renderInfoLinkList("Documentos relacionados", document.documentIds, context),
    renderInfoLinkList(
      "Documentos relacionados",
      document.relatedDocumentIds,
      context,
    ),
  ].filter(Boolean);

  if (!blocks.length) {
    return "";
  }

  return ["## Relaciones", ...blocks].join("\n");
}

function renderCollectionBlock(
  document: HallyuraDocument,
  context: RenderContext,
) {
  const collectionId = document.collectionId || document.parentId;

  if (!collectionId) {
    return "";
  }

  return `**Colección:** ${renderDocumentLink(collectionId, context)}\n`;
}

function renderNavigation(document: HallyuraDocument, context: RenderContext) {
  const navigation = context.navigationById.get(document.id);

  if (!navigation?.previous && !navigation?.next) {
    return "";
  }

  const previous = navigation.previous
    ? `Anterior: ${renderDocumentLink(navigation.previous.id, context)}`
    : "";
  const next = navigation.next
    ? `Siguiente: ${renderDocumentLink(navigation.next.id, context)}`
    : "";

  return ["## Navegación", previous, next].filter(Boolean).join("\n");
}

function renderDocumentMdx(
  document: HallyuraDocument,
  sidebarPosition: number,
  context: RenderContext,
) {
  const frontMatter = renderFrontMatter(document, sidebarPosition);
  const meta = [
    renderInfoLine("Tipo", DOCUMENT_TYPE_LABELS[document.type]),
    renderInfoLine("Subtítulo", document.subtitle),
    renderInfoLine("Autor", document.author),
    renderInfoLine("Fuente", document.source),
    renderInfoLine("Fecha", document.date),
    renderCollectionBlock(document, context),
  ]
    .filter(Boolean)
    .join("");

  const summary = document.summary
    ? `> ${escapeMdxText(document.summary.trim())}\n`
    : "";

  const body = renderSections(document);
  const relations = renderRelations(document, context);
  const navigation = renderNavigation(document, context);

  return [
    frontMatter,
    "",
    `# ${escapeMdxText(document.title)}`,
    "",
    meta,
    summary,
    body,
    relations,
    navigation,
  ]
    .filter((section) => section.trim().length > 0)
    .join("\n\n")
    .concat("\n");
}

function compareDocuments(a: HallyuraDocument, b: HallyuraDocument) {
  const orderA = typeof a.order === "number" ? a.order : Number.MAX_SAFE_INTEGER;
  const orderB = typeof b.order === "number" ? b.order : Number.MAX_SAFE_INTEGER;
  return orderA - orderB || a.title.localeCompare(b.title, "es");
}

function createRenderContext(documents: HallyuraDocument[]): RenderContext {
  const documentsById = new Map(
    documents.map((document) => [document.id, document] as const),
  );
  const slugById = new Map(
    documents.map((document) => [document.id, getDocumentSlug(document)] as const),
  );
  const navigationById = new Map<string, DocumentNavigation>();
  const collections = new Map<string, HallyuraDocument[]>();

  for (const document of documents) {
    if (!document.collectionId) {
      continue;
    }

    const collection = collections.get(document.collectionId) || [];
    collection.push(document);
    collections.set(document.collectionId, collection);
  }

  for (const collectionDocuments of collections.values()) {
    const sortedDocuments = [...collectionDocuments].sort(compareDocuments);

    for (const [index, document] of sortedDocuments.entries()) {
      navigationById.set(document.id, {
        previous: sortedDocuments[index - 1],
        next: sortedDocuments[index + 1],
      });
    }
  }

  return { documentsById, slugById, navigationById };
}

async function pathExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function cleanGeneratedFiles(outputDir: string) {
  if (!(await pathExists(outputDir))) {
    return;
  }

  const entries = await fs.readdir(outputDir, { withFileTypes: true });

  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
      .map((entry) => fs.rm(path.join(outputDir, entry.name))),
  );
}

async function writeCategoryFile(outputDir: string, dryRun: boolean) {
  const categoryPath = path.join(outputDir, "_category_.json");
  const category = {
    label: "Documentos",
    position: 50,
    link: {
      type: "generated-index",
      title: "Documentos",
      description:
        "Cartas, rumores, anuncios, reportes y otros textos de Hallyura.",
    },
  };

  if (dryRun) {
    console.log(`[dry-run] Would write ${categoryPath}`);
    return;
  }

  await fs.writeFile(categoryPath, `${JSON.stringify(category, null, 2)}\n`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const rawJson = await fs.readFile(options.inputPath, "utf8");
  const documents = normalizeDocuments(JSON.parse(rawJson));
  documents.forEach(validateDocument);

  const generatedDocuments = documents
    .filter((document) => shouldGenerateDocument(document, options.includePrivate))
    .sort(compareDocuments);
  const context = createRenderContext(generatedDocuments);

  if (!options.dryRun) {
    await fs.mkdir(options.outputDir, { recursive: true });
  }

  if (options.clean && !options.dryRun) {
    await cleanGeneratedFiles(options.outputDir);
  }

  await writeCategoryFile(options.outputDir, options.dryRun);

  for (const [index, document] of generatedDocuments.entries()) {
    const slug = getDocumentSlug(document);
    const outputPath = path.join(options.outputDir, `${slug}.mdx`);
    const sidebarPosition = getSidebarPosition(document, index);
    const mdx = renderDocumentMdx(document, sidebarPosition, context);

    if (options.dryRun) {
      console.log(`[dry-run] Would write ${outputPath}`);
      continue;
    }

    await fs.writeFile(outputPath, mdx);
  }

  console.log(
    `Generated ${generatedDocuments.length} document page(s) in ${options.outputDir}.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
