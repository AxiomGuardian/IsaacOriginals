# Isaac Originals · Master Protocol

*Honest documentation of the grind, under Christ.*
Version 1.0 — April 2026

> **Purpose of this document.** This is the single source of truth for the
> IsaacOriginals brand and website. Drop it into any new chat and the assistant
> on the other side will have full context on who I am, what's built, where the
> files live, and what's next.

---

## 1. Who I am

- **Name:** Isaac
- **Age:** 22
- **Location:** Phoenix, Arizona
- **Faith:** Follower of Jesus. Kingdom-first.
- **Human Design:** Emotional Manifestor 4/6
- **Email (brand):** isaac@isaacoriginals.com (placeholder used on the site)
- **Cameras:** Sony FX30 + iPhone (for journal footage)

### Ventures
- **Apex** — AI agency. Real systems for real businesses. Built with integrity.
  Pays the bills, sharpens the craft, funds Kingdom work downstream.
- **K.I.T. — Kingdom Initiative Technologies** — long-game vision. Software and
  tools to disciple, equip, and connect the Church. Currently in the listening
  phase, not the launch phase.
- **Isaac Originals** — content brand and personal site. Transparent
  documentation of the journey of obeying Christ while building.

---

## 2. Brand rules (non-negotiable)

These are not preferences. They are filters. If a deliverable doesn't pass them,
it doesn't ship.

- **Kingdom-first.** Christ alone is the foundation. Matthew 6:33. Not a
  decorative theme — the actual operating system.
- **Radical honesty and transparency.** No performance, no highlight reels, no
  fake positivity, no motivational fluff.
- **Tone.** Direct, grounded, masculine. Honest about struggles without
  wallowing. Hopeful and obedient, never preachy, never salesy.
- **Visuals.** Dark cinematic. Deep charcoal/black backgrounds. Subtle warm
  earth / golden accents inspired by Arizona desert sunrise. High contrast,
  minimalist, clean.
- **Logo.** Triangular "A" arrow / peak mark rendered in white. Two nested
  chevrons.
- **Type.** Space Grotesk throughout. Bold/strong for headlines, regular for
  body.
- **Off-limits.** Clout-chasing, trend-chasing, luxury flexing, ego, hustle
  theater, motivational fluff, fake positivity.

### Color tokens (use these exact values)
| Token        | Hex       | Use                                            |
|--------------|-----------|------------------------------------------------|
| `bg`         | `#0F0F0F` | Page background                                |
| `bg-soft`    | `#151515` | Card / surface                                 |
| `bg-line`    | `#2A2723` | Borders, dividers                              |
| `ink`        | `#F5F1EA` | Primary text (warm off-white)                  |
| `ink-muted`  | `#8A847A` | Secondary text                                 |
| `gold`       | `#D4A24C` | Accents, eyebrows, hover state                 |
| `gold-deep`  | `#A6763C` | Deeper variant                                 |
| `gold-ember` | `#E8B56A` | Brighter ember variant                         |

### Content pillars
1. Founder discipline & daily rhythm
2. Transparent journey updates (detox, supplements, wins, struggles)
3. Kingdom-first business building (Apex + K.I.T.)
4. Masculine stewardship (faith, rest, overcoming distraction / lust / alcohol)
5. Behind-the-scenes of building real tools

---

## 3. What's been built

### IsaacOriginals.com — 7-page static site
A production-ready, mobile-first, dark-by-default site documenting the journey.

**Tech stack:**
- Plain HTML across 7 pages (no framework)
- Tailwind CSS — currently via CDN with custom theme inlined per page; optional
  local Tailwind build is set up in `tailwind.config.js` + `package.json` for
  later
- Vanilla JS (no Alpine, no React) — mobile menu, active-nav highlight,
  reveal-on-scroll, year stamp
- Google Fonts: Space Grotesk (300, 400, 500, 600, 700)

