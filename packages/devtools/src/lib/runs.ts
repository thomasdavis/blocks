import { readdir, readFile } from "fs/promises";
import { join } from "path";
import type { ValidationRunOutput } from "@/types";

const RUNS_DIR = ".blocks/runs";

/**
 * Get the absolute path to the runs directory
 * Uses BLOCKS_PROJECT_DIR if set (from CLI), otherwise cwd
 */
function getRunsPath(): string {
  const projectDir = process.env.BLOCKS_PROJECT_DIR || process.cwd();
  return join(projectDir, RUNS_DIR);
}

/**
 * Load all validation runs from .blocks/runs/
 */
export async function getRuns(): Promise<ValidationRunOutput[]> {
  const runsPath = getRunsPath();

  try {
    const files = await readdir(runsPath);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    const runs = await Promise.all(
      jsonFiles.map(async (file) => {
        try {
          const content = await readFile(join(runsPath, file), "utf-8");
          return JSON.parse(content) as ValidationRunOutput;
        } catch {
          return null;
        }
      })
    );

    // Filter out nulls and sort by timestamp (newest first)
    return runs
      .filter((run): run is ValidationRunOutput => run !== null)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  } catch {
    return [];
  }
}

/**
 * Load a specific run by ID
 */
export async function getRun(id: string): Promise<ValidationRunOutput | null> {
  const runsPath = getRunsPath();

  try {
    const filePath = join(runsPath, `${id}.json`);
    const content = await readFile(filePath, "utf-8");
    return JSON.parse(content) as ValidationRunOutput;
  } catch {
    return null;
  }
}

/**
 * Get summary statistics across all runs
 */
export async function getRunStats(): Promise<{
  totalRuns: number;
  passRate: number;
  runsToday: number;
}> {
  const runs = await getRuns();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const runsToday = runs.filter(
    (run) => new Date(run.timestamp) >= today
  ).length;

  const passedRuns = runs.filter((run) => run.summary.failed === 0).length;
  const passRate = runs.length > 0 ? (passedRuns / runs.length) * 100 : 0;

  return {
    totalRuns: runs.length,
    passRate: Math.round(passRate),
    runsToday,
  };
}
