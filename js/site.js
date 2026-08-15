/* RVK Studios — engine JS. GSAP + ScrollTrigger + Lenis from CDN (loaded before this). */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof gsap !== 'undefined';
  if (reduceMotion || !hasGsap) document.documentElement.classList.add('no-motion');
  if (hasGsap) gsap.registerPlugin(ScrollTrigger, CustomEase);

  /* ---------- slate loader (with hard failsafe) ---------- */
  var slate = document.getElementById('slate');
  var slateTc = document.getElementById('slateTc');
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

  function endSlate() {
    if (slateDone) return;
    slateDone = true;
    slate.classList.add('done');
    document.body.style.overflow = '';
    heroIn();
  }
  /* failsafe: even if rAF never ticks (hidden tab), the page must open */
  setTimeout(endSlate, reduceMotion ? 1000 : 5500);

  if (hasGsap && !reduceMotion) {
    var spool = CustomEase.create('spool',
      'M0,0 C0,0 0.11,0.35 0.22,0.44 0.3,0.51 0.34,0.51 0.42,0.55 0.5,0.59 0.49,0.57 0.55,0.61 0.61,0.65 0.63,0.74 0.72,0.83 0.8,0.91 1,1 1,1');
    var counter = { f: 0 };
    var tl = gsap.timeline({ onComplete: endSlate });
    tl.to(counter, {
      f: 96, duration: 4, ease: spool,
      onUpdate: function () { slateTc.textContent = tcString(counter.f, 24); }
    })
      .to('.slate-mark', { opacity: 1, duration: .8, ease: 'power1.out' }, .4)
      .to('.slate-sub', { opacity: 1, duration: .8, ease: 'power1.out' }, .9);
  } else {
    slateTc.textContent = '00:00:04:00';
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

  /* ---------- the reel: scroll cuts INT against EXT ----------
     Each frame is revealed over the previous one by a wipe whose direction alternates,
     so the seam sweeps back and forth like an edit being made under the reader. */
  var layers = Array.prototype.slice.call(document.querySelectorAll('.cut'));
  if (layers.length) {
    var seam = document.getElementById('cutSeam');
    var slugEl = document.getElementById('slugNow');
    var countEl = document.getElementById('cutCount');
    var N = layers.length;
    var lastSlug = -1;

    function paint(p) {
      /* the stage unpins at 5/6 of the section, so every beat lives inside that window */
      var t = Math.min(1, p / 0.62);
      var pos = t * (N - 1);
      var i = Math.min(Math.floor(pos), N - 2);
      var f = N > 1 ? pos - i : 0;
      if (t >= 1) { i = N - 2; f = 1; }

      layers.forEach(function (el, j) {
        if (j < i) { el.style.opacity = '0'; el.style.clipPath = 'inset(0 0 0 0)'; return; }
        el.style.opacity = '1';
        if (j === i) {
          el.style.clipPath = 'inset(0 0 0 0)';
          el.style.transform = 'scale(' + (1 + 0.05 * f).toFixed(4) + ')';
        } else if (j === i + 1) {
          /* even cuts wipe in from the right, odd cuts from the left */
          var pct = ((1 - f) * 100).toFixed(2);
          el.style.clipPath = (i % 2 === 0)
            ? 'inset(0 0 0 ' + pct + '%)'
            : 'inset(0 ' + pct + '% 0 0)';
          el.style.transform = 'scale(' + (1.06 - 0.06 * f).toFixed(4) + ')';
        } else {
          el.style.opacity = '0';
          el.style.clipPath = (i % 2 === 0) ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';
        }
      });

      /* the seam rides the wipe edge, and disappears between cuts */
      var edge = (i % 2 === 0) ? (1 - f) : f;
      seam.style.left = (edge * 100) + '%';
      seam.style.opacity = (f > 0.02 && f < 0.98) ? '1' : '0';
      seam.querySelector('.seam-tag').style.textAlign = (i % 2 === 0) ? 'left' : 'right';

      /* the slugline belongs to whichever frame owns most of the screen */
      var shown = f > 0.5 ? i + 1 : i;
      if (shown !== lastSlug) {
        lastSlug = shown;
        slugEl.innerHTML = layers[shown].getAttribute('data-slug');
        countEl.textContent = String(shown + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0');
      }
    }

    paint(0);

    if (hasGsap && !reduceMotion) {
      ScrollTrigger.create({
        trigger: '.reel', start: 'top top', end: 'bottom bottom', scrub: true,
        onUpdate: function (self) { paint(self.progress); }
      });
      gsap.timeline({ scrollTrigger: { trigger: '.reel', start: 'top top', end: 'bottom bottom', scrub: true } })
        .to('.scope-bar', { scaleY: 0, duration: .06, ease: 'power2.out' }, 0)
        .to('#reelPayoff', { opacity: 1, duration: .05 }, .66)
        .to('.slug, .cut-count', { opacity: 0, duration: .04 }, .66)
        .to('.scope-bar', { scaleY: 1, duration: .05, ease: 'power2.inOut' }, .78);
    } else {
      paint(1);
      layers[N - 1].style.opacity = '1';
      layers[N - 1].style.clipPath = 'inset(0 0 0 0)';
    }
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
