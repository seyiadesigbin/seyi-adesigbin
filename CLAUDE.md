# Project notes for Claude

These add to the owner's global rules in `~/.claude/CLAUDE.md` (commits, pull requests, long chats). Where they
conflict, ask the owner. Re-read the global file at the start of a session: it changes.

## What this is

A personal portfolio site, rebuilt from scratch to remove every trace of an old Envato template. The new site lives in
`next/`. The old template files at the repo root are the live site until the final "swap" change; do not edit or
delete them before then.

## Hard constraints

- Plain HTML, CSS and JavaScript. No framework, no build step, no npm dependencies, no CDN calls. Scripts are plain
  files (not ES modules) so the site also works when `index.html` is opened from disk.
- All text and data live in `next/js/content.js` (`window.SITE`). Never hard-code facts in `desk.js`, `report.js` or
  the HTML. Both views must keep reading from that file.
- Build DOM with `textContent` and element creation, not `innerHTML`, for anything derived from content.
- Do not guess facts about the owner. Ask. Examples that were deliberately left out until given: the year they moved to
  the UK, the resume file, real tool-usage weights (`tools[].weight` are placeholders).
- The Web3Forms key in `content.js` is public by design; do not treat it as a secret, and do not add other secrets.
- Do not set up DNS or the `CNAME` file before the swap change, so the old template is never shown on the new domain.

## Structure

See `README.md` for the file map. Key points:
- `app.js` picks the view (hash, then stored choice, then screen size / reduced motion), re-lays out the Desk when it is
  shown (a hidden view cannot be measured), and mounts `Desk` and `Report`. Each of those adds the contact form by
  calling `ContactForm.create(site)`.
- `desk.js` has three layouts: hand-placed scatter at 1180px and up (the `POS` table: x, y, tilt on a 1200px board),
  tidy columns from 700 to 1179px, stacked under 700px. Items move by pointer or arrow keys.
- Scatter was tuned by screenshot: below about 1180px it covered text, so do not lower `SCATTER_MIN` without checking.
- `report.js` computes the timeline year range and bar positions from `experience[].start/end`.
- `contact-form.js` returns `null` when `contact.formKey` is unset, so no broken form is ever shown.

## Conventions

- Behaviour respects `prefers-reduced-motion` (no animated count-up, no tidy animation).
- Interactive things must work from the keyboard and carry accessible names.
- Branches: `feature/`, `fix/`, `docs/` or `chore/` plus a short name. One branch per piece of work, and do not start a
  new one while the previous is unmerged.
- Commit and PR text is written to a file first, then `git commit -F` and `gh pr create --body-file` with absolute
  paths. No mention of Claude or AI in commits or PRs.
- Git on Windows warns "LF will be replaced by CRLF". This is expected and harmless.

## How to check work

- `node --check` on every file in `next/js/`.
- Screenshots with headless Edge:
  `"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless --disable-gpu --no-first-run --user-data-dir=<temp dir> --window-size=1400,1900 --virtual-time-budget=5000 --screenshot=<file.png> "file:///.../next/index.html#desk"`
  Use `#report` for the Report. Add `--force-prefers-reduced-motion` to see final values of the count-up.
- Limits of that setup: it will not render narrower than about 500px; it cannot drag or press keys; its animation clock
  is not normal; its network calls to Web3Forms failed, so only a real browser can confirm delivery.
- Say plainly in each PR what was not run. A person must still try dragging, keyboard use, phones and screen readers.

## Roadmap

This is the one tracking list for agreed work. Rule: when a feature or task is agreed in chat, add it here in the same
change, and remove it when it is merged. Every handover lists everything below, not only open pull requests.

Done and merged (do not redo): avatar pop-up, animated career timeline, self-hosted fonts, share-preview tags, sitemap
and robots.

Agreed, not built:
- **Review notes** (`feature/review-notes`): a review mode switched on by `?review` in the address. Click anything, type
  a note, and a pin appears. Notes are kept in the browser (`localStorage`); an Export button copies them with the page,
  view (Desk or Report), screen width and element name. One file, `next/js/review.js`, loaded only with `?review`. Pins
  must survive Desk re-layout. No server, no database. Owner reviews in Chrome profile "Profile 2" through a Desktop
  shortcut.
- **Headline rewrite** (`feature/headline-problem-solver`): the hero headline, lead text, ANALYST tag, Expertise "Data
  Analysis" card and share-preview text should not lead with "Data Analysis"; the owner wants to come across as a
  problem solver. Ask for wording and facts; do not invent them.
- **Timeline changes**: show roles within each year, a country flag per role (all Nigeria except Heriot-Watt, UK
  Scotland), keep recruiter-useful facts (title, dates, place) readable at a glance. Job details wait for the owner's
  career-hub data (months, refined role text).
- **Resume PDF**, real tool weights, domain confirmation for share-preview URLs: waiting on the owner.
- **The swap change**, last: DNS, `CNAME`, hosting. Stay on GitHub Pages with a public repo unless the owner decides
  otherwise.

Not yet seen in a real browser: the section-menu button's narrow-window fallback (bottom-left), phone widths, dragging,
and its fade-in.
