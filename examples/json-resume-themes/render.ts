import { readFileSync, writeFileSync } from "fs";
import { modernProfessionalTheme, type Resume } from "./themes/modern-professional/index.js";

// Load the sample resume data
const resumeData: Resume = JSON.parse(
  readFileSync("./test-data/sample-resume.json", "utf-8")
);

// Render the resume using the modern professional theme
const { html } = modernProfessionalTheme(resumeData);

// Write the output to a file
writeFileSync("./output.html", html, "utf-8");

console.log("✅ Resume rendered successfully!");
console.log("📄 Output saved to: output.html");
console.log("\nOpen output.html in your browser to view the resume.");
