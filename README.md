# Isaac Originals — IsaacOriginals.com

> Seeking first the Kingdom. Documenting the real grind.

Static, Kingdom-first site. Plain HTML + Tailwind + a little vanilla JS.
Fast, mobile-first, dark by default, zero backend.

---

## What's in here

```
/
├── index.html         Home — hero, mission status, latest journal, the work, the why
├── journey.html       The Journey — honest timeline
├── apex.html          Apex — the AI agency
├── kit.html           K.I.T. — Kingdom Initiative Technologies
├── journal.html       Journal — raw chronological feed
├── rules.html         The Rules — non-negotiables
├── about.html         About — who I am, why I document
│
├── assets/
│   ├── css/styles.css   Brand tokens + custom utilities layered on Tailwind
│   ├── js/main.js       Mobile menu, active-nav highlight, reveal-on-scroll
│   └── images/          (drop logos, hero photos, OG card here — see README inside)
│
├── src/input.css        Tailwind source (only used if you move off the CDN)
├── tailwind.config.js   Config for the optional local build
└── package.json         Optional build scripts
```

## Run it locally

The site is a pile of static files. Any static server works.

**No install needed — pick one:**

```bash
# Option 1: Python (already on macOS/Linux)
python3 -m http.server 5173

# Option 2: Node / npm (no install beyond Node)
npx http-server . -p 5173 -c-1 -o

# Option 3: VS Code — right-click index.html → "Open with Live Server"
```

Then visit <http://localhost:5173>.

> Tailwind currently loads from the CDN inside each HTML file, so nothing has to
> be installed. You can start writing content immediately.

## Deploy

### Vercel

1. Push the folder to a GitHub repo (e.g. `isaacoriginals/site`).
2. Go to <https://vercel.com/new>, import the repo.
3. **Framework preset:** Other. **Build command:** leave blank. **Output dir:** `./`.
4. Deploy. Point your domain (`isaacoriginals.com`) at it in Vercel → Domains.

### Netlify

1. Drag-and-drop the folder at <https://app.netlify.com/drop>, *or* connect the GitHub repo.
2. **Build command:** leave blank. **Publish directory:** `./`.
3. Deploy. Add your domain under Site settings → Domain management.

### GitHub Pages

1. Commit to a repo.
2. Settings → Pages → Source: `main` branch, folder `/`.
3. Done.

## Production build (optional — drop the CDN)

The CDN is fine for a site this size, but if you want a smaller CSS bundle and
faster first paint:

```bash
npm install           # installs tailwindcss locally
npm run build         # writes ./assets/css/tailwind.css (minified)
```

Then in every `.html` file:

- Remove the `<script src="https://cdn.tailwindcss.com"></script>` tag
- Remove the `<script>tailwind.config = { ... }</script>` block
- Add: `<link rel="stylesheet" href="/assets/css/tailwind.css">` above `styles.css`

Use `npm run dev` while editing — it rebuilds on save.

## Updating content

Every file has inline comments marking what to edit. Common spots:

- **Mission Status cards** on `index.html` — update weekly/daily (section: `MISSION STATUS`)
- **Latest Journal** teaser on `index.html` — swap copy + video (section: `LATEST JOURNAL`)
- **Journal feed** — copy the `<article>` pattern at the top of `journal.html`, newest on top
- **Timeline** — add entries to `journey.html` using the same `<article>` pattern
- **The Rules** — live doc. Update as the Lord clarifies things.

## Brand tokens

All colors + type live in two places, kept in sync:

- `tailwind.config.js` → `theme.extend.colors` / `fontFamily`
- The inline `tailwind.config = { ... }` block at the top of each HTML file

If you change a brand color, update both. Custom CSS variables (for hand-written
styles in `styles.css`) live in the `:root { ... }` block at the top of that file.

## Rules this site lives by

- Kingdom-first. Christ alone is the foundation.
- Radical honesty. No performance, no highlight reels, no motivational fluff.
- Direct, grounded, masculine tone. Hopeful, never preachy.
- Dark cinematic, warm-gold desert accents, Space Grotesk throughout.
- No clout chasing, trend chasing, luxury flexing, or ego.

If a new page, section, or line of copy doesn't pass those filters, don't ship it.

---

Built in obedience.
Matthew 6:33 — *Seek first the Kingdom.*
