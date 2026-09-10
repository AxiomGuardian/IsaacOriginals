# Sound map

Which file plays where. Recovered from the old site's `assets/js/sounds.js`
and written down here so it stays found.

| Sound | File | Fires on |
|---|---|---|
| Tab | `tab-selection.mp3` | Nav links, footer link |
| Tactile | `tactile-cta.mp3` | Every `.btn` that is not a contact button |
| Missions | `two-missions.mp3` | Venture cards and K.I.T. tool cards, on press |
| Contact | `get-in-touch.mp3` | Anything marked `data-sound="contact"` |
| Bed | `bed-1.mp3`, `bed-2.mp3`, `bed-3.mp3` | Background, nav toggle |

## The bed

The three tracks from the Website Rebrand folder, in this order:

1. Solemn Sci-Fi Atmosphere
2. Sci-Fi Dramatic
3. Modern Sci-Fi Trailer

They play straight through, one after another, then round again. Dead silence
at each end is trimmed off, all three are matched to the same loudness so none
of them jumps out, and only the track currently playing is ever downloaded.
Nothing is crossfaded into anything else. Roughly seven minutes total, about
1.4 MB per track.

The old Hyperion track from the previous site is not used here at all.

## What was removed

There is no hover sound. Sweeping a cursor across the four venture cards fired
it four times in a row, which read as noise rather than texture.

## Levels

Cues sit around a quarter of full scale. The bed sits at 0.055 on a desktop
and 0.16 on a phone, since phone speakers are quieter. If it is ever noticeable
as music, it is too loud; those numbers live at the top of `assets/js/sound.js`.

## How it behaves

Browsers refuse audio until someone interacts, so nothing plays until the first
click or tap. After that the choice is remembered for the session and the bed
carries its track and playhead across pages instead of restarting on every one.
The toggle sits at the right end of the nav: a dim dot when off, a lit dot with
expanding rings when on. Reduced motion turns the bed off entirely.

## Sounds still unused

`UI Sound/` holds a Delta load-in set, a startup set, a deeper drone and a
binary interface loop. The rebrand has no load screen yet, so the Delta
entrance has nowhere to fire. If a load-in gets built, that is where it goes.
