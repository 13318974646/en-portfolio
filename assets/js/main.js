/* =========================================================
   个人作品集 · 交互脚本
   01. 工具函数
   02. 导航 / 平滑滚动 / 滚动进度
   03. 滚动入场
   04. 卡片轻微 3D 倾斜
   05. 英雄区「鼠标跟随 + 滚动视频」
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 01. 工具函数 ---------- */
  var clamp = function (v, min, max) { return Math.min(max, Math.max(min, v)); };
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  /* ---------- 02. 导航 / 平滑滚动 / 滚动进度 ---------- */
  (function initNavigation() {
    var nav = document.getElementById('siteNav');
    var progress = document.getElementById('navProgress');
    var hero = document.getElementById('top');
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
    var targets = links
      .map(function (link) {
        var id = link.getAttribute('href').replace('#', '');
        return { link: link, section: document.getElementById(id) };
      })
      .filter(function (item) { return item.section; });

    var ticking = false;

    function updateOnScroll() {
      ticking = false;
      var y = window.scrollY || window.pageYOffset;

      // 首屏深色：导航透明；离开首屏后切成浅色实底
      if (nav) {
        var heroBottom = hero ? hero.offsetHeight - 24 : window.innerHeight - 24;
        nav.classList.toggle('is-solid', y > Math.max(heroBottom, 40));
      }

      if (progress) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = 'scaleX(' + (max > 0 ? clamp(y / max, 0, 1) : 0) + ')';
      }

      // 当前区块：取最后一个已经进入导航下方的区块
      var offset = (nav ? nav.offsetHeight : 72) + 150;
      var activeId = null;
      targets.forEach(function (item) {
        if (item.section.getBoundingClientRect().top <= offset) activeId = item.link.getAttribute('data-nav');
      });
      links.forEach(function (link) {
        var on = link.getAttribute('data-nav') === activeId;
        link.classList.toggle('is-active', on);
        if (on) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateOnScroll);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateOnScroll();

    // 平滑滚动：所有站内锚点统一加上固定导航的高度偏移
    function scrollToSection(id, immediate) {
      if (id === 'top') {
        window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' });
        return;
      }
      var target = document.getElementById(id);
      if (!target) return;
      var navH = nav ? nav.offsetHeight : 72;
      var top = target.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) - navH - 18;
      window.scrollTo({
        top: Math.max(0, top),
        behavior: immediate || prefersReducedMotion.matches ? 'auto' : 'smooth'
      });
    }

    document.addEventListener('click', function (event) {
      var anchor = event.target.closest ? event.target.closest('a[href^="#"]') : null;
      if (!anchor) return;
      var hash = anchor.getAttribute('href');
      if (!hash || hash === '#') return;
      var id = hash.slice(1);
      if (!document.getElementById(id)) return;

      event.preventDefault();
      scrollToSection(id, false);
      if (history.replaceState) history.replaceState(null, '', '#' + id);
    });

    // 带 hash 打开页面时，修正固定导航的遮挡
    if (window.location.hash && window.location.hash.length > 1) {
      var initial = window.location.hash.slice(1);
      window.setTimeout(function () { scrollToSection(initial, true); }, 120);
    }
  })();

  /* ---------- 03. 滚动入场 ---------- */
  (function initReveal() {
    if (!('IntersectionObserver' in window) || prefersReducedMotion.matches) return;

    var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!items.length) return;

    document.body.classList.add('reveal-engine');

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
    );

    items.forEach(function (item) { observer.observe(item); });

    // 首屏附近已经可见的元素立即显示，避免闪一下
    window.requestAnimationFrame(function () {
      items.forEach(function (item) {
        var rect = item.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.96 && rect.bottom > 0) {
          item.classList.add('is-visible');
          observer.unobserve(item);
        }
      });
    });
  })();

  /* ---------- 04. 卡片轻微 3D 倾斜 ---------- */
  (function initCardTilt() {
    if (prefersReducedMotion.matches || !finePointer.matches) return;
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-tilt]'));
    if (!cards.length) return;

    cards.forEach(function (card) {
      var raf = 0;
      var next = null;

      function apply() {
        raf = 0;
        if (!next) return;
        var rect = card.getBoundingClientRect();
        var px = (next.x - rect.left) / rect.width - 0.5;
        var py = (next.y - rect.top) / rect.height - 0.5;
        card.style.setProperty('--rx', (py * -3.2).toFixed(2) + 'deg');
        card.style.setProperty('--ry', (px * 3.2).toFixed(2) + 'deg');
      }

      card.addEventListener('pointermove', function (event) {
        if (event.pointerType === 'touch') return;
        next = { x: event.clientX, y: event.clientY };
        if (!raf) raf = window.requestAnimationFrame(apply);
      });

      card.addEventListener('pointerleave', function () {
        next = null;
        if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  })();

  /* ---------- 05. CRT screen ----------
     首页右侧的复古 CRT 机器人视频是循环播放的装饰画面，
     不做鼠标 seek，也不需要关键帧密度；只保证静音、自动播放、
     循环，并在标签页隐藏时暂停，回到页面后继续。
     --------------------------------------------------------- */
  (function initCrtScreen() {
    var video = document.getElementById('crtVideo');
    if (!video) return;

    video.muted = true;
    video.loop = true;

    function play() {
      var p = video.play();
      if (p && typeof p.catch === 'function') {
        p.catch(function () { /* autoplay may be blocked until interaction */ });
      }
    }

    if (video.readyState >= 2) play();
    else video.addEventListener('canplay', play, { once: true });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) video.pause();
      else play();
    });
  })();

})();

