# /assets/images — where to drop your real media

Keep this folder lightweight. Compress before committing.

## Required / expected files

| Filename         | Used on              | Notes                                                        |
|------------------|----------------------|--------------------------------------------------------------|
| `favicon.svg`    | every page           | Already here. Replace if you want the full logo lockup.      |
| `hero.jpg`       | `index.html`         | Full-bleed hero. 2400×1600+ recommended. Dark mood.          |
| `og.jpg`         | social share cards   | 1200×630. Branded, dark, Space Grotesk title.                |
| `logo-light.png` | optional             | Full lockup for light backgrounds (1.0 watermark style).     |
| `logo-dark.png`  | optional             | Full lockup for dark backgrounds.                            |

## Swapping the hero image

Open `index.html` and find this block:

```html
<!-- Drop the hero image here when ready: -->
<!-- <img src="/assets/images/hero.jpg" alt="" class="w-full h-full object-cover opacity-60"/> -->
<div class="photo-placeholder w-full h-full"></div>
```

Uncomment the `<img>` line and delete the `<div class="photo-placeholder">`.
You can also drop a looping video here instead:

```html
<video class="w-full h-full object-cover opacity-60" autoplay muted loop playsinline>
  <source src="/assets/video/hero.mp4" type="video/mp4">
</video>
```

## Using the brand logo mark

The site currently uses an inline SVG approximation of the triangular "A"
peak mark. If you want to use your actual 1.0 logo files, place them here
and replace the inline `<svg>` in the header of each page with:

```html
<img src="/assets/images/logo-light.png" alt="Isaac Originals" class="h-6 w-auto">
```

## Journal videos / photos

Put per-entry media in subfolders by date to keep this tidy:

```
/assets/images/journal/2026-04-19/cover.jpg
/assets/video/journal/2026-04-19/day-12.mp4
```

Then reference them from the corresponding `<article>` block in
`journal.html`. See the comment block at the top of that file's feed
for the entry pattern.
