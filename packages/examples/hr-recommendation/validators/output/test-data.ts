import { readFileSync } from "fs";
import { join } from "path";
import type { Resume, JobDescription } from "../../types/index.js";

export function loadTestData(): { resume: Resume; job: JobDescription } {
  // Use process.cwd() since the CLI runs from the project root
  const dataDir = join(process.cwd(), "data");
  const resume = JSON.parse(
    readFileSync(join(dataDir, "resumes/senior-developer.json"), "utf-8")
  );
  const job = JSON.parse(
    readFileSync(join(dataDir, "jobs/backend-engineer.json"), "utf-8")
  );
  return { resume, job };
}
