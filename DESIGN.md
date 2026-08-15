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
8. **The reel (signature chapter, replaces the retired word-morph).** THE CUT: eight
   full-bleed frames alternate INT stage against EXT Iceland, each revealed by a wipe
   whose direction flips every cut so the seam sweeps back and forth like an edit being
   made under the reader. Real screenplay sluglines track it (INT. STAGE 1 · GUFUNES /
   EXT. ICE CAVE · DAY ...), a mono counter reads 04 / 08, an ice seam line carries a
   CUT tag, scope bars open at the start and close on the payoff:
   "INT. AND EXT. WITHOUT LEAVING THE COUNTRY." A black beat with a "CUT TO:" cue sits
   before it so the page breathes (the reference earns its chapter with emptiness).
   Why this and not the reference's device: the etymology gag was inert to an
   international buyer and its payoff was a logo the visitor already saw in the nav.
   The cut IS the client's pitch: stages plus the country outside the door.
9. **CTA + footer**: "THE SCRIPT IS READY. NOW IT NEEDS ICELAND." + one-line verified
   incentive fact + single CTA "START A PRODUCTION" (mailto studios@rvkstudios.is,
   arrow-block cap). Footer: EXPLORE / CONNECT / SOCIAL columns, dotted rules,
   email copy-tooltip.

## Motion table — load/entrance
| Element | Effect | Spec |
|---|---|---|
| Slate timecode | 00:00:00:00 → 00:00:04:00 | 4s, CustomEase `spool` (multi-plateau, tape-spool feel), counts real frames at 24fps |
| Slate wordmark | fade up | opacity 0→1, .8s power1.out at t=0.4 |
| Slate location line | fade | opacity 0→1, .8s power1.out at t=0.9 |
| Loader exit | curtain lift | clip-path inset(0 0 0 0) → inset(0 0 100% 0), .9s cubic-bezier(.32,.72,0,1); body scroll released; **hard setTimeout failsafe at 5500ms (1000ms under reduced motion)** |
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
| **The reel (signature)** | scroll cuts INT against EXT | `t = min(1, p/0.62)` keeps every beat inside the pinned window; `pos = t×(N-1)`; current frame holds `inset(0 0 0 0)` + scale 1→1.05; incoming frame wipes via clip-path inset from the **alternating** side + scale 1.06→1; seam line rides the wipe edge and hides outside f∈(.02,.98); slugline + counter switch at f>.5; scope bars scaleY 1→0 at open and →1 at .78; payoff opacity→1 at .66 |
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
