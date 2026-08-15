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
    text.split('').forEach(function (chr) {
      var s = document.createElement('span');
      s.style.display = 'inline-block';
      s.style.whiteSpace = 'pre';
      s.textContent = chr;
      line.appendChild(s);
      heroChars.push(s);
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
      .to('#heroDim', { opacity: .62, ease: 'none' }, 0)
      .to('.hero-video', { scale: 1.12, ease: 'none' }, 0)
      .to('.hero-copy', { y: -60, opacity: .35, ease: 'none' }, 0)
      .to('.deck', { opacity: 0, ease: 'none' }, .55);
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

  /* ---------- char blur reveals ---------- */
  document.querySelectorAll('[data-split]').forEach(function (el) {
    var frag = document.createDocumentFragment();
    el.childNodes.forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split('').forEach(function (chr) {
          if (chr === ' ') { frag.appendChild(document.createTextNode(' ')); return; }
          var s = document.createElement('span');
          s.className = 'ch'; s.textContent = chr;
          frag.appendChild(s);
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

  /* ---------- film chapter: canvas scrub + mynd -> kvikmynd ---------- */
  var canvas = document.getElementById('filmCanvas');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var isMobile = window.innerWidth <= 640;
    var TOTAL = isMobile ? 107 : 124;
    var DIR = isMobile ? 'assets/seq2-m/' : 'assets/seq2/';
    var frames = [];
    var current = -1;
    var loaded = false;

    function frameURL(i) { return DIR + 'f-' + String(i + 1).padStart(3, '0') + '.webp'; }

    function drawFrame(i) {
      var img = frames[i];
      if (!img || !img.complete || !img.naturalWidth) return;
      var cw = canvas.width, chh = canvas.height;
      var ir = img.naturalWidth / img.naturalHeight, cr = cw / chh;
      var sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
      if (cr > ir) { sh = img.naturalWidth / cr; sy = (img.naturalHeight - sh) / 2; }
      else { sw = img.naturalHeight * cr; sx = (img.naturalWidth - sw) / 2; }
      ctx.clearRect(0, 0, cw, chh);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, chh);
    }

    function resizeCanvas() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.8);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      if (current >= 0) drawFrame(current);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function loadFrames() {
      if (loaded) return;
      loaded = true;
      for (var i = 0; i < TOTAL; i++) {
        (function (i) {
          var img = new Image();
          img.src = frameURL(i);
          img.onload = function () { if (i === 0 && current < 0) { current = 0; drawFrame(0); } };
          frames[i] = img;
        })(i);
      }
    }

    if (hasGsap && !reduceMotion) {
      ScrollTrigger.create({ trigger: '.film', start: 'top bottom+=250%', once: true, onEnter: loadFrames });
      if ('requestIdleCallback' in window) requestIdleCallback(loadFrames, { timeout: 6000 });

      ScrollTrigger.create({
        trigger: '.film', start: 'top top', end: 'bottom bottom', scrub: true,
        onUpdate: function (self) {
          /* non-linear map: hold the aerial while the word works (0 - .62),
             then run the descent onto the mark once the word has cleared */
          var p = self.progress;
          var LAND = 0.52;                      /* frame where the mark starts landing */
          var f = p < 0.62
            ? (p / 0.62) * LAND
            : LAND + ((p - 0.62) / 0.38) * (1 - LAND);
          var idx = Math.min(Math.floor(f * TOTAL), TOTAL - 1);
          if (idx !== current) { current = idx; drawFrame(idx); }
        }
      });

      /* kvik insertion mid-chapter */
      var kvik = document.getElementById('kvik');
      var myndEl = document.querySelector('.mynd');
      var kvikW = 0;
      function measureKvik() {
        kvikW = kvik.getBoundingClientRect().width;
        gsap.set(myndEl, { x: kvikW / 2 });
      }
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureKvik);
      measureKvik();
      window.addEventListener('resize', function () {
        gsap.set(myndEl, { x: 0 }); measureKvik(); ScrollTrigger.refresh();
      });
      /* chapter choreography: canvas rides the whole scroll; word arrives, morphs, hands
         back to the film so the drone landing on the RVK mark plays clean at the end */
      gsap.set('.mynd-wrap', { opacity: 0, y: 40 });
      gsap.timeline({
        scrollTrigger: { trigger: '.film', start: 'top top', end: 'bottom bottom', scrub: true }
      })
        .to('.scope-bar', { scaleY: 0, duration: .1, ease: 'power2.out' }, 0)
        .to('.fn-1', { opacity: 1, duration: .05 }, .06)
        .to('.mynd-wrap', { opacity: 1, y: 0, duration: .08 }, .1)
        .to('.fn-1', { opacity: 0, duration: .05 }, .26)
        .to(kvik, { opacity: 1, duration: .18, ease: 'none' }, .3)
        .to(myndEl, { x: 0, duration: .18, ease: 'none' }, .3)
        .to('.mynd-gloss', { opacity: 1, duration: .07 }, .48)
        .to('.fn-2', { opacity: 1, duration: .05 }, .56)
        .to('.film-keep', { opacity: 1, duration: .05 }, .62)
        .to('.fn-2', { opacity: 0, duration: .05 }, .72)
        .to('.mynd-gloss', { opacity: 0, duration: .06 }, .76)
        .to('.mynd-wrap', { opacity: 0, y: -40, duration: .08 }, .8)
        .to('.film-keep', { opacity: 0, duration: .05 }, .86)
        .to('.scope-bar', { scaleY: 1, duration: .08, ease: 'power2.inOut' }, .9);
    } else {
      /* static: last frame (the mark) */
      var img = new Image();
      img.src = frameURL(TOTAL - 1);
      img.onload = function () { frames[TOTAL - 1] = img; current = TOTAL - 1; drawFrame(current); };
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