### Pages (in order)
| Page                | File             | Purpose                                                              |
|---------------------|------------------|----------------------------------------------------------------------|
| Home                | `index.html`     | Cinematic hero, mission status cards, latest journal teaser, work cards (Apex / K.I.T.), the Why |
| The Journey         | `journey.html`   | Honest dated timeline (Win / Struggle / Build / Faith tags)          |
| Apex                | `apex.html`      | What it is, what we build, current client status, contact            |
| K.I.T.              | `kit.html`       | Vision, three directions, hard guardrails, prayer CTA                |
| Journal             | `journal.html`   | Raw chronological feed of dated entries, video slots, copy-this `<article>` pattern at top of feed |
| The Rules           | `rules.html`     | Rule 0 (Christ as foundation) → Rule 4 (when I break a rule). Daily schedule, no-list, stewardship grid |
| About               | `about.html`     | Short, grounded blurb, quick-facts table, contact card               |

### File tree
```
IsaacOriginals/
├── index.html              Home
├── journey.html            The Journey
├── apex.html               Apex
├── kit.html                K.I.T.
├── journal.html            Journal feed
├── rules.html              The Rules
├── about.html              About
│
├── README.md               Run / deploy / brand-token reference
├── MASTER_PROTOCOL.md      ← this file
├── setup.command           Double-clickable: copies site into ~/Documents/IsaacOriginals/Website/
│
├── package.json            Optional npm scripts (only used if moving off Tailwind CDN)
├── tailwind.config.js      Theme tokens + content paths (used when local-building Tailwind)
├── src/input.css           Tailwind source (only used for local build)
│
└── assets/
    ├── css/styles.css      Brand tokens + custom utilities (hero glow, grain, reveal, video placeholder)
    ├── js/main.js          Mobile menu, active-nav highlight, reveal-on-scroll, year stamp
    └── images/
        ├── favicon.svg     White triangular peak mark on black
        └── README.md       Where to drop logos / hero photo / OG card / journal media
```

### Shared markup pattern
Every page uses the same `<header>` (sticky nav with logo + 7 links + mobile
menu) and `<footer>` ("Built in obedience." + Matthew 6:33). The `<head>`
inlines Tailwind CDN + a `tailwind.config = { ... }` block with the brand
tokens.

If brand colors or type ever change, **update both** the inline config in each
page AND `tailwind.config.js`.

---

## 4. Where the files live (current state)

- **Working copy (Cowork mount):** the folder you connected to Cowork at the
  start of the build session. Contains everything listed in the file tree.
- **Target on disk:** `~/Documents/IsaacOriginals/Website/`
  - Note: the existing `~/Documents/` folder was misspelled `IsaacOrignals`
    (missing an "i"). The included `setup.command` script renames it before
    copying — only if the typo'd folder exists and the correctly-spelled one
    doesn't.
- **The setup script** (`setup.command`) does three things when right-clicked →
  Open in Finder:
  1. Renames `IsaacOrignals` → `IsaacOriginals` if needed
  2. Creates `~/Documents/IsaacOriginals/Website/`
  3. Copies all site files into it (excludes itself, `.DS_Store`, `.git`)
- It is **a copy, not a move** — the Cowork source folder remains untouched.

---

## 5. How to run / deploy

### Run locally
```bash
cd ~/Documents/IsaacOriginals/Website
python3 -m http.server 5173
```
Open <http://localhost:5173>.

### Deploy options
| Method        | Steps                                                                 |
|---------------|-----------------------------------------------------------------------|
| Netlify Drop  | Drag the `Website/` folder onto <https://app.netlify.com/drop>. Done.|
| Vercel        | Push to GitHub → Vercel → Import. Build command: blank. Output: `./`.|
| GitHub Pages  | Push to GitHub → Settings → Pages → Source: `main`, folder `/`.       |

### Optional production Tailwind build
1. `npm install`
2. `npm run build` (writes `assets/css/tailwind.css`)
3. In every `.html`: remove the CDN `<script>` and inline `tailwind.config`
   block; add `<link rel="stylesheet" href="/assets/css/tailwind.css">`.
