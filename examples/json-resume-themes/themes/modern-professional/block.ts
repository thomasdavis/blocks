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
 * This theme:
 * - Uses semantic HTML5 elements (header, main, section, article)
 * - Implements responsive design with CSS media queries
 * - Ensures accessibility with ARIA labels and proper heading hierarchy
 * - Provides clear visual hierarchy through typography and spacing
 *
 * @param resume - JSON Resume data following the standard schema
 * @param config - Optional theme configuration for customization
 * @returns HTML string of the rendered resume
 */
export function modernProfessionalTheme(resume: Resume, config?: ThemeConfig): { html: string } {
  // Validate that required sections are present
  if (!resume.basics) {
    throw new Error("Resume must include basics section");
  }

  if (!resume.basics.name || !resume.basics.label) {
    throw new Error("Resume basics must include name and label");
  }

  // Render the template with the resume data
  const html = template(resume);

  return { html };
}
