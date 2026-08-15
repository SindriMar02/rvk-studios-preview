/* RVK Studios — engine JS. GSAP + ScrollTrigger + Lenis from CDN (loaded before this). */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof gsap !== 'undefined';
  if (reduceMotion || !hasGsap) document.documentElement.classList.add('no-motion');
  if (hasGsap) gsap.registerPlugin(ScrollTrigger, CustomEase);

  /* ---------- slate loader: their logo sting behind a film gate ----------
     blades part -> the mark forms -> counter and progress rule run -> the gate
     shutters closed -> the slate is gone -> the blades open on the hero. */
  var slate = document.getElementById('slate');
  var slateTc = document.getElementById('slateTc');
  var slateFill = document.getElementById('slateFill');
  var slateFilm = document.getElementById('slateFilm');
  var gateTop = document.getElementById('gateTop');
  var gateBot = document.getElementById('gateBot');
  var slateDone = false;
  document.body.style.overflow = 'hidden';

  function tcString(totalFrames, fps) {
    var f = Math.floor(totalFrames % fps);
    var s = Math.floor(totalFrames / fps);
    var m = Math.floor(s / 60); s = s % 60;
    var h = Math.floor(m / 60); m = m % 60;
    function p(n) { return String(n).padStart(2, '0'); }
    return p(h) + ':' + p(m) + ':' + p(s) + ':' + p(f);
  }

  function finishSlate() {
    if (slate) slate.style.display = 'none';
    document.body.style.overflow = '';
    heroIn();
  }

  function endSlate() {
    if (slateDone) return;
    slateDone = true;
    slate.classList.add('done');
    if (!hasGsap || reduceMotion) { finishSlate(); return; }
    /* shutter closed on the loader, then open on the hero */
    gsap.timeline()
      .to([gateTop, gateBot], { height: '50.2%', duration: .26, ease: 'power2.in' })
      .add(finishSlate)
      .to([gateTop, gateBot], { height: '0%', duration: .85, ease: 'expo.out' }, '+=0.05')
      .set(slate, { display: 'none' });
  }
  /* failsafe: even if rAF never ticks (hidden tab), the page must open */
  setTimeout(endSlate, reduceMotion ? 900 : 5600);

  if (hasGsap && !reduceMotion) {
    var spool = CustomEase.create('spool',
      'M0,0 C0,0 0.11,0.35 0.22,0.44 0.3,0.51 0.34,0.51 0.42,0.55 0.5,0.59 0.49,0.57 0.55,0.61 0.61,0.65 0.63,0.74 0.72,0.83 0.8,0.91 1,1 1,1');
    var counter = { f: 0 };
    if (slateFilm) slateFilm.play().catch(function () {});
    var tl = gsap.timeline({ onComplete: endSlate });
    /* the gate parts */
    tl.fromTo([gateTop, gateBot], { height: '50.2%' },
      { height: '0%', duration: 1.1, ease: 'expo.out' }, 0)
      .to('.slate-inner', { opacity: 1, duration: .6, ease: 'power2.out' }, .45)
      .to(counter, {
        f: 96, duration: 4, ease: spool,
        onUpdate: function () {
          slateTc.textContent = tcString(counter.f, 24);
          slateFill.style.width = (counter.f / 96 * 100) + '%';
        }
      }, .2);
  } else {
    slateTc.textContent = '00:00:04:00';
    if (slateFill) slateFill.style.width = '100%';
  }

  /* ---------- hero entrance: CA char slide-in (opacity 0, x 24%, scale 1.1, stagger .05) ---------- */
  var heroDone = false;
  var heroChars = [];
  document.querySelectorAll('.hero-h1 .line').forEach(function (line) {
    var text = line.textContent;
    line.textContent = '';
    text.split(/(\s+)/).forEach(function (token) {
      if (!token) return;
      if (/^\s+$/.test(token)) { line.appendChild(document.createTextNode(' ')); return; }
      var w = document.createElement('span');
      w.className = 'wd';
      token.split('').forEach(function (chr) {
        var s = document.createElement('span');
        s.style.display = 'inline-block';
        s.textContent = chr;
        w.appendChild(s);
        heroChars.push(s);
      });
      line.appendChild(w);
    });
  });
  if (hasGsap && !reduceMotion) {
    gsap.set('.hero-h1 .line', { y: 0 });
    gsap.set(heroChars, { opacity: 0, x: '24%', scale: 1.1 });
  }
  function heroIn() {
    if (heroDone) return;
    heroDone = true;
    if (!hasGsap || reduceMotion) return;
    gsap.to(heroChars, { opacity: 1, x: '0%', scale: 1, duration: .35, stagger: .045, ease: 'power1.out', delay: .1 });
    gsap.to(['.hero-sub', '.deck'], { opacity: 1, y: 0, duration: .7, stagger: .12, ease: 'power2.out', delay: .55 });
  }

  /* ---------- lenis (CA: 2.4 / mouseMultiplier .5) ---------- */
  if (hasGsap && !reduceMotion && typeof Lenis !== 'undefined') {
    var lenis = new Lenis({ duration: 2.4, mouseMultiplier: 0.5, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.querySelector(a.getAttribute('href'));
        if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: 0 }); }
      });
    });
  }

  /* ---------- hero stage: darkens and pushes in as the intro scrolls over it ---------- */
  if (hasGsap && !reduceMotion) {
    gsap.timeline({
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    })
      .to('#heroDim', { opacity: .72, ease: 'none' }, 0)
      .to('.hero-video', { scale: 1.14, ease: 'none' }, 0)
      .to('.hero-copy', { y: -90, opacity: 0, ease: 'none' }, 0)
      .to('.deck', { opacity: 0, ease: 'none' }, .35);
  }

  /* ---------- broadcast deck: timecode from the reel ---------- */
  var video = document.getElementById('heroVideo');
  var deckTc = document.getElementById('deckTc');
  var deckThumb = document.getElementById('deckThumb');
  if (video && deckTc) {
    var fps = 23.976;
    function deckTick() {
      if (video.duration) {
        deckTc.textContent = tcString(Math.floor(video.currentTime * fps), 24);
        deckThumb.style.left = (video.currentTime / video.duration * 100) + '%';
      }
      requestAnimationFrame(deckTick);
    }
    requestAnimationFrame(deckTick);
    video.play().catch(function () {
      document.addEventListener('click', function once() {
        video.play(); document.removeEventListener('click', once);
      });
    });
  }

  /* ---------- char blur reveals (words stay unbreakable: per-char spans would
     otherwise let a line break land mid-word) ---------- */
  document.querySelectorAll('[data-split]').forEach(function (el) {
    var frag = document.createDocumentFragment();
    el.childNodes.forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (token) {
          if (!token) return;
          if (/^\s+$/.test(token)) { frag.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span');
          w.className = 'wd';
          token.split('').forEach(function (chr) {
            var s = document.createElement('span');
            s.className = 'ch'; s.textContent = chr;
            w.appendChild(s);
          });
          frag.appendChild(w);
        });
      } else { frag.appendChild(node.cloneNode(true)); }
    });
    el.innerHTML = ''; el.appendChild(frag);
    if (!hasGsap || reduceMotion) return;
    gsap.fromTo(el.querySelectorAll('.ch'),
      { filter: 'blur(8px)', opacity: .35 },
      {
        filter: 'blur(0px)', opacity: 1, duration: .7, stagger: .04, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 82%' }
      });
  });

  /* ---------- case rails: slow vertical drift, alternating direction ---------- */
  if (hasGsap && !reduceMotion) {
    document.querySelectorAll('.case-rail').forEach(function (rail, i) {
      var track = rail.querySelector('.rail-track');
      if (!track) return;
      var dir = i % 2 === 0 ? -1 : 1;
      gsap.fromTo(track,
        { yPercent: dir < 0 ? 0 : -34 },
        { yPercent: dir < 0 ? -34 : 0, ease: 'none',
          scrollTrigger: { trigger: rail, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* ---------- partner logo marquee (CA scroll-line) ---------- */
  if (hasGsap && !reduceMotion) {
    var pline = document.getElementById('partnerLine');
    if (pline) {
      var pset = pline.querySelector('.partner-set');
      gsap.to(pline, {
        x: function () { return -pset.offsetWidth; },
        duration: 36, ease: 'none', repeat: -1
      });
    }
  }
  document.querySelectorAll('.case-video').forEach(function (v) {
    var src = v.querySelector('source[data-src]');
    if (!src) return;
    function arm() {
      if (src.src) return;
      src.src = src.getAttribute('data-src');
      v.load();
    }
    if (hasGsap) {
      ScrollTrigger.create({ trigger: v, start: 'top 150%', once: true, onEnter: arm });
      ScrollTrigger.create({
        trigger: v, start: 'top 85%', end: 'bottom 10%',
        onEnter: function () { arm(); v.play().catch(function () {}); },
        onEnterBack: function () { v.play().catch(function () {}); },
        onLeave: function () { v.pause(); },
        onLeaveBack: function () { v.pause(); }
      });
    } else { arm(); }
  });

  /* ---------- focus pull (offer) ---------- */
  function scrubList(triggerSel, items, onChange) {
    if (!hasGsap || reduceMotion || !items.length) return;
    ScrollTrigger.create({
      trigger: triggerSel, start: 'top 62%', end: 'bottom 38%', scrub: true,
      onUpdate: function (self) {
        var idx = Math.min(Math.floor(self.progress * items.length), items.length - 1);
        items.forEach(function (it, i) { it.classList.toggle('is-active', i === idx); });
        if (onChange) onChange(idx);
      }
    });
    items[0].classList.add('is-active');
    if (onChange) onChange(0);
  }
  scrubList('#offerList', Array.prototype.slice.call(document.querySelectorAll('.offer-item')));

  /* ---------- filmography slate scrub + poster crossfade ---------- */
  var slateItems = Array.prototype.slice.call(document.querySelectorAll('.slate-item'));
  var plates = document.querySelectorAll('.poster-plate');
  scrubList('#slateItems', slateItems, function (idx) {
    plates.forEach(function (plate) {
      var pics = plate.querySelectorAll('.pp');
      pics.forEach(function (p, i) { p.classList.toggle('is-active', i === idx); });
    });
  });
  if (reduceMotion || !hasGsap) {
    slateItems.forEach(function (it) { it.classList.add('is-active'); });
    plates.forEach(function (plate) { var p = plate.querySelector('.pp'); if (p) p.classList.add('is-active'); });
  }

  /* ---------- THE RAIL (Obyggdasetur mechanic, transplanted exactly) ----------
     pin length = 1.5vh (title) + 1vh (curtain) + 1.5 x travel; the container slides
     -L while the title panel counter-translates +L so it stays visually pinned;
     mid-rail the behind plate wipes away and the overlay darkens to .4 */
  var railOuter = document.getElementById('reel');
  var rail = document.getElementById('rail');
  var railContainer = document.getElementById('railContainer');
  var railTitleWrap = document.querySelector('.rail_title-wrap');
  var railTitle = document.getElementById('railTitle');
  var railBehind = document.getElementById('railBehind');
  var railOverlay = document.getElementById('railOverlay');
  var curtainRects = Array.prototype.slice.call(document.querySelectorAll('#curtainClip rect'));

  if (railOuter && hasGsap && !reduceMotion) {
    var vhx = function () { return window.innerHeight; };
    var railTravel = function () { return railContainer.scrollWidth - window.innerWidth; };

    gsap.fromTo(railOuter, { clipPath: 'inset(0% 8% 0% 8%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
        scrollTrigger: { trigger: railOuter, start: 'top bottom', end: 'top top', scrub: true, refreshPriority: 6 } });
    gsap.fromTo(railBehind, { yPercent: 14 }, { yPercent: 0, ease: 'none',
      scrollTrigger: { trigger: railOuter, start: 'top 60%', end: 'top top', scrub: true, refreshPriority: 6 } });

    var railTl = null;
    function buildRail() {
      if (railTl) {
        railTl.scrollTrigger && railTl.scrollTrigger.kill();
        railTl.kill();
        gsap.set([railContainer, railTitleWrap], { clearProps: 'x' });
        gsap.set(railBehind, { clearProps: 'clipPath' });
        gsap.set(railOverlay, { '--rail-overlay': 0 });
        curtainRects.forEach(function (r, i) {
          r.setAttribute('width', '0.3334');
          r.setAttribute('x', String(i * 0.3333));
        });
        gsap.set(railTitle, { clearProps: 'fontSize' });
      }
      var H = vhx();
      var L = railTravel();
      var sText = 1.5 * H;
      var sCurtain = 1 * H;
      var sX = 1.5 * L;
      var small = window.innerWidth <= 860;
      var grown = small ? 3.6 : 8.4;
      var settled = small ? 2.6 : 5.6;

      railTl = gsap.timeline({
        scrollTrigger: {
          trigger: rail, start: 'top top',
          end: '+=' + (sText + sCurtain + sX),
          pin: true, scrub: true, invalidateOnRefresh: true, refreshPriority: 5
        }
      });
      railTl.fromTo(railTitle, { fontSize: grown + 'rem' },
        { fontSize: settled + 'rem', ease: 'none', duration: 0.5 * sText }, 0);

      var tCurtain = 0.5 * sText;
      railTl.to(curtainRects[2], { attr: { width: 0 }, ease: 'none', duration: 0.5 * sCurtain }, tCurtain);
      railTl.to(curtainRects[1], { attr: { width: 0 }, ease: 'none', duration: 0.75 * sCurtain }, tCurtain);
      railTl.to(curtainRects[0], { attr: { width: 0 }, ease: 'none', duration: 1.0 * sCurtain }, tCurtain);

      var tX = tCurtain + 0.3 * sCurtain;
      railTl.to(railContainer, { x: -L, ease: 'none', duration: sX }, tX);
      railTl.to(railTitleWrap, { x: L, ease: 'none', duration: sX }, tX);

      var tWipe = tX + 0.35 * sX;
      railTl.to(railBehind, { clipPath: 'inset(0% 100% 0% 0%)', ease: 'none', duration: 0.45 * sX }, tWipe);
      railTl.to(railOverlay, { '--rail-overlay': 0.4, ease: 'none', duration: 0.45 * sX }, tWipe);
      /* the title panel hands over to the closing statement */
      railTl.to(railTitleWrap, { autoAlpha: 0, ease: 'none', duration: 0.08 * sX }, tX + 0.8 * sX);
    }
    gsap.set(railOverlay, { '--rail-overlay': 0 });
    buildRail();

    var railResize;
    window.addEventListener('resize', function () {
      clearTimeout(railResize);
      railResize = setTimeout(function () { buildRail(); ScrollTrigger.refresh(); }, 220);
    });
  } else if (railOuter) {
    curtainRects.forEach(function (r) { r.setAttribute('width', '0'); });
    railContainer.style.overflowX = 'auto';
  }

  /* ---------- argument: word-by-word scrub reveal (CA PERFECTION paragraph device) ---------- */
  var argP = document.getElementById('argScrub');
  if (argP) {
    var words = argP.textContent.replace(/\s+/g, ' ').trim().split(' ');
    argP.innerHTML = words.map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
    if (hasGsap && !reduceMotion) {
      gsap.to(argP.querySelectorAll('.w'), {
        opacity: 1, stagger: .6, ease: 'none',
        scrollTrigger: { trigger: argP, start: 'top 78%', end: 'bottom 45%', scrub: true }
      });
    }
  }

  /* ---------- footer email copy ---------- */
  var copyBtn = document.getElementById('copyMail');
  var tip = document.getElementById('mailTip');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      try { navigator.clipboard.writeText('studios@rvkstudios.is'); } catch (e) {}
      tip.classList.add('show');
      setTimeout(function () { tip.classList.remove('show'); }, 2400);
    });
  }

  /* ---------- reveal failsafe: nothing may stay hidden ---------- */
  setTimeout(function () {
    document.querySelectorAll('.hero-sub,.deck,.film-note,.mynd-gloss').forEach(function (el) {
      if (!el.style.opacity || parseFloat(getComputedStyle(el).opacity) === 0) {
        /* leave scrub-driven ones alone if motion is active; only force when no motion engine */
        if (!hasGsap) el.style.opacity = 1;
      }
    });
  }, 3000);
})();
