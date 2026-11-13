import MDXComponents from "@theme-original/MDXComponents";
import SessionCharacterGrid from "@site/src/components/SessionCharacterGrid";
import {DocumentPdf} from "@site/src/components/documents/mdx/DocumentPdf";
import {
  Callout,
  Divider,
  DocumentGallery,
  DocumentImage,
  Quote,
  Spoiler,
} from "@site/src/components/documents/mdx/DocumentMdxComponents";

export default {
  ...MDXComponents,
  Quote,
  Callout,
  Spoiler,
  DocumentImage,
  DocumentGallery,
  DocumentPdf,
  Divider,
  SessionCharacterGrid,
};
