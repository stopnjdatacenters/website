import { readFileSync } from "node:fs";
import { load as loadYaml } from "js-yaml";

// All files live in one folder (no subfolders), so the site can be
// uploaded to GitHub by drag-and-drop without breaking.

export default function (eleventyConfig) {
  // Site data, edited by organizers.
  const yamlFile = (name) => () => loadYaml(readFileSync(name, "utf8"));
  eleventyConfig.addGlobalData("site", yamlFile("site.yaml"));
  eleventyConfig.addGlobalData("campaigns", yamlFile("campaigns.yaml"));
  eleventyConfig.addGlobalData("officials", yamlFile("officials.yaml"));

  // Files that are not pages.
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.ignores.add("base.njk");

  // Stylesheet is served at /css/style.css.
  eleventyConfig.addPassthroughCopy({ "style.css": "css/style.css" });

  // Show dates like "June 4, 2026". Accepts "2026-06-04" or "2025-05".
  eleventyConfig.addFilter("readableDate", (value) => {
    if (!value) return "";
    const s = value instanceof Date ? value.toISOString().slice(0, 10) : String(value);
    const [y, m, d] = s.split("-").map(Number);
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    if (!m) return String(y);
    if (!d) return `${months[m - 1]} ${y}`;
    return `${months[m - 1]} ${d}, ${y}`;
  });

  // Officials who have spoken about a given campaign (by its id).
  eleventyConfig.addFilter("forCampaign", (officials, id) =>
    (officials || []).filter((o) => (o.statements || []).some((s) => s.campaign === id) || (o.campaigns || []).includes(id))
  );

  // Look up a source by id within a campaign. Fails the build if the id is
  // misspelled, so a broken citation can never go live.
  eleventyConfig.addFilter("sourceById", (campaign, id) => {
    const s = (campaign.sources || []).find((x) => x.id === id);
    if (!s) throw new Error(`Unknown source id "${id}" in campaign "${campaign.id}"`);
    return s;
  });

  // Sort statements newest first.
  eleventyConfig.addFilter("newestFirst", (items) =>
    [...(items || [])].sort((a, b) => String(b.date).localeCompare(String(a.date)))
  );

  return {
    dir: { input: ".", includes: "", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
