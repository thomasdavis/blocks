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
 * This theme enforces domain rules through runtime validation to ensure:
 * 1. All required sections are present and rendered (work, education, skills)
 * 2. Semantic HTML5 structure: <header>, <main>, <section>, <article>
 * 3. Accessibility compliance: ARIA labels, semantic roles, heading hierarchy (h1, h2, h3)
 * 4. Responsive design: CSS media queries with 768px breakpoint for mobile/tablet/desktop
 * 5. Visual hierarchy: Distinct typography with multiple font sizes for headings
 *
 * Output HTML Structure:
 * - <header role="banner"> - Contact information with ARIA labels
 * - <main role="main"> - Main content area
 *   - <section aria-labelledby="..."> - Each major section (work, education, skills)
 *     - <h2 id="..."> - Section headings
 *     - <article> - Individual work/education items
 *       - <h3> - Subsection headings
 *
 * The template (template.hbs) generates semantic HTML with:
 * - Responsive CSS (@media max-width: 768px)
 * - Typography hierarchy (h1: 2.5rem, h2: 1.75rem, h3: 1.25rem)
 * - ARIA labels on all sections and navigation elements
 *
 * @param resume - JSON Resume data following the standard schema
 * @param config - Optional theme configuration for customization
 * @returns Object with html property containing the rendered HTML string
 * @throws Error if required sections are missing or domain rules are violated
 */
export function modernProfessionalTheme(resume: Resume, config?: ThemeConfig): { html: string } {
  // Domain Rule: Validate all required sections are present
  if (!resume.basics) {
    throw new Error("Resume must include basics section (required by domain rules)");
  }

  if (!resume.basics.name || !resume.basics.label) {
    throw new Error("Resume basics must include name and label (required by domain rules)");
  }

  if (!resume.work || resume.work.length === 0) {
    throw new Error("Resume must include work section with at least one entry (required by domain rules)");
  }

  if (!resume.education || resume.education.length === 0) {
    throw new Error("Resume must include education section with at least one entry (required by domain rules)");
  }

  if (!resume.skills || resume.skills.length === 0) {
    throw new Error("Resume must include skills section with at least one entry (required by domain rules)");
  }

  // Render the template with the resume data
  // The template uses semantic HTML5 tags: <header>, <main>, <section>, <article>
  // It includes proper ARIA labels for accessibility
  // It implements responsive design via CSS media queries
  // It establishes clear visual hierarchy with typography
  const html = template(resume);

  // Domain Rule: Validate that all required sections appear in rendered HTML
  validateRequiredSections(html);

  // Domain Rule: Validate semantic HTML structure in rendered output
  validateSemanticHTML(html);

  // Domain Rule: Validate accessibility features
  validateAccessibility(html);

  // Domain Rule: Validate responsive design implementation
  validateResponsiveDesign(html);

  // Domain Rule: Validate visual hierarchy
  validateVisualHierarchy(html);

  return { html };
}

/**
 * Validates that all required sections (basics, work, education, skills) appear in rendered HTML
 */
function validateRequiredSections(html: string): void {
  const requiredSections = [
    { name: 'Work Experience', id: 'experience-heading' },
    { name: 'Education', id: 'education-heading' },
    { name: 'Skills', id: 'skills-heading' },
  ];

  for (const section of requiredSections) {
    if (!html.includes(section.id)) {
      throw new Error(`Rendered HTML must include ${section.name} section (required by domain rules)`);
    }
  }
}

/**
 * Validates that the rendered HTML uses semantic HTML5 tags
 * Domain Rule: Must use semantic HTML tags (header, main, section, article)
 */
function validateSemanticHTML(html: string): void {
  const requiredTags = ['<header', '<main', '<section', '<article'];

  for (const tag of requiredTags) {
    if (!html.includes(tag)) {
      throw new Error(`HTML must include semantic ${tag}> tag (required by semantic_html domain rule)`);
    }
  }
}

