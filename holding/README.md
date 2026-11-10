# Holding page

A temporary "coming soon" page for `seyiadesigbin.com`, served by Cloudflare until the real site goes live on GitHub
Pages. It shares the Desk's look: a dark board of tilted sticky notes. The notes start scattered, and the visitor can
tidy them into dashed outlines (drag, or arrow keys then Enter, or the "Tidy up" button). When all five are placed the
avatar says thanks.

Plain HTML, CSS and JavaScript. No build step, no dependencies, no network calls, nothing stored or sent. The fonts and
the avatar head are copies of the files in `next/assets`, so this folder deploys on its own.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page shell, share-preview tags (`og:*`) |
| `holding.css` | Styles. Colour tokens are copied from `next/css/tokens.css` |
| `holding.js` | The game and all wording (the `CONTENT` object at the top) |
| `assets/` | Fonts (with their OFL licences) and `head.png` |
| `og-image.png` | 1200x630 share-preview card, built from `docs/holding-og-source.html` |
| `SWAP.md` | Steps for moving the domain from Cloudflare to GitHub Pages |

## Deploy (Cloudflare)

Serve the `holding/` folder as a static site: no build command, output directory `holding`. Attach `seyiadesigbin.com`
as the custom domain. Do not add a `CNAME` file; that belongs to the swap change.

## Checks

- `node --check holding/holding.js` (also run by CI).
- Screenshots with headless Edge, as described in the root `CLAUDE.md`, open `holding/index.html`.
- Regenerate the share image: open `docs/holding-og-source.html` in headless Edge with `--window-size=1200,630`
  `--screenshot=holding/og-image.png`.
- Not checkable headlessly: dragging, keyboard use and touch. Try them in a real browser on a laptop and a phone.