/* Mini program screen carousel: slow auto-pan + manual controls */
(function initScreenCarousel() {
  var root = document.querySelector('[data-screens]');
  if (!root) return;
  var viewport = root.querySelector('.screen-carousel__viewport');
  var track = root.querySelector('.screen-carousel__track');
  var prev = root.querySelector('[data-screen-prev]');
  var next = root.querySelector('[data-screen-next]');
  var toggle = root.querySelector('[data-screen-toggle]');
  if (!viewport || !track || !prev || !next) return;

  // Duplicate the phone strip so the auto-pan can loop without a visible jump.
  var originals = Array.prototype.slice.call(track.children);
  originals.forEach(function (node) {
    var clone = node.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
  viewport.style.scrollSnapType = 'none';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var auto = !reduced;
  var paused = false;
  var hovered = false;
  var resumeTimer = 0;
  var half = 0;
  var visible = false;

  function measure() { half = track.scrollWidth / 2; }
  function resume() {
    paused = false;
    clearTimeout(resumeTimer);
    resumeTimer = 0;
  }
  function pauseFor(ms) {
    paused = true;
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(function () {
      if (!hovered) paused = false;
    }, ms);
  }
  function setToggle() {
    if (!toggle) return;
    toggle.textContent = auto ? '❚❚' : '▶';
    toggle.setAttribute('aria-pressed', auto ? 'false' : 'true');
    toggle.setAttribute('aria-label', auto ? 'Pause auto-scroll' : 'Resume auto-scroll');
  }
  function step() {
    var phone = viewport.querySelector('.phone');
    if (!phone) return 252;
    var gap = parseFloat(getComputedStyle(track).columnGap || '24') || 24;
    return phone.getBoundingClientRect().width + gap;
  }
  function update() {
    var max = viewport.scrollWidth - viewport.clientWidth;
    prev.disabled = viewport.scrollLeft <= 4;
    next.disabled = viewport.scrollLeft >= max - 4;
  }

  function advance() {
    if (!auto || paused || !visible) return;
    viewport.scrollLeft += 0.5; // ~16 px per second at 30 ms
    if (half && viewport.scrollLeft >= half) viewport.scrollLeft -= half;
  }

  prev.addEventListener('click', function () {
    pauseFor(2600);
    viewport.scrollBy({ left: -step(), behavior: 'smooth' });
  });
  next.addEventListener('click', function () {
    pauseFor(2600);
    viewport.scrollBy({ left: step(), behavior: 'smooth' });
  });
  if (toggle) {
    toggle.addEventListener('click', function () {
      auto = !auto;
      if (auto) resume();
      else { paused = true; clearTimeout(resumeTimer); resumeTimer = 0; }
      setToggle();
    });
  }

  root.addEventListener('pointerenter', function () { hovered = true; paused = true; });
  root.addEventListener('pointerleave', function () { hovered = false; paused = false; });
  root.addEventListener('focusin', function () { paused = true; });
  root.addEventListener('focusout', function () { if (!hovered) paused = false; });
  viewport.addEventListener('wheel', function () { pauseFor(1800); }, { passive: true });
  viewport.addEventListener('pointerdown', function () { pauseFor(3000); });
  viewport.addEventListener('touchstart', function () { pauseFor(3000); }, { passive: true });
  viewport.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', function () { measure(); update(); }, { passive: true });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
    }, { threshold: 0.2 }).observe(root);
  } else {
    visible = true;
  }

  setToggle();
  measure();
  update();
  setInterval(advance, 30);
})();
