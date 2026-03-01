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
      name: '川野車人形保存会',
      alternateName: 'Kawano Kuruma Ningyo Hozonkai',
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
        name: '川野車人形保存会',
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
   10. Hero photo bubbles — floating memory photos
   ========================================================= */

const initHeroPhotoBubbles = () => {
  const container = document.querySelector('.hero-photo-bubbles');
  if (!container) return;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  const photoFiles = [
    '00.jpg','01.jpg','02.jpg','03.jpg','05.jpg','07.jpg','09.jpg',
    '100.jpg','1001.jpg','1004.jpg','101.jpg','102.jpg','103.jpg','112.jpg',
    '17.jpg','18.jpg','19.jpg','20.jpg','21.jpg','22.jpg','23.jpg',
    '26.jpg','27.jpg','30.jpg','31.jpg','32.jpg','33.jpg','38.jpg','39.jpg',
    '41.jpg','66.jpg','67.jpg','69.jpg','70.jpg','71.jpg','72.jpg',
    '73.jpg','74.jpg','81.jpg','83.jpg','84.jpg','85.jpg','86.jpg',
    '87.jpg','88.jpg','89.jpg','90.jpg','91.jpg','92.jpg','93.jpg',
    '94.jpg','95.jpg','96.jpg','97.jpg','98.jpg','99.jpg',
  ];

  // Fisher-Yates shuffle
  for (let i = photoFiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [photoFiles[i], photoFiles[j]] = [photoFiles[j], photoFiles[i]];
  }

  // モバイル: アニメーションなし、ロゴ上に1つの静的バブル写真を表示
  const vw = window.innerWidth;
  if (vw <= 768) {
    const heroContent = document.querySelector('.hero-content');
    const heroTitle = heroContent?.querySelector('h1.hero-title');
    if (!heroContent || !heroTitle) return;

    const img = document.createElement('img');
    img.src = `images/photos/${photoFiles[0]}`;
    img.className = 'photo-bubble photo-bubble-static';
    img.alt = '';
    img.width = 180;
    img.height = 180;
    heroContent.insertBefore(img, heroTitle);
    return;
  }

  // PC: 既存の浮遊バブルアニメーション
  let nLarge, nMedium, nSmall;
  if (vw <= 480) {        // スマホ小: 合計3〜4
    nLarge = 1; nMedium = 1; nSmall = 1 + Math.floor(Math.random() * 2);
  } else if (vw <= 768) { // スマホ大〜タブレット: 合計4〜6
    nLarge = 1; nMedium = 2; nSmall = 1 + Math.floor(Math.random() * 2);
  } else {                // PC: 合計7〜9
    nLarge = 2; nMedium = 3; nSmall = 2 + Math.floor(Math.random() * 2);
  }

  // サイズ枠ごとにランダムなpx値を生成
  const sizeForCategory = (category) => {
    if (category === 'large')  return 150 + Math.floor(Math.random() * 51);  // 150〜200px
    if (category === 'medium') return 90 + Math.floor(Math.random() * 51);   // 90〜140px
    return 40 + Math.floor(Math.random() * 41);                              // 40〜80px (small)
  };

  const plan = [
    ...Array(nLarge).fill('large'),
    ...Array(nMedium).fill('medium'),
    ...Array(nSmall).fill('small'),
  ];
  const selected = photoFiles.slice(0, plan.length);

  // Each bubble holds its position (px) and velocity (px/frame)
  const bubbles = [];

  selected.forEach((filename, i) => {
    const img = document.createElement('img');
    img.src = `images/photos/${filename}`;
    img.className = 'photo-bubble';
    img.loading = 'lazy';
    img.alt = '';

    const size = sizeForCategory(plan[i]);
    const t = (size - 40) / 160; // 0(small/far)〜1(large/near)
    img.style.width = `${size}px`;
    img.style.height = `${size}px`;
    img.style.opacity = (0.45 + t * 0.35).toFixed(2); // small=0.45, large=0.8

    container.appendChild(img);

    const speed = 0.1 + t * 0.35;

    const bubble = {
      el: img,
      size,
      speed,
      x: 0, y: 0,
      vx: 0, vy: 0,
      placed: false,
      hovered: false,
      scale: 1,
      targetScale: 1,
    };

    // PC hover: stop & enlarge to fixed 250px
    const hoverScale = 250 / size;
    img.addEventListener('mouseenter', () => {
      bubble.hovered = true;
      bubble.targetScale = hoverScale;
      img.classList.add('is-hovered');
    });
    img.addEventListener('mouseleave', () => {
      bubble.hovered = false;
      bubble.targetScale = 1;
      img.classList.remove('is-hovered');
    });

    bubbles.push(bubble);
  });

  // Distribute initial directions evenly, with a small random jitter
  const angleStep = (Math.PI * 2) / bubbles.length;
  const angleOffset = Math.random() * Math.PI * 2; // random rotation for the whole set
  bubbles.forEach((b, i) => {
    const angle = angleOffset + angleStep * i + (Math.random() - 0.5) * 0.6;
    b.vx = Math.cos(angle) * b.speed;
    b.vy = Math.sin(angle) * b.speed;
  });

  // Place bubbles with overlap avoidance
  const placeBubbles = (cw, ch) => {
    const placed = [];
    const overlaps = (x, y, size) => {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const r = size / 2;
      for (const p of placed) {
        const dx = cx - p.cx;
        const dy = cy - p.cy;
        const minDist = r + p.r + 10; // 10px margin
        if (dx * dx + dy * dy < minDist * minDist) return true;
      }
      return false;
    };

    bubbles.forEach((b) => {
      let x, y, attempts = 0;
      do {
        x = Math.random() * (cw - b.size);
        y = Math.random() * (ch - b.size);
        attempts++;
      } while (overlaps(x, y, b.size) && attempts < 100);

      b.x = x;
      b.y = y;
      b.placed = true;
      placed.push({ cx: x + b.size / 2, cy: y + b.size / 2, r: b.size / 2 });
    });
  };

  if (prefersReducedMotion) return;

  // Animation loop — bounce off container edges
  let initialized = false;
  const animate = () => {
    const cw = container.clientWidth;
    const ch = container.clientHeight;

    if (!initialized) {
      placeBubbles(cw, ch);
      initialized = true;
    }

    bubbles.forEach((b) => {
      // Smoothly interpolate scale
      b.scale += (b.targetScale - b.scale) * 0.08;

      // Move only when not hovered
      if (!b.hovered) {
        b.x += b.vx;
        b.y += b.vy;

        // Bounce off edges
        if (b.x <= 0) { b.x = 0; b.vx = Math.abs(b.vx); }
        if (b.y <= 0) { b.y = 0; b.vy = Math.abs(b.vy); }
        if (b.x + b.size >= cw) { b.x = cw - b.size; b.vx = -Math.abs(b.vx); }
        if (b.y + b.size >= ch) { b.y = ch - b.size; b.vy = -Math.abs(b.vy); }
      }

      // translate to center, then scale from center
      const cx = b.x + b.size / 2;
      const cy = b.y + b.size / 2;
      b.el.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%) scale(${b.scale.toFixed(3)})`;
    });

    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
};

/* =========================================================
   Boot
   ========================================================= */

/* =================================================================
   10. SCREENSHOT CAROUSEL
   ================================================================= */

const initCarousel = () => {
  const carousel = document.querySelector('.carousel');
  if (!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  const slides = Array.from(track.children);
  const prevBtn = carousel.querySelector('.carousel-btn-prev');
  const nextBtn = carousel.querySelector('.carousel-btn-next');
  const dotsContainer = carousel.querySelector('.carousel-dots');

  let currentIndex = 0;
  let slidesPerView = 3;
  let autoplayTimer = null;

  const updateSlidesPerView = () => {
    slidesPerView = window.innerWidth <= 768 ? 1 : 3;
  };

  const maxIndex = () => Math.max(0, slides.length - slidesPerView);

  const buildDots = () => {
    dotsContainer.innerHTML = '';
    const count = maxIndex() + 1;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `スライド ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  };

  const updateDots = () => {
    dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  };

  const goTo = (index) => {
    currentIndex = Math.max(0, Math.min(index, maxIndex()));
    const pct = currentIndex * (100 / slidesPerView);
    track.style.transform = `translateX(-${pct}%)`;
    updateDots();
  };

  const next = () => goTo(currentIndex >= maxIndex() ? 0 : currentIndex + 1);
  const prev = () => goTo(currentIndex <= 0 ? maxIndex() : currentIndex - 1);

  const startAutoplay = () => {
    stopAutoplay();
    autoplayTimer = setInterval(next, 4000);
  };

  const stopAutoplay = () => {
    if (autoplayTimer) clearInterval(autoplayTimer);
  };

  prevBtn.addEventListener('click', () => { prev(); startAutoplay(); });
  nextBtn.addEventListener('click', () => { next(); startAutoplay(); });

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
      startAutoplay();
    }
  });

  // Pause on hover
  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);

  const handleResize = () => {
    updateSlidesPerView();
    buildDots();
    goTo(Math.min(currentIndex, maxIndex()));
  };

  window.addEventListener('resize', handleResize);
  updateSlidesPerView();
  buildDots();
  startAutoplay();
};


const init = () => {
  initScrollAnimations();
  initNavScroll();
  initSmoothScroll();
  initHeroParallax();
  initCounterAnimation();
  initWaterRipple();
  initHeroPhotoBubbles();
  initMobileMenu();
  initLazyIframes();
  initCarousel();
  injectStructuredData();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
