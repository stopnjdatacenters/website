# Stop NJ Data Centers — website

The website at **stopnjdatacenters.org**. Any change saved to this repository goes live automatically within a minute or two.

## Editing the site (no coding needed)

Almost everything you'll want to change is in three files:

| File | What it controls |
|---|---|
| `site.yaml` | Site name, contact email, social media links |
| `campaigns.yaml` | The South Brunswick page: facts, concerns, timeline, actions, sources |
| `officials.yaml` | The "Where Officials Stand" page |
| `documents.yaml` | The Documents & Public Records page: every record we want and its status |

To edit on github.com: open the file, click the **pencil icon**, make your change, then click **Commit changes**.

**Indentation matters in these files.** Use spaces, not tabs, and line things up exactly like the entries above and below. If the site doesn't update after you commit, a spacing mistake is the most likely cause. The build log in Cloudflare will point to the line.

## Adding a quote from an official

In `officials.yaml`, find the official and add a block under `statements:`:

```yaml
    - date: 2026-10-05
      campaign: south-brunswick
      where: Township Council meeting
      quote: >-
        The exact words, copied from the source.
      source_title: Meeting video
      source_url: https://link-to-the-source
```

## Adding a new official

Copy an entire existing official (from `- name:` down to just before the next `- name:`), paste it at the bottom, and change the details. Set `status` to one of: `opposes`, `supports`, `mixed`, `no-statement`.

## Logging a request for comment

When we contact an official, add it under their `inquiries:` and update `response` when they reply (or don't):

```yaml
  inquiries:
    - date: 2026-10-01
      campaign: south-brunswick
      method: Emailed his office asking for his position
      response: No response as of October 8, 2026
```

## Tracking public records (OPRA)

`documents.yaml` lists every record we want. Each has a `status`: `wanted`, `requested`, `received`, `posted` or `denied`. Instructions are at the top of the file.

- **Someone files a request:** change `status` to `requested` and add `requested: 2026-10-02`. The site shows the response deadline (7 business days) and flips to **Overdue** on its own if the deadline passes.
- **Agency extends the deadline:** add `extended_to: 2026-11-03`.
- **Never record who filed.** That stays in the offline log.

### Posting a document

Documents are stored in Cloudflare R2 (not in this repository) and served from https://docs.stopnjdatacenters.org/.

1. Redact residents' personal details (home addresses, phone numbers, emails, signatures).
2. Name the file lowercase with dashes, date first: `2025-05-planning-board-resolution.pdf`.
3. Cloudflare: **R2 > stopnjdatacenters-docs > Upload**.
4. In `documents.yaml`: set `status: posted`, and add `url` and `size`.

## Rules for what goes on the site

These protect the group legally and keep us credible:

1. **Every fact needs a source link.** If we can't source it, it doesn't go up.
2. **Quotes are word for word**, short, and linked to where they were said.
3. **Positions and summaries are neutral.** No insults, no guessing at motives.
4. **Nothing about officials' private lives** (homes, family, personal finances) unless it's directly about their public role and properly sourced.
5. **Every statute or regulation we cite links to its text.** Common ones are listed under `laws:` in `site.yaml`.

## For technical helpers

- Built with [Eleventy](https://www.11ty.dev/) into `_site/`. All files are kept in one folder on purpose (no subfolders), so the repo can be updated by drag-and-drop on github.com.
- Pages: `index.njk`, `south-brunswick.njk`, `officials.njk`, `documents.njk`, `about.md`, `404.njk`.
- Short text fields (action `text`, record `description` and `key_question`) accept Markdown links: `[label](https://...)`. Layout: `base.njk`. Styles: `style.css`.
- Hosted on Cloudflare Workers (static assets); see `wrangler.jsonc`.
- Preview locally: `npm install` then `npm start`.
