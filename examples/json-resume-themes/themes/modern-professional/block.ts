import Handlebars from "handlebars";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load template from source directory (not dist)
// When running from dist/, we need to go back to source
const isInDist = __dirname.includes('/dist/');
const templatePath = isInDist
  ? join(__dirname, "../../../themes/modern-professional/template.hbs")
  : join(__dirname, "template.hbs");

const templateSource = readFileSync(templatePath, "utf-8");
const template = Handlebars.compile(templateSource);

export interface Resume {
  basics: {
    name: string;
    label: string;
    image?: string;
    email?: string;
    phone?: string;
    url?: string;
    summary?: string;
    location?: {
      city?: string;
      region?: string;
      countryCode?: string;
    };
    profiles?: Array<{
      network: string;
      username: string;
      url: string;
    }>;
  };
  work?: Array<{
    name: string;
    position: string;
    url?: string;
    startDate: string;
    endDate?: string;
    summary?: string;
    highlights?: string[];
  }>;
  volunteer?: Array<any>;
  education?: Array<{
    institution: string;
    url?: string;
    area: string;
    studyType: string;
    startDate: string;
    endDate: string;
    score?: string;
    courses?: string[];
  }>;
  awards?: Array<any>;
  publications?: Array<any>;
  skills?: Array<{
    name: string;
    level?: string;
    keywords: string[];
  }>;
  languages?: Array<{
    language: string;
    fluency: string;
  }>;
  interests?: Array<{
    name: string;
    keywords: string[];
  }>;
  references?: Array<any>;
}

export interface ThemeConfig {
  colors?: {
    primary?: string;
    secondary?: string;
  };
  fonts?: {
    body?: string;
    heading?: string;
  };
  layout?: {
    maxWidth?: string;
  };
  spacing?: {
    base?: string;
  };
}

/**
 * Render a JSON Resume using the Modern Professional theme
 *
 * Domain compliance is enforced at development time by the Blocks validator,
 * which analyzes the template source (template.hbs) for:
 * - Semantic HTML5 structure (header, main, section, article)
 * - Accessibility (ARIA labels, heading hierarchy)
 * - Responsive design (CSS media queries)
 * - Visual hierarchy (typography)
 *
 * @param resume - JSON Resume data following the standard schema
 * @param config - Optional theme configuration for customization
 * @returns Object with html property containing the rendered HTML string
 * @throws Error if required data is missing
 */
export function modernProfessionalTheme(resume: Resume, config?: ThemeConfig): { html: string } {
  // Input validation: Ensure required data is present
  if (!resume.basics?.name || !resume.basics?.label) {
    throw new Error("Resume must include basics.name and basics.label");
  }

  // Render template and return
  const html = template(resume);
  return { html };
}
