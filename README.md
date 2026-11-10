# Seyi Adesigbin: personal website

The source for [seyiadesigbin.com](https://seyiadesigbin.com) (domain bought, not yet connected).

The site is being rebuilt from scratch to replace an old Envato template. It is plain HTML, CSS and JavaScript:
no framework, no build step, no libraries.

## Status

| Part | Where | State |
|---|---|---|
| New site | `next/` | Built: Desk view, Report view, contact form, icon contact links, avatar pop-up, animated career timeline with a flag per role, floating section menu, self-hosted fonts, share-preview tags, review mode |
| Holding page (temporary) | `holding/` | A playable "tidy the desk" coming-soon page, served by Cloudflare until the swap. Swap-day steps: `holding/SWAP.md` |
| Old template site | repo root (`index.html`, `css/`, `js/`, `fonts/`, `img/`) | Still the live site. Will be deleted in the final "swap" change |

Still to come: a resume download, and the swap (move `next/` to the root, add the `CNAME` file, connect the domain).

## The two views

One page, two ways of reading the same content. A small switch (top right) changes between them, and the address
reflects the choice (`#desk` or `#report`).

- **Desk**: a pinboard of notes that can be dragged (mouse, touch, or arrow keys on a focused note). Scattered on wide
  screens, tidy columns on medium screens, stacked on phones.
- **Report**: an annual-report style page with key figures, a career timeline, areas of expertise, toolkit and contact.

Which one opens first: a `#desk` or `#report` link wins; otherwise the visitor's last choice; otherwise Report on small
screens or when the device asks for reduced motion, else Desk.

## Running it

No install needed. Open `next/index.html` in a browser (double-click works).

## Editing the content

Everything written on the site lives in one file: [`next/js/content.js`](next/js/content.js). Both views read it, so a
change there shows up in both. It holds the name and intro, roles and years, headline numbers, areas of expertise,
tools, and contact details (including the contact form key and the resume path).

Examples:
- Add a role: add an entry to `experience` (the Report timeline works out its year range from the data).
- Show the resume button: set `contact.resume` to the file path, for example `"assets/resume.pdf"`. While it is
  `null`, no resume link appears anywhere.
- Remove the "Open to work" sticker on the Desk: set `sticker` to `null`.

## How it is organised

```
next/
  index.html            page shell with both views and the switch
  assets/               images (figure/ holds the six pieces of the avatar, front view, and figure/walk/ the six pieces of the side-view walker; og-image.png is the share-preview card, 1200x630, made from avatar.png)
  robots.txt            allows crawlers, points to the sitemap
  sitemap.xml           the one page
  css/
    tokens.css          colours, fonts, spacing (the one place to restyle)
    fonts.css           @font-face rules for the self-hosted fonts (assets/fonts/, woff2, OFL)
    base.css            reset, page shell, the Desk | Report switch
    desk.css            Desk view
    report.css          Report view
    form.css            contact form (used by both views)
    icons.css           icon-only contact links (used by both views)
    avatar-popup.css    one-time avatar pop-up
    avatar-figure.css   the avatar figure (front view head size and run cycle, side view walk cycle)
    timeline-runner.css the running strip above the Report timeline
    section-menu.css    the floating section menu button and its list
  js/
    content.js          all the text and data
    app.js              chooses the view, keeps the address and switch in sync
    desk.js             builds and animates the Desk
    report.js           builds the Report
    icons.js            small SVG icons for Call / WhatsApp / LinkedIn / Instagram links
    contact-form.js     contact form
    avatar-popup.js     one-time avatar pop-up (shown once, remembered in localStorage)
    avatar-figure.js    the avatar as six pictures (head, torso, arms, legs) that can move apart
    timeline-runner.js  the avatar moves along the Report timeline to today
    flags.js            small SVG country flags (Nigeria, UK) shown next to each role
    section-menu.js     the floating, draggable button in the Report that opens a list of sections
    review.js           maintainer-only review notes (pins, Export), fetched only when the address has ?review
```

Moving a Desk note: positions are hand-placed in the `POS` table at the top of `next/js/desk.js` (x, y and tilt for each
note on a 1200px-wide board).

## Review mode

Adding `?review` to the address (for example `next/index.html?review#report`) loads `js/review.js`. After "Add note" is switched on, clicking any element
opens a note dialog and leaves a numbered pin. Notes are stored in the browser's localStorage. The panel offers Add note,
a Notes list that jumps to each pin, Export (copies the notes with page, view, screen width and element), Reset site data
(clears everything except the notes) and Clear all. Without `?review` the file is not loaded.

## Contact form

Messages go through [Web3Forms](https://web3forms.com) to the maintainer's email. The access key in `content.js` is meant
to be public: it can only send mail to the maintainer's own address. The form is only shown while a key is set.

## Hosting and domain

Hosting is GitHub Pages (free). The domains `seyiadesigbin.com` and `oluwaseyiadesigbin.com` are registered with
Cloudflare Registrar, which only holds the names; it does not host the site. DNS records and the redirect from the
second name are set up at the swap, so the old template is never shown on the new domain.

## Checking changes

CI (`.github/workflows/ci.yml`) syntax-checks every script in `next/js/` with `node --check` and checks that the local
files referenced by `next/index.html` exist. There is no type check, unit test or build step. Changes so far have been checked by syntax-checking the JavaScript (`node --check`),
running the logic against stand-in pages in Node, and looking at headless-browser screenshots. Dragging, keyboard
use, phones and screen readers need a person to try them.
