import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

/**
 * Run with: npm run images:webp
 *
 * Generates WebP equivalents for PNG/JPG/JPEG assets under the Wiki image
 * directory. Originals are preserved and existing WebP files are skipped.
 * This script does not update asset references or delete original files.
 */

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const imageRoot = path.join(projectRoot, "static", "img");

const supportedExtensions = new Set([".png", ".jpg", ".jpeg"]);

const totals = {
  converted: 0,
  skipped: 0,
  failed: 0,
  originalBytes: 0,
  webpBytes: 0,
};

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const digits = value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(digits)} ${units[unitIndex]}`;
}

function relativeToImageRoot(filePath) {
  return path.relative(imageRoot, filePath).split(path.sep).join("/");
}

function reductionPercent(originalBytes, convertedBytes) {
  if (originalBytes === 0) {
    return 0;
  }

  return ((originalBytes - convertedBytes) / originalBytes) * 100;
}

async function convertImage(inputPath) {
  const outputPath = inputPath.slice(0, -path.extname(inputPath).length) + ".webp";
  const inputRelativePath = relativeToImageRoot(inputPath);
  const outputRelativePath = relativeToImageRoot(outputPath);

  try {
    await fs.access(outputPath);
    totals.skipped += 1;
    console.log(`SKIP ${outputRelativePath} already exists`);
    return;
  } catch (error) {
    if (error.code !== "ENOENT") {
      totals.failed += 1;
      console.error(`FAIL ${inputRelativePath}`);
      console.error(error.message);
      return;
    }
  }

  try {
    const inputStats = await fs.stat(inputPath);
    const webpBuffer = await sharp(inputPath)
      .rotate()
      .webp({
        quality: 82,
        effort: 6,
        alphaQuality: 90,
      })
      .toBuffer();

    await fs.writeFile(outputPath, webpBuffer, { flag: "wx" });

    const reduction = reductionPercent(inputStats.size, webpBuffer.length);
    totals.converted += 1;
    totals.originalBytes += inputStats.size;
    totals.webpBytes += webpBuffer.length;

    console.log(`OK ${inputRelativePath}`);
    console.log(`   ${formatBytes(inputStats.size)} → ${formatBytes(webpBuffer.length)}`);
    console.log(
      reduction >= 0
        ? `   ${reduction.toFixed(1)}% smaller`
        : `   ${Math.abs(reduction).toFixed(1)}% larger`,
    );
  } catch (error) {
    if (error.code === "EEXIST") {
      totals.skipped += 1;
      console.log(`SKIP ${outputRelativePath} already exists`);
      return;
    }

    totals.failed += 1;
    console.error(`FAIL ${inputRelativePath}`);
    console.error(error.message);
  }
}

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (supportedExtensions.has(extension)) {
      await convertImage(fullPath);
    }
  }
}

async function main() {
  try {
    const imageRootStats = await fs.stat(imageRoot);
    if (!imageRootStats.isDirectory()) {
      throw new Error("Path exists but is not a directory.");
    }
  } catch (error) {
    console.error("Image directory not found:");
    console.error(imageRoot);
    if (error.code !== "ENOENT") {
      console.error(error.message);
    }
    process.exitCode = 1;
    return;
  }

  try {
    await walk(imageRoot);
  } catch (error) {
    console.error("Unable to scan the Wiki image directory:");
    console.error(error.message);
    process.exitCode = 1;
    return;
  }

  const totalReduction = reductionPercent(totals.originalBytes, totals.webpBytes);

  console.log("");
  console.log("──────────────");
  console.log(`Converted: ${totals.converted}`);
  console.log(`Skipped:   ${totals.skipped}`);
  console.log(`Failed:    ${totals.failed}`);
  console.log("");
  console.log(`Original:  ${formatBytes(totals.originalBytes)}`);
  console.log(`WebP:      ${formatBytes(totals.webpBytes)}`);
  console.log(`Reduction: ${totalReduction.toFixed(1)}%`);

  if (totals.failed > 0) {
    process.exitCode = 1;
  }
}

await main();
