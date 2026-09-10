# Sound map

Which file plays where. This was reverse engineered out of the old site's
`assets/js/sounds.js`, so it is written down here to stay found.

| Sound | File | Fires on |
|---|---|---|
| Tab | `tab-selection.mp3` | Nav links, footer link |
| Tactile | `tactile-cta.mp3` | Every `.btn` that is not a contact button |
| Missions | `two-missions.mp3` | Venture cards and K.I.T. tool cards, on press |
| Hover | `hover-over.mp3` | Card hover, pointer devices only |
| Contact | `get-in-touch.mp3` | Anything marked `data-sound="contact"` |
| Bed | `ambient.mp3` | Background, nav toggle |

Same five cues as the original site, same jobs. Two changes:

- `hover-over.mp3` was 4 seconds. Moving across a four card grid stacked four
  of those on top of each other, so it is trimmed to 1.3 with a fade.
- The bed is `Solemn Sci-Fi Atmosphere` from the Website Rebrand folder, cut
  down to its steady middle and crossfaded end to end, so it loops with no
  seam and no swell under reading. 106 seconds, 1.2 MB, down from the old
  11.7 MB Hyperion track.

## How it behaves

Browsers refuse audio until someone interacts, so nothing plays until the
first click or tap. After that the choice is remembered for the session and
the bed carries its playhead across pages instead of restarting on every one.
The toggle sits at the right end of the nav: a dim dot when off, a lit dot
with expanding rings when on. Reduced motion turns the bed off entirely.

## Sounds still unused

In `UI Sound/` there is a Delta load-in set, a startup set, a deeper drone,
and a binary interface loop. The rebrand has no load screen yet, so the Delta
entrance has nowhere to fire. If a load-in gets built, that is where it goes.
