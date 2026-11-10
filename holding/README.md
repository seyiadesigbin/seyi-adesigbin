# Holding page

A temporary "coming soon" page for `seyiadesigbin.com`, served by Cloudflare until the real site goes live on GitHub
Pages. It shares the Desk's look: a dark board of tilted sticky notes. The notes start scattered, and the visitor can
tidy them into dashed outlines (drag, or arrow keys then Enter, or the "Tidy up" button). When all five are placed the
avatar says thanks.

On arrival a dialog says "Coming soon" and offers to tidy the desk. The desk is drawn in 3D (a tilted plane with solid objects, including a Bible, with John 3:16 on a note).

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
| `holding-sound.js` | Small synthesised sound effects (Web Audio, no audio files) and the mute switch |
| `og-image.png` | 1200x630 share-preview card: a screenshot of this page opened as `index.html?share` |
| `favicon.png`, `favicon-32.png`, `apple-touch-icon.png` | Tab icon (whole head, transparent background) and the iPhone home-screen icon (head on the note yellow), made from the avatar head. `assets/cursor/*.svg` are the open and closed hand cursors shown over notes |
| `SWAP.md` | Steps for moving the domain from Cloudflare to GitHub Pages |

## Deploy (Cloudflare)

Serve the `holding/` folder as a static site: no build command, output directory `holding`. Attach `seyiadesigbin.com`
as the custom domain. Do not add a `CNAME` file; that belongs to the swap change.

## Checks

- `node --check holding/*.js` (also run by CI).
- The desk is a tilted plane in perspective: `--tilt` and `--persp` in `holding.css` (`.world`) are read by `holding.js` to undo the tilt when dragging. Change them there only.
- Screenshots with headless Edge, as described in the root `CLAUDE.md`, open `holding/index.html`.
- Regenerate the share image: open `holding/index.html?share` in headless Edge with `--window-size=1200,630` and `--screenshot=holding/og-image.png` (the `%20` form of the path is needed if it contains spaces). `?share` hides the controls and the dialog and fixes the note scatter (seed in `holding.js`).
  `--screenshot=holding/og-image.png`.
- Sounds are not heard by any check here: only that each one runs without error and the mute switch changes state.
- The page carries `noindex`, so search engines skip it. The real site must not copy that tag.
- Not checkable headlessly: dragging, keyboard use and touch. Try them in a real browser on a laptop and a phone.
