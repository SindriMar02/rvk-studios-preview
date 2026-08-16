# DESIGN.md — RVK Studios (CA Film Creatives engine transplant)

**Design read:** Redesign-overhaul of a world-class film studio's B2B site. Audience:
international producers, streamers, line producers deciding where to shoot. Language:
dark cinema chrome. The whole page behaves like a production: a slate counts it in,
the hero is the director's reel on a broadcast monitor, scroll racks focus through the
offer, and the finale scrubs their own drone shot frame by frame until it lands on the
RVK mark. Dials: VARIANCE 8 / MOTION 8 / DENSITY 3.

**Committed idea (one sentence to the owner):** Your site becomes a screening room:
everything the visitor does is film grammar, ending on your logo the way your own
brand film does.

## Tokens
- `--bg` #07090B (cold near-black, from their glacial footage; never pure #000)
- `--ink` #E9EDEF (off-white)
- `--mut` #70787D (steel grey, labels/inactive)
- `--ice` #9FD8E8 (single accent, glacier ice pulled from their brand film; used for
  timecode/REC chrome, active indices, links, CTA arrow block. REC dot may be #E8402E
  as true semantic state, one instance, hero only.)
- `--line` rgba(233,237,239,.14) hairlines; dotted rules for footer dividers
- Display: **Tanker** (condensed slab poster, single weight, uppercase, lh .82)
- Body/UI: **Cabinet Grotesk** (regular/medium; justified only in the manifesto column)
- Timecode/meta: ui-monospace stack (SF Mono fallback), tabular numerals
- Bracket chrome: `[ label ]` subtitles + corner-bracket viewfinder frames on media
- Radius: 0 everywhere (film gates are square). Shadows: none; hairlines carry depth.

## Sections (9)
1. **Slate loader**: black, RVK wordmark fades, timecode counts 00:00:00:00 →
   00:00:04:00 at 24fps with plateau ease; hard `setTimeout` failsafe kills it at 5.5s
   even if rAF never ticks. Exits as a curtain lift.
2. **Hero**: full-bleed muted looping reel (their CinemaCon reel cut, Everest segment).
   Headline "DIRECTOR LED. STUDIO BUILT." + `[ Films, stages and locations. Reykjavík. ]`
   Broadcast bar: REC dot, live timecode from video.currentTime, tick-ruler, playhead.
3. **Manifesto**: giant diagonal type "FROM 101 REYKJAVÍK. TO 190 COUNTRIES." over a
   film still; [FILMS][STAGES][LOCATIONS] bracket tags; justified column of their story
   (founded 2012, Baltasar, Gufunes film village).  — final copy sanity: no invented
   numbers; "190 countries" only if verified, else "TO THE WORLD."
