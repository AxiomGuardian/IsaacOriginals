# Browser notes

Four targets, and they disagree about almost everything that matters here:
Safari and Chrome on the Mac, Safari and Chrome on the phone. This is the
running log of what each one does differently and what the site does about it.
Add to it rather than rediscovering any of it twice.

## Sound

**Nothing plays until someone interacts.** Every browser enforces this, but
they draw the line in different places. Chrome will start audio once a video
is already playing on the page. Safari will not: it wants a real press.

The load in is built around that split. The delta clip plays, and underneath
it the site *attempts* the entrance hit and the music. Chrome accepts and the
music is already running before the visitor presses anything. Safari refuses,
the promises reject harmlessly, and the same music starts on the Welcome
press instead.

The entrance hit is deliberately **not** retried on the press. A cinematic cue
that lands after the animation has finished reads as a bug, so Safari simply
does without it.

**iOS ignores `audio.volume`.** Setting it does nothing. Every fade on this
site runs through a Web Audio `GainNode` for that reason. It is not
belt and braces, it is the only thing that works on a phone.

**A user gesture is spent the instant the handler yields.** `play()` must be
called synchronously inside the click handler. Chaining it off
`actx.resume().then(...)` puts it one tick too late and Safari refuses it.
Fire the resume and the play together; await neither.

**Never latch state before playback is confirmed.** An earlier build set a
`started` flag before attempting to play. The speculative attempt under the
video marked the bed as started, Safari refused the audio, and the flag stayed
set, so the Welcome press saw "already started" and did nothing. Music never
came on. A refused attempt has to leave no trace at all or the retry can never
happen.

**A resolved `play()` is not proof of sound.** Once an element is routed
through a `MediaElementSource`, playing into a suspended `AudioContext`
resolves happily and is completely silent. Check `actx.state === 'running'`
before believing it.

**Priming a cue at volume zero is not silent on iOS,** because iOS ignores
`volume` on a media element. Short clicks get away with it. The four second
delta entrance does not, so it is never primed.

**Phone speakers are quieter.** The bed sits at `0.055` on a desktop and
`0.16` on touch hardware. Those are in `assets/js/sound.js`.

**Do not sniff for Safari to detect a phone.** The obvious user agent test
matches desktop Safari too, which once handed a MacBook the phone speaker
gain and made everything three times too loud. Test for real touch hardware:
`matchMedia('(hover: none)')`.

**Background tabs warble.** Switch away and the page's timers get throttled
while the media element keeps buffering. The browser then resamples to catch
up, which sounds like the track speeding up and changing pitch. Both decks
pause and the audio clock suspends while the tab is hidden.

## Navigation

**Links do a full page load, which kills audio.** That is why `nav.js` exists:
same site links fetch the next page and swap the article, so the document
never dies and the music keeps playing.

**`file://` cannot fetch its neighbours.** Opened straight off disk, the soft
navigation falls back to ordinary links and the music restarts on every
click. This is a browser restriction on local files, not a bug. Preview
through a local server and it behaves exactly as it will live.

**Page specific `<style>` blocks do not survive a soft navigation.** Only the
article is swapped, so anything in a page's own head is left behind. The
K.I.T. page lost its entire gold theme this way. All page specific rules now
live in `site.css`. `nav.js` also carries over any stray `<style>` it finds,
but that is a safety net, not a licence to use one.

## Language

Strings live in `assets/i18n/copy.json` and are pulled in by `fetch`, which
means the same `file://` restriction applies: opened straight off disk the
switch hides itself and the page stays in the English written into the markup.
Served properly it works.

Names are deliberately not translated. Omnis Connect, ApexAERA, K.I.T.,
WisdomWatch, K.C.R.M., Nexus and N.I.A. are names, not words.

## Layout and input

**iOS never fires `:hover` from a finger,** and only fires `:active` when a
touch listener exists. The card and button highlight is driven explicitly
with a `.lit` class from `site.js`.

**Do not clear that class on scroll.** iOS rubber bands the instant you touch
down, so a scroll listener wipes the highlight before it is ever visible.
Watch real scroll distance instead.

**`target="_blank"` breaks app handoff on Chrome for iOS.** Instagram, TikTok,
YouTube and X publish universal links that open their app. From a blank tab
Chrome stalls or bounces back. On touch devices the attribute is stripped so
the link is a normal top level navigation.

**Mobile browsers fire `resize` on every URL bar slide.** Reallocating a full
resolution canvas on each one locks the page up. The light streak canvas
ignores height only changes and debounces the rest.

**A CSS `mask` image will not load on a `file://` page in Safari,** and a mask
that fails takes the entire layer down with it. That is why the Phase 2
artwork carries its transparency in the file rather than as a mask.

**A real `<button>` arrives with the browser's own grey fill and its own
font.** Both have to be cleared or a light button on a dark page renders
white text on a near white slab. `.btn` resets them.

## Images

**Hairline artwork dissolves below about 48 pixels.** The delta favicon was
correct at full size and grey mush in the tab. The strokes are thickened
before the downscale, not after.

**Safari caches favicons per host.** `localhost` will happily keep showing an
icon from whatever project last ran on that port. Judge the favicon on the
real domain.
