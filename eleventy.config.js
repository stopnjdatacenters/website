import { readFileSync } from "node:fs";
import { load as loadYaml } from "js-yaml";
import markdownIt from "markdown-it";

// All files live in one folder (no subfolders), so the site can be
// uploaded to GitHub by drag-and-drop without breaking.

export default function (eleventyConfig) {
  // Site data, edited by organizers.
  const yamlFile = (name) => () => loadYaml(readFileSync(name, "utf8"));
  eleventyConfig.addGlobalData("site", yamlFile("site.yaml"));
  eleventyConfig.addGlobalData("campaigns", yamlFile("campaigns.yaml"));
  eleventyConfig.addGlobalData("officials", yamlFile("officials.yaml"));
  eleventyConfig.addGlobalData("documents", yamlFile("documents.yaml"));

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

  // Short date like "Oct 1" (adds the year if it isn't the current one).
  eleventyConfig.addFilter("shortDate", (value) => {
    if (!value) return "";
    const [y, m, d] = String(value).split("-").map(Number);
    const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m - 1];
    const thisYear = new Date().getFullYear();
    return d ? `${mon} ${d}${y !== thisYear ? ", " + y : ""}` : `${mon} ${y}`;
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

  // Records belonging to a campaign, optionally only those with a given status.
  eleventyConfig.addFilter("docsForCampaign", (docs, id, status) =>
    (docs || []).filter((d) => d.campaign === id && (!status || d.status === status))
  );

  // Records with a given status.
  eleventyConfig.addFilter("withStatus", (docs, status) => (docs || []).filter((d) => d.status === status));

  // OPRA response deadline: the agency's stated date if given, otherwise
  // 7 business days after the request (weekends skipped, holidays not).
  eleventyConfig.addFilter("responseDue", (rec) => {
    if (rec.extended_to) return String(rec.extended_to);
    if (rec.due) return String(rec.due);
    if (!rec.requested) return "";
    const d = new Date(String(rec.requested) + "T12:00:00Z");
    let added = 0;
    while (added < 7) {
      d.setUTCDate(d.getUTCDate() + 1);
      const day = d.getUTCDay();
      if (day !== 0 && day !== 6) added++;
    }
    return d.toISOString().slice(0, 10);
  });

  // Allow [links](https://...) in short text fields.
  const md = markdownIt({ html: false, linkify: false });
  eleventyConfig.addFilter("mdInline", (s) => (s ? md.renderInline(String(s).trim()) : ""));

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
