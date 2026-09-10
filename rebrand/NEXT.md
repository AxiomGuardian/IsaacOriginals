# Where this stands

The rebrand is finished as a build and lives in this folder. It has not
replaced the live site yet. Nothing in here is wired to isaacoriginals.com.

## Open, in the order it matters

**1. The About page body.** Still not right. Paragraphs two and three have been
through four passes and the last version reads better but is not settled. The
structure Isaac wants is fixed and correct: identity, problem, solution, then
"Christ settles the identity. Everything after that is obedience and
execution." That closing line is his own and stays. The two middle paragraphs
are what needs another look. The trap they keep falling into is sounding like
a consultant explaining a market rather than a builder describing what he sees.

**2. Publish.** Swapping the rebrand in for the live site. Worth deciding
before the swap:

- The live root still holds the old index, journey, about, kit, apex, journal
  and rules pages. Decide what gets replaced, what gets kept at its old URL,
  and what should redirect.
- `/connect` and `/social` stay exactly as they are. They are live, they are
  on the printed cards, and the rebrand does not touch them.
- `vercel.json` will need the audio and video folders considered for caching,
  and the old page routes considered for redirects.
- Open the site fresh in a private window afterwards. The load in only plays
  once per session, so an existing tab will skip it.

**3. The mobile pass.** Deferred on purpose from the beginning. Everything so
far was built and judged at desktop width. The phone layout has never been
reviewed.

## Held out, not deleted

The About page used to carry a paragraph that is worth finding a home for:

> There was a long stretch of chasing whatever looks impressive from the
> outside. Some of it worked. None of it filled what it promised to fill. That
> part is worth handing to somebody else, because it saves years: the win you
> are counting on to change how you feel is not going to change how you feel.

It was displaced when paragraph three became the solution. It is the only
passage on the site that hands Isaac's own experience to the reader as
something they can use, which is the whole voice he has been aiming at. It may
belong on Journey rather than About.

## Ideas raised and not started

- A client work page. Agreed it belongs under Business rather than Personal,
  and that it needs three strong entries before it earns its own page. Named
  permission and a written quote come before publishing anyone.
- A Delta entrance sound exists for a load screen that now exists, but the
  startup set, the drone and the binary interface loop in `UI Sound/` are
  still unused.

## Read these first

- `SOUND.md` for what plays where and why.
- `BROWSERS.md` for every Safari, Chrome, desktop and phone difference this
  build ran into. That file exists so none of it gets rediscovered.
