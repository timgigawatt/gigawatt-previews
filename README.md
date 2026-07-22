# Gigawatt Previews

Homepage-concept previews for CRM leads, served by the second Firebase Hosting site
(`gigawatt-previews`) in the `gigawatt-crm` project. Public by nature — no IAM/bucket
policies involved (the org's Domain Restricted Sharing blocks public buckets, which is
why this is a Hosting site and not Cloud Storage).

- One preview per lead at `public/<business-slug>/index.html` — a single self-contained
  file (inline CSS, no build step). Slug matches the CRM's: lowercase, non-alphanumerics
  collapsed to `-` (e.g. "Bob's HVAC" → `bob-s-hvac`).
- Live URL: `https://gigawatt-previews.web.app/<business-slug>/`
- Deploy: `firebase deploy --only hosting:previews` (from this directory)
- After deploy, the design routine PATCHes the lead's `previewUrl` in the CRM
  (see `~/data/prompts/gigawatt-preview-designer.md`).

`public/_sample/` is a reference concept demonstrating the expected quality bar and
structure; it is never linked to a lead.
