/**
 * main.js
 * 小河内タイムレンズ (Ogouchi Time Lens) - PR Homepage
 *
 * Vanilla JS — no dependencies.
 * Handles scroll animations, parallax, counter animation,
 * mobile menu, lazy-loaded iframes, and JSON-LD injection.
 */

'use strict';

/* =========================================================
   0. Utility helpers
   ========================================================= */

/**
 * Throttle a callback so it fires at most once per rAF tick.
 * @param {Function} fn
 * @returns {Function}
 */
const rafThrottle = (fn) => {
  let ticking = false;
  return (...args) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      fn(...args);
      ticking = false;
    });
  };
};

/* =========================================================
   1. Scroll-triggered animations (IntersectionObserver)
   ========================================================= */

const initScrollAnimations = () => {
  const animatedElements = document.querySelectorAll('.fade-in, .slide-up');
  if (!animatedElements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  animatedElements.forEach((el) => observer.observe(el));
};

/* =========================================================
   2. Navigation bar — opaque on scroll
   ========================================================= */

const initNavScroll = () => {
  const nav = document.querySelector('nav');
  if (!nav) return;

  const SCROLL_THRESHOLD = 100;

  const handleScroll = () => {
    if (window.scrollY > SCROLL_THRESHOLD) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', rafThrottle(handleScroll), { passive: true });

  // Set correct state on initial load (e.g. after a refresh mid-page).
  handleScroll();
};

/* =========================================================
   3. Smooth scroll for anchor links
   ========================================================= */

const initSmoothScroll = () => {
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Update URL hash without jumping.
    history.pushState(null, '', targetId);

    // Close mobile menu if open.
    const mobileMenu = document.querySelector('.nav-links');
    const hamburger = document.querySelector('.hamburger');
    if (mobileMenu && mobileMenu.classList.contains('active')) {
      mobileMenu.classList.remove('active');
      hamburger?.classList.remove('active');
      hamburger?.setAttribute('aria-expanded', 'false');
    }
  });
};

/* =========================================================
   4. Parallax effect on hero section
   ========================================================= */

const initHeroParallax = () => {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  // Respect reduced-motion preference.
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  if (prefersReducedMotion) return;

  const PARALLAX_SPEED = 0.4; // background moves at 40 % of scroll speed

  const handleScroll = () => {
    const scrollY = window.scrollY;
    const heroBottom = hero.offsetTop + hero.offsetHeight;

    // Only calculate while the hero is in or near the viewport.
    if (scrollY > heroBottom) return;

    const offset = scrollY * PARALLAX_SPEED;
    hero.style.backgroundPositionY = `calc(50% + ${offset}px)`;
  };

  window.addEventListener('scroll', rafThrottle(handleScroll), { passive: true });
};

/* =========================================================
   5. Counter animation (stats section)
   ========================================================= */

/**
 * Animate a single counter element from 0 to its target value.
 * The target is read from the `data-target` attribute.
 * @param {HTMLElement} el
 */
const animateCounter = (el) => {
  const target = parseInt(el.dataset.target, 10);
  if (isNaN(target)) return;

  const duration = 2000; // ms
  const startTime = performance.now();

  const step = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out cubic for a natural deceleration.
    const eased = 1 - Math.pow(1 - progress, 3);

    el.textContent = Math.round(eased * target).toLocaleString('ja-JP');

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

const initCounterAnimation = () => {
  const counters = document.querySelectorAll('[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  counters.forEach((el) => {
    // Initialise display to 0 so the page does not flash the final number.
    el.textContent = '0';
    observer.observe(el);
  });
};

/* =========================================================
   6. Water ripple effect (CSS-driven, JS injects keyframes)
   ========================================================= */

