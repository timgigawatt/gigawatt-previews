// The one address this site claims, independent of which deploy context built it (a branch
// deploy's `process.env.URL` is that deploy's own throwaway domain, not where a lead's
// canonical/og:url/sitemap entry should point). Matches previews/site.json `production_url`.
export const PRODUCTION_URL = 'https://gigawatt-previews.netlify.app';
