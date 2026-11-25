(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var supportsObserver = 'IntersectionObserver' in window;

  var header = document.querySelector('.site-header');
  var nav = document.getElementById('primary-nav');
  var navToggle = document.getElementById('navToggle');

  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Открыть меню');
  }

  if (nav && navToggle) {
    navToggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('click', function (event) {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(event.target) || navToggle.contains(event.target)) return;
      closeNav();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeNav();
    });

    var mobileQuery = window.matchMedia('(min-width: 981px)');
    var handleDesktop = function (event) {
      if (event.matches) closeNav();
    };
    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', handleDesktop);
    }
  }

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  var revealSelector = [
    '.section-head',
    '.pain-card',
    '.time-tax',
    '.turn',
    '.turn-sub',
    '.compare',
    '.modules-head',
    '.module',
    '.subject-note',
    '.format-card',
    '.format-cta',
    '.step',
    '.how-note',
    '.quote',
    '.quotes-note',
    '.price-card',
    '.pricing-note',
    '.value-strip',
    '.faq details',
    '.faq-more',
    '.cta-copy',
    '.lead-form',
    '.subject-strip'
  ].join(', ');

  var revealItems = document.querySelectorAll(revealSelector);

  if (reduceMotion || !supportsObserver) {
    revealItems.forEach(function (el) {
      el.classList.add('is-visible');
    });
  } else {
    var counters = new Map();

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    revealItems.forEach(function (el) {
      el.classList.add('reveal');
      var parent = el.parentElement;
      var index = counters.get(parent) || 0;
      counters.set(parent, index + 1);
      el.style.setProperty('--d', Math.min(index * 70, 420) + 'ms');
      observer.observe(el);
    });
  }

  var faqItems = document.querySelectorAll('.faq details');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  var form = document.getElementById('leadForm');
  if (form) {
    var nameInput = form.querySelector('#lead-name');
    var contactInput = form.querySelector('#lead-contact');
    var hint = form.querySelector('#formHint');
    var resetButton = form.querySelector('#formReset');
    var successTitle = form.querySelector('.form-success h3');
    var hintDefault = hint ? hint.textContent : '';

    if (successTitle) successTitle.setAttribute('tabindex', '-1');

    function setHint(message, isError) {
      if (!hint) return;
      hint.textContent = message;
      hint.classList.toggle('is-error', Boolean(isError));
    }

    function markInvalid(input) {
      input.classList.add('invalid');
      input.setAttribute('aria-invalid', 'true');
    }

    function clearInvalid(input) {
      input.classList.remove('invalid');
      input.removeAttribute('aria-invalid');
    }

    [nameInput, contactInput].forEach(function (input) {
      if (!input) return;
      input.addEventListener('input', function () {
        clearInvalid(input);
        setHint(hintDefault, false);
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var isValid = true;
      var firstInvalid = null;

      [nameInput, contactInput].forEach(function (input) {
        if (input) clearInvalid(input);
      });

      if (!nameInput || nameInput.value.trim().length < 2) {
        if (nameInput) {
          markInvalid(nameInput);
          firstInvalid = firstInvalid || nameInput;
        }
        isValid = false;
      }

      var contactValue = contactInput ? contactInput.value.trim() : '';
      var isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contactValue);
      var digits = contactValue.replace(/\D/g, '');
      var isPhone = digits.length >= 10 && digits.length <= 15;

      if (!contactInput || (!isEmail && !isPhone)) {
        if (contactInput) {
          markInvalid(contactInput);
          firstInvalid = firstInvalid || contactInput;
        }
        isValid = false;
      }

      if (!isValid) {
        setHint('Проверьте имя и контакт: нужен e-mail или телефон.', true);
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      form.classList.add('is-sent');
      setHint(hintDefault, false);
      if (successTitle) successTitle.focus();
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        form.classList.remove('is-sent');
        form.reset();
        if (nameInput) clearInvalid(nameInput);
        if (contactInput) clearInvalid(contactInput);
        setHint(hintDefault, false);
        if (nameInput) nameInput.focus();
      });
    }
  }
})();