const initWaterRipple = () => {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  // Only inject once.
  if (document.getElementById('ripple-styles')) return;

  const style = document.createElement('style');
  style.id = 'ripple-styles';
  style.textContent = `
    .hero {
      position: relative;
      overflow: hidden;
    }

    .hero::after {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background:
        radial-gradient(
          ellipse 600px 600px at 30% 80%,
          rgba(255, 255, 255, 0.08) 0%,
          transparent 70%
        ),
        radial-gradient(
          ellipse 400px 400px at 70% 90%,
          rgba(255, 255, 255, 0.06) 0%,
          transparent 70%
        );
      animation: ripple 6s ease-in-out infinite alternate;
      z-index: 1;
    }

    @keyframes ripple {
      0% {
        transform: scale(1) translateY(0);
        opacity: 0.6;
      }
      50% {
        transform: scale(1.05) translateY(-8px);
        opacity: 1;
      }
      100% {
        transform: scale(1) translateY(0);
        opacity: 0.6;
      }
    }

    /* Second, slower ripple layer for depth */
    .hero::before {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background:
        radial-gradient(
          ellipse 800px 300px at 50% 95%,
          rgba(173, 216, 230, 0.10) 0%,
          transparent 70%
        );
      animation: ripple-slow 8s ease-in-out infinite alternate;
      z-index: 1;
    }

    @keyframes ripple-slow {
      0% {
        transform: scaleX(1) translateY(0);
        opacity: 0.4;
      }
      100% {
        transform: scaleX(1.08) translateY(-5px);
        opacity: 0.8;
      }
    }
  `;

  document.head.appendChild(style);
};

/* =========================================================
   7. Mobile menu toggle (hamburger)
   ========================================================= */

const initMobileMenu = () => {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', String(isOpen));

    // Prevent background scroll while menu is open.
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu when clicking outside.
  document.addEventListener('click', (e) => {
    if (
      navLinks.classList.contains('active') &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      navLinks.classList.remove('active');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // Close menu on Escape key.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
      navLinks.classList.remove('active');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
};

/* =========================================================
   8. Lazy loading for embedded content (YouTube iframes)
   ========================================================= */

const initLazyIframes = () => {
  // Each placeholder should have:
  //   class="lazy-iframe"
  //   data-src="https://www.youtube.com/embed/VIDEO_ID"
  //   (optional) data-title="Video title"
  const placeholders = document.querySelectorAll('.lazy-iframe');
  if (!placeholders.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const placeholder = entry.target;
        const src = placeholder.dataset.src;
        if (!src) return;

        const iframe = document.createElement('iframe');
        iframe.src = src;
        iframe.title = placeholder.dataset.title || '埋め込み動画';
        iframe.width = placeholder.dataset.width || '560';
        iframe.height = placeholder.dataset.height || '315';
        iframe.frameBorder = '0';
        iframe.allow =
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.loading = 'lazy';

        // Replace placeholder with iframe.
        placeholder.replaceWith(iframe);
        observer.unobserve(placeholder);
      });
    },
    {
      // Start loading slightly before the element enters the viewport.
      rootMargin: '200px 0px',
      threshold: 0,
    }
  );

  placeholders.forEach((el) => observer.observe(el));
};

/* =========================================================
   9. Structured data (JSON-LD) injection
   ========================================================= */

const injectStructuredData = () => {
  const schemas = [
    // Organization
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: '小河内タイムレンズ プロジェクト',
      alternateName: 'Ogouchi Time Lens Project',
      description:
        '奥多摩湖の湖底に沈んだ小河内村をARで可視化するプロジェクト',
      url: window.location.origin,
    },

    // WebSite
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: '小河内タイムレンズ',
      alternateName: 'Ogouchi Time Lens',
      url: window.location.origin,
      description:
        '奥多摩湖の湖底に沈んだ小河内村をARで可視化するプロジェクト「小河内タイムレンズ」の公式サイト',
      inLanguage: 'ja',
    },

    // Event
    {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: '奥多摩町町制施行70周年記念事業 — 小河内タイムレンズ',
      description:
        '奥多摩町の町制施行70周年を記念し、小河内ダム建設で湖底に沈んだ小河内村をAR技術で蘇らせるプロジェクト',
      startDate: '2025-04-01',
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: '奥多摩湖（小河内ダム）',
        address: {
          '@type': 'PostalAddress',
          addressLocality: '奥多摩町',
          addressRegion: '東京都',
          addressCountry: 'JP',
        },
      },
      organizer: {
        '@type': 'Organization',
        name: '小河内タイムレンズ プロジェクト',
      },
    },
  ];

  schemas.forEach((schema) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
};

/* =========================================================
   Boot
   ========================================================= */

const init = () => {
  initScrollAnimations();
  initNavScroll();
  initSmoothScroll();
  initHeroParallax();
  initCounterAnimation();
  initWaterRipple();
  initMobileMenu();
  initLazyIframes();
  injectStructuredData();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
