# Swap day: from the Cloudflare holding page to GitHub Pages

The holding page is served by Cloudflare on `seyiadesigbin.com`. The real site is served by GitHub Pages. Moving the
domain between them is a DNS change, so the order below matters: the Cloudflare side is released first, otherwise two
records for the same name conflict.

Menu names in Cloudflare and GitHub change over time. Where a step names a screen, confirm it against the current
interface. The GitHub Pages addresses below are the documented ones at the time of writing; confirm them against
GitHub's page "Managing a custom domain for your GitHub Pages site" on the day.

## Before the day

- [ ] The swap change is merged: the new site is at the repo root and the `CNAME` file contains `seyiadesigbin.com`.
- [ ] GitHub Pages is enabled for the repo (Settings, Pages, deploy from `main`, root) and the site loads at its
      `github.io` address.
- [ ] The share-preview URLs in the new site's `index.html` use the confirmed domain.
- [ ] The Cloudflare project and DNS tab are open, and the current records on the zone are noted (screenshot or copy),
      so the rollback is exact.

## Steps

1. **Detach the Cloudflare custom domain.** In the Cloudflare project that serves `holding/`, open Custom domains and
   remove `seyiadesigbin.com` (and `www.seyiadesigbin.com` if it was added).
2. **Remove its DNS record.** In the zone's DNS tab, delete any record left pointing at the holding project (a `CNAME`
   to a `*.pages.dev` or `*.workers.dev` name, or the record Cloudflare created when the domain was attached). Keep
   every record that is not for the holding page (mail, verification, and so on).
3. **Add the GitHub Pages records**, all set to DNS only (grey cloud, not proxied), so GitHub can issue the HTTPS
   certificate:

   | Type | Name | Value |
   |------|------|-------|
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | AAAA | `@` | `2606:50c0:8000::153` |
   | AAAA | `@` | `2606:50c0:8001::153` |
   | AAAA | `@` | `2606:50c0:8002::153` |
   | AAAA | `@` | `2606:50c0:8003::153` |
   | CNAME | `www` | `seyiadesigbin.github.io` |

4. **Confirm the domain in GitHub.** Settings, Pages: the custom domain reads `seyiadesigbin.com` and the DNS check
   passes. Tick Enforce HTTPS once it becomes available. The certificate can take from a few minutes to about an hour,
   so a short period of certificate warnings is expected.
5. **Leave `oluwaseyiadesigbin.com` alone.** It stays a 302 redirect to `seyiadesigbin.com`. Its redirect rule lives in
   its own Cloudflare zone and does not depend on steps 1 to 4. Do not change it to a 301 as part of the swap.

## Check

- [ ] `https://seyiadesigbin.com` shows the new site, in a private window and on a phone on mobile data.
- [ ] `https://www.seyiadesigbin.com` reaches the same site.
- [ ] `curl -I https://oluwaseyiadesigbin.com` returns `302` with a `location` of `https://seyiadesigbin.com/`.
- [ ] The old holding page no longer appears anywhere on the domain.
- [ ] Re-scrape the link in LinkedIn's Post Inspector. Chat and social apps cache share previews, so the holding-page
      card can keep showing for a while.

## Rollback

Delete the records added in step 3, re-attach `seyiadesigbin.com` as a custom domain on the Cloudflare project, and
restore the records noted before the day. The holding page then serves again.

## After the swap

Remove the `holding/` folder in a separate change, and delete the Cloudflare project.