4. Use `npm run dev` while editing.

---

## 6. Editing conventions

- **Mission Status cards** on `index.html` — update weekly/daily. Section
  comment: `MISSION STATUS`.
- **Latest Journal teaser** on `index.html` — swap copy + video placeholder.
  Section comment: `LATEST JOURNAL`.
- **Journal entries** — newest at the top. Copy the `<article>` pattern at the
  top of `journal.html`. Tags in use: `Build`, `Struggle`, `Word`, `Body`,
  `Wins`, `Reset`. Nothing gets deleted — even bad days stay on record.
- **Timeline** — same `<article>` pattern in `journey.html`. Tags: `Win`,
  `Struggle`, `Build`, `Faith`, `Origin`, `Reset`.
- **The Rules** — a living doc. Update as the Lord clarifies. Don't hide changes.
- **Logo swap** — the inline `<svg>` in each page's nav is a placeholder. To use
  the real 1.0 lockup, drop `logo-light.png` into `/assets/images/` and replace
  the `<svg>` block with `<img src="/assets/images/logo-light.png" alt="Isaac
  Originals" class="h-6 w-auto">` in every page header.
- **Hero media** — `index.html` has a `<div class="photo-placeholder">` waiting
  for a real image or looping video. Comment block above it shows both swap
  patterns.

---

## 7. Open items / next moves

- [ ] Run `setup.command` to land files in `~/Documents/IsaacOriginals/Website/`
- [ ] Replace inline triangular `<svg>` mark with the real 1.0 logo PNG/SVG
- [ ] Drop a hero photo (`assets/images/hero.jpg`) — sunrise, desk, gym, or
      desert; dark mood, 2400×1600+
- [ ] Create OG share card (`assets/images/og.jpg`, 1200×630)
- [ ] Replace placeholder email (`isaac@isaacoriginals.com`) if a different
      address is preferred
- [ ] First real Journal entry (replace seeded entries; keep them only if they
      reflect real days)
- [ ] First real Journey timeline pass (same — replace seeded entries with what
      actually happened)
- [ ] Choose hosting: Netlify Drop for fastest path, Vercel + GitHub for
      long-term workflow
- [ ] Point `isaacoriginals.com` DNS at the host
- [ ] Decide: keep Tailwind CDN (fine for now) vs. switch to local build

---

## 8. Continuation prompt — paste this into the new chat

> I'm Isaac. I'm continuing work on **IsaacOriginals.com** — a Kingdom-first,
> dark-cinematic personal site documenting my journey of building Apex (AI
> agency) and K.I.T. (Kingdom Initiative Technologies) under Christ.
>
> Attached / pasted above is my **Master Protocol** — read it first. It contains
> my brand rules, the site's tech stack and file tree, all editing
> conventions, and the open items list.
>
> Critical rules to honor without exception:
> - Kingdom-first (Matthew 6:33).
> - Radical honesty, direct/grounded/masculine tone, no performance.
> - Dark cinematic visuals, Space Grotesk, the exact color tokens listed.
> - No clout, no trends, no luxury flexing, no hustle theater.
>
> The codebase lives at `~/Documents/IsaacOriginals/Website/` on my Mac. Plain
> HTML + Tailwind (CDN currently) + a little vanilla JS. Seven pages.
>
> Today I want to: **[describe your next task in one sentence here]**.

---

## 9. Brand voice cheat sheet (for any future copy)

**Yes:**
- "Obedience isn't a vibe. It's showing up when the fuel tank reads empty."
- "Real systems for real businesses. No snake oil, no vaporware."
- "Skill is stewardship."
- "Built in obedience."
- "Repentance, not performance."

**No:**
- "Unleash your potential."
- "Crush it."
- "Level up your life."
- "Game-changer / disruptive / paradigm shift."
- Any sentence that would feel at home on a LinkedIn carousel.

---

*Built in obedience.*
*Matthew 6:33 — Seek first the Kingdom.*
