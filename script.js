(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var supportsIO = 'IntersectionObserver' in window;

  var header = document.querySelector('.site-header');
  var nav = document.getElementById('primary-nav');
  var navToggle = document.getElementById('navToggle');

  // Тень хедера при скролле
  var onScroll = function () {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Мобильное меню
  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });
    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(e.target) || navToggle.contains(e.target)) return;
      closeNav();
    });
  }

  // Год в футере
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---------- Анимации появления при скролле ----------
  function revealAll() {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
    document.querySelectorAll('[data-count]').forEach(function (el) { paintCount(el, parseFloat(el.getAttribute('data-count')) || 0); });
  }

  function setupReveals() {
    var selector = '.page-hero, .section-head, .card, .steps li, .flow-step, .flow-arrow, .price-card, .faq details, .turn, .badge-card, .domain-card, .cta-copy, .cta-form, .cta-action, .loss-item, .loss-total, .split-copy, .split-visual, .trust-bar li';
    var counters = new Map();

    // Направление для секций с двумя колонками
    document.querySelectorAll('.split').forEach(function (split) {
      var copy = split.querySelector('.split-copy');
      var visual = split.querySelector('.split-visual');
      var reversed = split.classList.contains('reverse');
      if (copy) copy.classList.add(reversed ? 'reveal-right' : 'reveal-left');
      if (visual) visual.classList.add(reversed ? 'reveal-left' : 'reveal-right');
    });

    if (reduceMotion || !supportsIO) { revealAll(); return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    document.querySelectorAll(selector).forEach(function (el) {
      if (el.classList.contains('reveal')) return;
      el.classList.add('reveal');
      var parent = el.parentElement;
      var index = counters.get(parent) || 0;
      counters.set(parent, index + 1);
      el.style.setProperty('--d', Math.min(index * 70, 420) + 'ms');
      io.observe(el);
    });
  }

  // ---------- Счётчики ----------
  function paintCount(el, value) {
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    el.textContent = prefix + Math.round(value) + suffix;
  }

  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var duration = 1200;
    var start = performance.now();
    function tick(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      paintCount(el, target * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function setupCounters() {
    var els = document.querySelectorAll('[data-count]');
    els.forEach(function (el) { paintCount(el, 0); });

    if (reduceMotion || !supportsIO) {
      els.forEach(function (el) { paintCount(el, parseFloat(el.getAttribute('data-count')) || 0); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.4 });

    els.forEach(function (el) { io.observe(el); });
  }

  // ---------- Выбор фирменной темы (полная палитра White Label) ----------
  var THEMES = {
    blue:     { bg: '#f6f6f4', surface: '#ffffff', ink: '#10151f', inkSoft: '#2a3242', muted: '#5c6675', border: '#e5e7eb', blue: '#2f6bf0', blue700: '#1f57d6', blueSoft: '#eaf1ff', violet: '#7c5cff', graphite: '#141a24' },
    graphite: { bg: '#0f141c', surface: '#171e29', ink: '#f2f5f9', inkSoft: '#d7dde6', muted: '#9aa5b4', border: '#29323f', blue: '#5b8bff', blue700: '#7ba3ff', blueSoft: '#1d2a45', violet: '#9d7bff', graphite: '#0a0e15', dark: true },
    emerald:  { bg: '#f3f8f5', surface: '#ffffff', ink: '#0f1c16', inkSoft: '#24352c', muted: '#5a6f64', border: '#dbe8e0', blue: '#10b981', blue700: '#059669', blueSoft: '#d9f5ea', violet: '#34d399', graphite: '#0f1f18' },
    violet:   { bg: '#f7f5fc', surface: '#ffffff', ink: '#171127', inkSoft: '#2e2444', muted: '#665f7a', border: '#e6e0f2', blue: '#7c5cff', blue700: '#6a45f5', blueSoft: '#eee9ff', violet: '#b388ff', graphite: '#1a1330' },
    rose:     { bg: '#fdf5f7', surface: '#ffffff', ink: '#241319', inkSoft: '#3d232c', muted: '#7a5f68', border: '#f2dde4', blue: '#f43f5e', blue700: '#e11d48', blueSoft: '#ffe4e9', violet: '#fb7185', graphite: '#2a1219' },
    amber:    { bg: '#fdf9f0', surface: '#ffffff', ink: '#241b0c', inkSoft: '#3d2f18', muted: '#7a6a4f', border: '#f0e4cd', blue: '#d97706', blue700: '#b45309', blueSoft: '#fef3c7', violet: '#f59e0b', graphite: '#2a1f0c' },
    cyan:     { bg: '#f0f9fb', surface: '#ffffff', ink: '#0c1a1e', inkSoft: '#1f3339', muted: '#4f6b72', border: '#d5e9ee', blue: '#06b6d4', blue700: '#0891b2', blueSoft: '#cffafe', violet: '#22d3ee', graphite: '#0a1c21' },
    indigo:   { bg: '#f4f5fd', surface: '#ffffff', ink: '#12142e', inkSoft: '#262a4a', muted: '#5e6280', border: '#e0e2f4', blue: '#4f46e5', blue700: '#4338ca', blueSoft: '#e0e7ff', violet: '#818cf8', graphite: '#141634' }
  };

  function applyTheme(theme) {
    var root = document.documentElement;
    var map = {
      '--bg': theme.bg,
      '--surface': theme.surface,
      '--ink': theme.ink,
      '--ink-soft': theme.inkSoft,
      '--muted': theme.muted,
      '--border': theme.border,
      '--blue': theme.blue,
      '--blue-700': theme.blue700,
      '--blue-soft': theme.blueSoft,
      '--violet': theme.violet,
      '--graphite': theme.graphite
    };
    Object.keys(map).forEach(function (name) {
      root.style.setProperty(name, map[name]);
    });
    root.style.colorScheme = theme.dark ? 'dark' : 'light';
  }

  // Восстановление выбранной темы между страницами
  var savedTheme = null;
  try { savedTheme = window.localStorage.getItem('acade-theme'); } catch (e) {}
  if (savedTheme && THEMES[savedTheme]) applyTheme(THEMES[savedTheme]);

  function setupThemes() {
    var swatches = document.querySelectorAll('.swatch');
    if (!swatches.length) return;

    if (savedTheme && THEMES[savedTheme]) {
      swatches.forEach(function (s) {
        s.classList.remove('is-selected');
        s.setAttribute('aria-pressed', 'false');
      });
    }

    swatches.forEach(function (swatch) {
      if (savedTheme && swatch.dataset.theme === savedTheme) {
        swatch.classList.add('is-selected');
        swatch.setAttribute('aria-pressed', 'true');
      }
      swatch.addEventListener('click', function () {
        var theme = THEMES[swatch.dataset.theme];
        if (!theme) return;
        swatches.forEach(function (s) {
          s.classList.remove('is-selected');
          s.setAttribute('aria-pressed', 'false');
        });
        swatch.classList.add('is-selected');
        swatch.setAttribute('aria-pressed', 'true');
        applyTheme(theme);
        try { window.localStorage.setItem('acade-theme', swatch.dataset.theme); } catch (e) {}
      });
    });
  }

  setupReveals();
  setupCounters();
  setupThemes();

  // ---------- Форма заявки (без бэкенда: валидация + сообщение об успехе) ----------
  var form = document.getElementById('leadForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = form.querySelector('#name');
      var contact = form.querySelector('#contact');
      var valid = true;

      [name, contact].forEach(function (input) {
        var ok = input.value.trim().length > 0;
        input.classList.toggle('invalid', !ok);
        if (!ok) valid = false;
      });

      if (contact.value.trim()) {
        var value = contact.value.trim();
        var isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        var isPhone = /[0-9]{6,}/.test(value.replace(/[^0-9]/g, ''));
        if (!isEmail && !isPhone) {
          contact.classList.add('invalid');
          valid = false;
        }
      }

      if (!valid) {
        var hint = document.getElementById('formHint');
        if (hint) {
          hint.textContent = 'Проверьте, пожалуйста, выделенные поля.';
          hint.style.color = '#dc2626';
        }
        return;
      }

      form.classList.add('is-error');
      form.innerHTML =
        '<div class="error-icon">' +
        '<svg class="icon" aria-hidden="true"><use href="#i-close"/></svg>' +
        '</div>' +
        '<h3>Ошибка отправки формы</h3>' +
        '<p>Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.</p>' +
        '<button class="btn btn-primary btn-block" type="button" id="leadRetry">Попробовать снова</button>';

      var retry = document.getElementById('leadRetry');
      if (retry) retry.addEventListener('click', function () { window.location.reload(); });

      if (typeof window.ym === 'function' && window.YM_COUNTER_ID) {
        window.ym(window.YM_COUNTER_ID, 'reachGoal', 'lead_form');
      }
    });

    form.querySelectorAll('input').forEach(function (input) {
      input.addEventListener('input', function () {
        input.classList.remove('invalid');
      });
    });
  }
})();
