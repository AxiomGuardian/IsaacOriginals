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

Track one fades into track two, two into three, three back into one, six
seconds of overlap each time. There are two audio decks for exactly this: one
plays out while the next comes up underneath it, and they trade places on
every handover. Dead silence at each end is trimmed off and all three are
matched to the same loudness so none of them jumps out. Roughly seven minutes
total, about 1.4 MB per track, and only the track being listened to is ever
downloaded.

Page changes do not interrupt any of it. Links inside the site fetch the next
page and swap the article, so the document never reloads and the bed simply
keeps going. That lives in `assets/js/nav.js`. If the fetch fails, the browser
navigates normally and the music restarts, which is what happens when the
pages are opened straight off disk rather than served.

The old Hyperion track from the previous site is not used here at all.

## What was removed

There is no hover sound. Sweeping a cursor across the four venture cards fired
it four times in a row, which read as noise rather than texture.

## Levels

Cues sit around a quarter of full scale. The bed sits at 0.055 on a desktop
and 0.16 on a phone, since phone speakers are quieter. If it is ever noticeable
as music, it is too loud; those numbers live at the top of `assets/js/sound.js`.

## The load in

`assets/js/loader.js` holds a black curtain over the page while the delta
plays, then fades up a Welcome button. Pressing it drops the curtain, fires
`delta-entrance.mp3` and starts the music. That press is doing real work:
browsers refuse to make any sound until someone interacts with the page, so
it is the only moment the bed is allowed to begin. Once per session; a reload
inside the same session skips straight past it.

## Background tabs

Switching away throttles the page's timers while the audio element keeps
buffering, and the browser then resamples to catch up. That is what the pitch
and tempo warble was. Both decks now pause and the audio clock suspends while
the tab is hidden, and everything fades back up on return.

## How it behaves

Browsers refuse audio until someone interacts, so nothing plays until Welcome
is pressed. After that the choice is remembered for the session and the bed
carries its track and playhead across pages instead of restarting on every one.
The toggle sits at the right end of the nav: a dim dot when off, a lit dot with
expanding rings when on. On the first visit of a session the word MUSIC types
itself in beside it, holds, then types itself back out, so the dot reads as a
control rather than a decoration. Pressing it types MUSIC ON or MUSIC OFF the
same way. Reduced motion skips the typing and turns the bed off entirely.

## Sounds still unused

`UI Sound/` holds a startup set, a deeper drone and a binary interface loop.
Nothing on the site calls for them yet.
