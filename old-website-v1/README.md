# Version One — archived

The original isaacoriginals.com, frozen on the day the rebrand went live
(September 2026). Kept whole so nothing is lost, not maintained.

Live at `/old-website-v1/` — for example `https://isaacoriginals.com/old-website-v1/index.html`.
Marked `noindex` in vercel.json so it does not compete with the real site
in search results, and not linked from anywhere.

## How it is wired

These pages share the root `/assets/` tree, which still holds every file
the old site used. Four files were replaced at the root when the rebrand
was promoted, so the archive carries its own copies and points at them:

- `v1/assets/js/i18n.js`
- `v1/assets/images/favicon-32.png`
- `v1/assets/images/favicon-192.png`
- `v1/assets/images/apple-touch-icon.png`

Everything else — `styles.css`, `main.js`, `spa.js`, `ambient.js`,
`sounds.js`, `particles.js`, the old images, videos and audio — is loaded
from `/assets/` and shared with the current site.

Retired routes redirect here: `/apex`, `/journal`, `/rules`.

Two pages were already broken before the archive was made and were left
that way: `journal.html` and `rules.html` reference `favicon.svg` and
`assets/video/day-12.mp4`, neither of which was ever committed.

## If the old assets are ever cleaned up

Deleting anything under `/assets/` that only the old site used will break
this archive. Move it into `v1/assets/` and repoint the paths instead.