/**
 * Validates that the rendered HTML includes proper ARIA labels and semantic structure
 * Domain Rule: Must include proper ARIA labels and semantic structure
 *
 * Checks for:
 * - ARIA labels (aria-label, aria-labelledby) on sections
 * - Semantic roles (role="banner", role="main")
 * - Proper heading hierarchy (h1, h2, h3)
 * - Multiple ARIA attributes across the document
 */
function validateAccessibility(html: string): void {
  // Check for ARIA labels - count occurrences to ensure multiple sections are labeled
  const ariaLabelMatches = html.match(/aria-label/g) || [];
  const ariaLabelledByMatches = html.match(/aria-labelledby/g) || [];
  const roleMatches = html.match(/role=/g) || [];

  const totalAriaAttributes = ariaLabelMatches.length + ariaLabelledByMatches.length + roleMatches.length;

  if (totalAriaAttributes < 3) {
    throw new Error(`HTML must include multiple ARIA labels/roles for accessibility (found ${totalAriaAttributes}, need at least 3) (required by accessibility_score measure)`);
  }

  // Validate complete heading hierarchy (h1, h2, h3)
  const hasH1 = html.includes('<h1>') || html.includes('<h1 ');
  const hasH2 = html.includes('<h2>') || html.includes('<h2 ');
  const hasH3 = html.includes('<h3>') || html.includes('<h3 ');

  if (!hasH1) {
    throw new Error("HTML must include h1 heading for proper hierarchy (required by accessibility domain rule)");
  }

  if (!hasH2) {
    throw new Error("HTML must include h2 headings for section hierarchy (required by accessibility domain rule)");
  }

  if (!hasH3) {
    throw new Error("HTML must include h3 headings for subsection hierarchy (required by accessibility domain rule)");
  }
}

/**
 * Validates that the rendered HTML uses CSS media queries for responsive design
 * Domain Rule: Must use CSS media queries for responsive layout
 * Constraints: Must work on mobile (320px+), tablet (768px+), desktop (1024px+)
 */
function validateResponsiveDesign(html: string): void {
  if (!html.includes('@media')) {
    throw new Error("HTML must include CSS media queries for responsive design (required by responsive_design domain rule)");
  }

  // Check for tablet breakpoint (768px) - required by responsive_layout measure
  const hasTabletBreakpoint = html.match(/@media[^}]*768px/);
  if (!hasTabletBreakpoint) {
    throw new Error("CSS must include tablet breakpoint (768px) for responsive design (required by responsive_layout measure)");
  }

  // Verify responsive styles modify layout properties
  const hasResponsiveLayoutChanges = html.match(/@media[^}]*(max-width|min-width)[^}]*(padding|margin|flex|grid|width)/);
  if (!hasResponsiveLayoutChanges) {
    throw new Error("CSS media queries must modify layout properties for effective responsive design (required by responsive_layout measure)");
  }
}

/**
 * Validates that the rendered HTML establishes clear visual hierarchy with typography
 * Domain Rule: Must establish clear visual hierarchy with typography
 */
function validateVisualHierarchy(html: string): void {
  // Check for font-size definitions that establish hierarchy
  const hasFontSize = html.includes('font-size');
  const hasFontWeight = html.includes('font-weight');

  if (!hasFontSize && !hasFontWeight) {
    throw new Error("CSS must establish visual hierarchy with typography (font-size or font-weight) (required by visual_hierarchy domain rule)");
  }

  // Ensure there are multiple font sizes to create hierarchy
  const fontSizeMatches = html.match(/font-size:\s*[\d.]+(?:px|em|rem)/g);
  if (!fontSizeMatches || fontSizeMatches.length < 3) {
    throw new Error("CSS must use multiple font sizes to establish clear visual hierarchy (required by visual_hierarchy domain rule)");
  }

  // Verify that heading styles are differentiated
  const hasH1Style = html.match(/h1\s*\{[^}]*font-size/);
  const hasH2Style = html.match(/h2\s*\{[^}]*font-size/);

  if (!hasH1Style || !hasH2Style) {
    throw new Error("CSS must define distinct typographic styles for headings (h1, h2) to establish hierarchy (required by visual_hierarchy domain rule)");
  }
}
