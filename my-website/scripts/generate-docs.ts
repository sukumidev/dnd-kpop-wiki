import { runDataValidation } from "./preflight-validation";
import { generateCharacterPages } from "./generate-character-pages";
import { generateFactionPages } from "./generateFactionsMdx";
import type { GenerateOptions, GenerateResult } from "./generate-types";

type GeneratorType = GenerateResult["type"];

type CliOptions = GenerateOptions & {
  only?: GeneratorType;
};

function parseArgs(argv = process.argv.slice(2)): CliOptions {
  const args = new Set(argv);
  let only: GeneratorType | undefined;

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];

    if (arg === "--only") {
      only = parseOnlyValue(argv[index + 1]);
      index++;
      continue;
    }

    if (arg.startsWith("--only=")) {
      only = parseOnlyValue(arg.slice("--only=".length));
    }
  }

  return {
    dryRun: args.has("--dry-run") || args.has("-n"),
    force: args.has("--force") || args.has("-f"),
    only,
  };
}

function parseOnlyValue(value?: string): GeneratorType {
  if (value === "characters" || value === "factions") {
    return value;
  }

  console.error(`Opcion --only invalida: ${value ?? "(sin valor)"}`);
  console.error("Usa --only characters o --only factions.");
  process.exit(1);
}

function printGlobalSummary(results: GenerateResult[]) {
  console.log("\nGeneracion terminada");

  for (const result of results) {
    const label = result.type === "characters" ? "Characters" : "Factions";

    console.log(`\n${label}:`);
    console.log(`- Created: ${result.created}`);
    console.log(`- Overwritten: ${result.overwritten}`);
    console.log(`- Skipped: ${result.skipped}`);
  }
}

async function main() {
  const options = parseArgs();
  const generateOptions: GenerateOptions = {
    dryRun: options.dryRun,
    force: options.force,
  };

  runDataValidation();

  const selectedGenerators = options.only ? [options.only] : (["characters", "factions"] as GeneratorType[]);
  const results: GenerateResult[] = [];

  for (const generator of selectedGenerators) {
    if (generator === "characters") {
      results.push(await generateCharacterPages(generateOptions));
    }

    if (generator === "factions") {
      results.push(await generateFactionPages(generateOptions));
    }
  }

  printGlobalSummary(results);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
