import { spawnSync } from "node:child_process";

export function runDataValidation() {
  const result = spawnSync("npm", ["run", "validate:data"], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.error) {
    console.error("");
    console.error("Data validation could not be started.");
    console.error(result.error.message);
    process.exit(1);
  }

  if ((result.status ?? 1) !== 0) {
    console.error("");
    console.error("MDX generation aborted because data validation failed.");
    process.exit(result.status ?? 1);
  }
}
