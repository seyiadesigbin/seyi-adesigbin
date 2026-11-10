# Holding page

A temporary "coming soon" page for `seyiadesigbin.com`, served by Cloudflare until the real site goes live on GitHub
Pages. It shares the Desk's look: a dark board of tilted sticky notes. The notes start scattered, and the visitor can
tidy them into dashed outlines (drag, or arrow keys then Enter, or the "Tidy up" button). When all five are placed the
avatar says thanks.

On arrival a dialog says "Coming soon" and offers to tidy the desk. The desk is drawn in 3D (a tilted plane with solid objects, including a Bible labelled "John 3:16").

Plain HTML, CSS and JavaScript. No build step, no dependencies, no network calls, nothing stored or sent. The fonts and
the avatar head are copies of the files in `next/assets`, so this folder deploys on its own.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page shell, share-preview tags (`og:*`) |
| `holding.css` | Styles. Colour tokens are copied from `next/css/tokens.css` |
| `holding.js` | The game and all wording (the `CONTENT` object at the top). Also turns pointer positions into positions on the tilted desk |
| `holding-3d.js` | Gives the desk objects thickness and shadows, drops them in, and moves the lamplight with the pointer |
| `assets/` | Fonts (with their OFL licences), `head.png`, and `desk/*.svg` (the drawn desk objects: laptop, mouse, notebook, pen, pencil, books, phone, Bible, mug, plant, desk mat) |
| `og-image.png` | 1200x630 share-preview card, built from `docs/holding-og-source.html` |
| `SWAP.md` | Steps for moving the domain from Cloudflare to GitHub Pages |

## Deploy (Cloudflare)

Serve the `holding/` folder as a static site: no build command, output directory `holding`. Attach `seyiadesigbin.com`
as the custom domain. Do not add a `CNAME` file; that belongs to the swap change.

## Checks

- `node --check holding/*.js` (also run by CI).
- The desk is a tilted plane in perspective: `--tilt` and `--persp` in `holding.css` (`.world`) are read by `holding.js` to undo the tilt when dragging. Change them there only.
- Screenshots with headless Edge, as described in the root `CLAUDE.md`, open `holding/index.html`.
- Regenerate the share image: open `docs/holding-og-source.html` in headless Edge with `--window-size=1200,630`
  `--screenshot=holding/og-image.png`.
- Not checkable headlessly: dragging, keyboard use and touch. Try them in a real browser on a laptop and a phone.
