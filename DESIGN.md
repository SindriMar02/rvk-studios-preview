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
8. **The signature chapter** (tall scroll): giant lowercase "mynd." (Cabinet Grotesk,
   the ONLY lowercase display moment) gains ice-colored "kvik" mid-scroll → "kvikmynd."
   with the gloss "kvik: living. mynd: image. The Icelandic word for film is the living
   image." Beneath it the canvas scrubs their drone brand film (142 frames, 2.39:1)
   descending onto the stitched RVK mark. Corner statements drift in/out.
9. **CTA + footer**: "THE SCRIPT IS READY. NOW IT NEEDS ICELAND." + one-line verified
   incentive fact + single CTA "START A PRODUCTION" (mailto studios@rvkstudios.is,
   arrow-block cap). Footer: EXPLORE / CONNECT / SOCIAL columns, dotted rules,
   email copy-tooltip.

## Motion table — load/entrance
| Element | Effect | Spec |
|---|---|---|
| Slate timecode | 00:00:00:00→00:00:04:00 | 4s, CustomEase multi-plateau (spool feel), counts frames at 24fps |
| Wordmark | fade + letterspace settle | opacity 0→1 .8s, tracking .5em→.34em, power2.out |
| Loader exit | curtain lift | clip-path inset(0 0 0 0)→inset(0 0 100% 0) .9s expo.inOut; body scroll unlocked after; **failsafe setTimeout(5500) forces exit** |
| Hero headline | per-line rise | SplitText-free: two .line spans, y 110%→0, .9s, stagger .12, expo.out, starts at loader exit |
| Hero bracket sub + bar | fade up | y 16→0 opacity 0→1 .7s, delay .35 |
| Reduced motion | all entrances render final state instantly; loader shows one static slate frame then exits at 1s |

## Motion table — scroll/idle
| Element | Effect | Spec |
|---|---|---|
| Lenis | glide | duration 1.6 (calmer than CA's 2.4 to respect INP), mouseMultiplier .7, touch native |
| Broadcast bar | live timecode + playhead | rAF synced to video.currentTime; frames = floor(t*24)%24; playhead left = t/duration*100% on tick-ruler (repeating-linear-gradient) |
| h2 display headings | char blur-reveal | chars via manual split, blur 8px→0 + opacity .35→1, stagger .04, power2.out, trigger top 80% |
| Focus-pull list | scrub active index | one ScrollTrigger scrub over block; activeIdx=floor(progress*4); inactive blur(6px)/.68/steel, active none/1/white; ice stage letter opacity flips |
| Filmography | scrub active + poster crossfade | same activeIdx pattern; poster plates opacity .35s crossfade, corner brackets static |
| Case clips | lazy + hover | load at top 150% once; play on enter viewport, pause on leave |
| Film-strip rail | vertical marquee | gsap yPercent -50 linear repeat -1, 26s, pauses under reduced motion |
| Canvas scrub | frame sequence | 142 desktop / 107 mobile webp; preload on approach (top 120%); scrub maps progress→index; DPR-aware, cover-crop; redraw only on index change |
| mynd→kvikmynd | width tween | "kvik" span width 0→auto (measured), opacity 0→1, ice; scrubbed over chapter middle; both renderings share identical markup to avoid kerning ghost |
| Corner statements | drift | y ±40 opacity 0→1→0 scrubbed at chapter thirds |
| CTA arrow block | hover | arrow translates ↗ 4px, block brightens, 260ms cubic-bezier(.32,.72,0,1); :active scale .98 |
| Footer email | copy tooltip | "copied" fades in, auto-hides 2.4s |
| Reduced motion | scrubs render final states; canvas shows last frame (logo); marquee stops; blur list all-sharp |

## Anti-slop gates honored
No em-dashes anywhere. No "Scroll to explore" (banned; broadcast bar is the cue).
Eyebrow count ≤ 3 across 9 sections (hero bracket sub, one on numbers, one on CTA).
No section numbers except stage letters (real vernacular). One marquee only (film-strip
rail). One accent. No pure black. Buttons one-line, AA contrast. Justified text only in
the manifesto column with hyphens off at mobile (switches to left-align <768px).
Loader + reveals all have failsafes so content can never stay hidden.
