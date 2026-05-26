export type GenerateOptions = {
  dryRun: boolean;
  force: boolean;
};

export type GenerateResult = {
  type: "characters" | "factions";
  created: number;
  overwritten: number;
  skipped: number;
};