4. **Selected work** (3 cases, film-strip thumb rail + corner-bracket plates + center
   crosshair): APEX (poster, "NETFLIX · 24 APR 2026"), TRAPPED (clip, "PRIX EUROPA
   2016"), EVEREST (clip, "UNIVERSAL · 2015"). Lazy-load clips via ScrollTrigger.
5. **Focus pull — the offer** (scrub-active blur list): [ A ] STAGES, [ B ] LOCATIONS,
   [ C ] SERVICES, [ D ] THE VILLAGE. Stage-letter plates are honest film vernacular.
   Inactive: blur(6px), opacity .68, steel; active: sharp white + ice letter.
6. **By the numbers** (staggered columns, thin rules): 3 sound stages · 6,500 m² studio
   floor · est. 2012 · 25–35% reimbursement. All verified 2026-08-15.
7. **Filmography scrub**: center list of 6 titles (Apex, King and Conqueror, Touch,
   Beast, Against the Ice, Katla) scrub-activated; their REAL posters crossfade in two
   corner-bracket plates flanking the list. Tail line links the full 30-title slate.
8. **The rail (signature).** A black beat with a "CUT TO:" cue, then a pinned full-bleed
   stage: the film gate (3-rect SVG curtain) opens on darkness, an establishing plate is
   revealed, and the reader travels horizontally through eight INT/EXT cards, each with a
   real slugline, a one-line fact and 0N/08. The title panel counter-translates so it sits
   still while the strip moves. Mid-rail the plate behind wipes away to a third plate and
   the overlay darkens to .4. It closes on a full-width statement: "Three stages in
   Gufunes. EVERYTHING ELSE IS OUTSIDE THE DOOR." Mechanic transplanted from
   `obyggdasetur/app.js`, not approximated.
9. **CTA + footer**: "THE SCRIPT IS READY. NOW IT NEEDS ICELAND." + one-line verified
   incentive fact + single CTA "START A PRODUCTION" (mailto studios@rvkstudios.is,
   arrow-block cap). Footer: EXPLORE / CONNECT / SOCIAL columns, dotted rules,
   email copy-tooltip.

## Motion table — load/entrance
| Element | Effect | Spec |
|---|---|---|
| Slate timecode | 00:00:00:00 → 00:00:04:00 | 4s, CustomEase `spool` (multi-plateau, tape-spool feel), counts real frames at 24fps |
| Loader picture | their own logo sting | `M.1-rvk-studio-logo-24fps` cut to 4.3s, the mark forming out of fabric; muted, autoplay, poster fallback |
| Film gate | two blades part | height 50.2%→0%, 1.1s expo.out; meta + progress rule fade in at t=0.45 |
| Progress rule | fills with the counter | width 0→100% driven by the same 4s spool tween |
| Loader exit | shutter, then open on the hero | blades close 50.2% in .26s power2.in → slate removed → blades open 0% in .85s expo.out; **hard setTimeout failsafe at 5600ms (900ms reduced motion)** |
| Hero headline | per-char slide-in | chars (inside nowrap word wrappers): opacity 0→1, x 24%→0, scale 1.1→1, .35s, stagger .045, power1.out |
| Hero sub + deck | fade up | opacity 0→1, .7s, stagger .12, power2.out, delay .55 |
| Reduced motion | `html.no-motion` renders every entrance at its final state; loader exits at 1s |

## Motion table — scroll/idle
| Element | Effect | Spec |
|---|---|---|
| Lenis | glide | duration **2.4**, mouseMultiplier **0.5**, expo-out easing (matched to the reference) |
| Hero stage | sticky hand-off | `.hero{position:sticky;top:0}`; scrubbed over its own height: dim 0→.72, video scale 1→1.14, copy y 0→-90 + opacity 1→0, deck opacity→0 at .35. The manifesto is **transparent**, so its type flows over the still-playing reel; that section's own gradient closes to black by 46% and retires the stage |
| Display headings | per-char blur reveal | blur 8px→0, opacity .35→1, stagger .04, power2.out, trigger top 82% |
| Case rails | vertical drift | yPercent ±34, direction alternating per row, scrubbed across each rail's viewport pass |
| Case clips | lazy + viewport play | armed once at top 150%; play on enter (top 85% / bottom 10%), pause on leave |
| Partner marquee | infinite ticker | x → -setWidth, 36s linear, repeat -1 (one marquee on the page) |
| Focus pull (offer) | scrub active index | activeIdx = floor(progress × 4); inactive blur(6px)/opacity .68/steel → active sharp/white; ice [0N] index and the mix-blend-difference line fade .35s |
| Filmography | scrub active + poster crossfade | same activeIdx over 6 titles; poster plates crossfade .38s inside corner brackets |
| **The rail (signature)** | pinned horizontal travel | pin length = 1.5·vh (title) + 1·vh (curtain) + 1.5·L where L = scrollWidth − vw. Title font grown→settled over 0.5·sText; 3 curtain rects → width 0 at 0.5/0.75/1.0·sCurtain from t=0.5·sText; travel starts at +0.3·sCurtain: container x→−L while the title wrap counter-translates x→+L; at +0.35·sX the behind plate clips `inset(0 100% 0 0)` and the overlay goes 0→.4 over 0.45·sX; title hands off (autoAlpha 0) at +0.8·sX desktop, +0.06·sX on narrow screens where a card would cover it. Rebuilt on debounced resize. |
| Argument paragraph | word-by-word reveal | opacity .14→1, stagger .6, scrubbed top 78% → bottom 45% |
| CTA arrow block | hover | cap translate(2px,-2px) + brightness 1.08, 260ms cubic-bezier(.32,.72,0,1); :active scale .98 |
| Footer email | copy tooltip | "copied" fades in, auto-hides after 2.4s |
| Reduced motion | reel renders its final frame + payoff, marquees stop, blur list all-sharp, hero dim 0, scope bars open |

## Anti-slop gates honored
No em-dashes anywhere. No "Scroll to explore" (banned; broadcast bar is the cue).
Eyebrow count ≤ 3 across 9 sections (hero bracket sub, one on numbers, one on CTA).
No section numbers except stage letters (real vernacular). One marquee only (film-strip
rail). One accent. No pure black. Buttons one-line, AA contrast. Justified text only in
the manifesto column with hyphens off at mobile (switches to left-align <768px).
Loader + reveals all have failsafes so content can never stay hidden.
