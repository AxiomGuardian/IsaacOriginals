# isaacoriginals.com

This folder is the website. Vercel deploys whatever is in it, so every file
here is public the moment it is pushed. Keep working material out of it.

## What is what

- `index.html`, `about.html`, `journey.html`, `kit.html` — the live site
- `connect.html`, `social.html` — the link pages on the printed cards
- `assets/` — the css, js, images, audio and video the site loads
- `old-website-v1/` — the original site, archived and frozen. Not linked,
  not indexed, reachable at /old-website-v1/. See its own README.
- `vercel.json` — routing, redirects and cache rules
- `docs/` — build notes. Excluded from the deploy by .vercelignore.

## Where everything else went

Photos, raw audio, screenshots and the master protocol are in
`Projects/IsaacOriginals - Working Files`. They used to sit in this folder,
which meant they were downloadable from the live domain.

The Command Center dashboard is its own project in `Projects/IO-Command-Center`.

## Publishing

Committing changes nothing on its own. The site updates when you run:

    git push origin main

Vercel builds within about a minute of the push.
