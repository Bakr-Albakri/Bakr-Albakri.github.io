// ==========================================
// Page loader
// ==========================================
window.addEventListener('load', () => {
  const loader = document.querySelector('.page-loader');
  if (loader) {
    setTimeout(() => loader.classList.add('loaded'), 600);
  }
  // Trigger header datastream glow once on load
  const ds = document.querySelector('.header-datastream');
  if (ds) {
    setTimeout(() => ds.classList.add('glow-pass'), 800);
  }
});

// ==========================================
// Refs
// ==========================================
const siteHeader = document.querySelector('.site-header');
const scrollUpBtn = document.querySelector('.scroll-up-btn');
const scrollDownBtn = document.querySelector('.scroll-down-btn');
const spaSections = document.querySelectorAll('.spa-section');
const bottomNavItems = document.querySelectorAll('.bottom-nav-item');

// Scroll container: body has overflow-y: scroll and scroll-snap
const scrollContainer = document.body;

function getScrollY() {
  return scrollContainer.scrollTop;
}

// ==========================================
// Smooth header: dark glass → deeper dark
// ==========================================
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp01(v) { return Math.max(0, Math.min(1, v)); }

const H_START = 20;
const H_END = 250;

function onScroll() {
  const y = getScrollY();
  const ht = clamp01((y - H_START) / (H_END - H_START));

  if (siteHeader) {
    const v = Math.round(lerp(9, 6, ht));
    const a = lerp(0.85, 0.97, ht).toFixed(3);
    siteHeader.style.background = `rgba(${v},${v},${Math.round(lerp(11, 8, ht))},${a})`;

    const borderA = lerp(0.06, 0.02, ht).toFixed(3);
    siteHeader.style.borderBottomColor = `rgba(104,137,255,${borderA})`;

    const shadowA = (0.3 * ht).toFixed(2);
    siteHeader.style.boxShadow = ht > 0.05
      ? `0 1px 30px rgba(0,0,0,${shadowA})`
      : 'none';

    siteHeader.classList.toggle('scrolled', ht > 0.5);
  }

  // Scroll nav buttons: show/hide based on position
  if (scrollUpBtn && scrollDownBtn) {
    const atTop = y < 300;
    const atBottom = (window.innerHeight + y) >= scrollContainer.scrollHeight - 100;
    scrollUpBtn.classList.toggle('hidden', atTop);
    scrollDownBtn.classList.toggle('hidden', atBottom);
  }

  updateActiveSection();
}

// ==========================================
// Dynamic coords — each section has a coordinate
// ==========================================
const coordLatEl = document.getElementById('coord-lat');
const coordLngEl = document.getElementById('coord-lng');

const sectionCoords = {
  'home':         { lat: 24.7136, lng: 46.6753 }, // Riyadh
  'about':        { lat: 24.7255, lng: 46.6890 },
  'experience':   { lat: 24.6877, lng: 46.7219 },
  'education':    { lat: 44.9778, lng: -93.2650 }, // Minnesota
  'skills':       { lat: 24.7394, lng: 46.6571 },
  'portfolio':    { lat: 24.7011, lng: 46.6845 },
  'cover-letter': { lat: 24.7480, lng: 46.6326 },
  'contact':      { lat: 24.7136, lng: 46.6753 }  // Back to Riyadh
};

let currentCoordLat = 24.7136;
let currentCoordLng = 46.6753;
let targetCoordLat = 24.7136;
let targetCoordLng = 46.6753;
let coordAnimId = null;

function animateCoords() {
  const speed = 0.08;
  currentCoordLat += (targetCoordLat - currentCoordLat) * speed;
  currentCoordLng += (targetCoordLng - currentCoordLng) * speed;

  if (coordLatEl && coordLngEl) {
    const isAr = document.documentElement.getAttribute('lang') === 'ar';
    const latDir = currentCoordLat >= 0 ? (isAr ? 'ش' : 'N') : (isAr ? 'ج' : 'S');
    const lngDir = currentCoordLng >= 0 ? (isAr ? 'شر' : 'E') : (isAr ? 'غ' : 'W');
    coordLatEl.textContent = Math.abs(currentCoordLat).toFixed(4) + '°' + latDir;
    coordLngEl.textContent = Math.abs(currentCoordLng).toFixed(4) + '°' + lngDir;
  }

  // Keep animating if not close enough
  if (Math.abs(targetCoordLat - currentCoordLat) > 0.0001 ||
      Math.abs(targetCoordLng - currentCoordLng) > 0.0001) {
    coordAnimId = requestAnimationFrame(animateCoords);
  } else {
    coordAnimId = null;
  }
}

function setTargetCoords(sectionId) {
  const coords = sectionCoords[sectionId];
  if (!coords) return;
  targetCoordLat = coords.lat;
  targetCoordLng = coords.lng;
  if (!coordAnimId) {
    coordAnimId = requestAnimationFrame(animateCoords);
  }
}

function updateActiveSection() {
  const y = getScrollY();
  const scrollPos = y + window.innerHeight * 0.5;
  let currentId = '';

  spaSections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    if (scrollPos >= top && scrollPos < top + height) {
      currentId = section.getAttribute('id');
    }
  });

  // Handle last section
  if ((window.innerHeight + y) >= scrollContainer.scrollHeight - 50) {
    const last = spaSections[spaSections.length - 1];
    if (last) currentId = last.getAttribute('id');
  }

  if (!currentId) return;

  // Update coords
  setTargetCoords(currentId);

  bottomNavItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-section') === currentId) {
      item.classList.add('active');
    }
  });
}

// rAF-throttled scroll — listen on body (the scroll container)
let scrollTicking = false;
scrollContainer.addEventListener('scroll', () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(() => {
      onScroll();
      scrollTicking = false;
    });
    scrollTicking = true;
  }
});
onScroll();

// Scroll nav button clicks
function getCurrentSectionIndex() {
  const y = getScrollY();
  const mid = y + window.innerHeight * 0.5;
  for (let i = spaSections.length - 1; i >= 0; i--) {
    if (mid >= spaSections[i].offsetTop) return i;
  }
  return 0;
}

if (scrollUpBtn) {
  scrollUpBtn.addEventListener('click', () => {
    const idx = getCurrentSectionIndex();
    if (idx > 0) {
      scrollContainer.scrollTo({ top: spaSections[idx - 1].offsetTop, behavior: 'smooth' });
    } else {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

if (scrollDownBtn) {
  scrollDownBtn.addEventListener('click', () => {
    const idx = getCurrentSectionIndex();
    if (idx < spaSections.length - 1) {
      scrollContainer.scrollTo({ top: spaSections[idx + 1].offsetTop, behavior: 'smooth' });
    }
  });
}

// ==========================================
// Smooth scroll — scrolls to section top
// CSS scroll-snap on body handles the snapping
// ==========================================

function scrollToSection(targetEl, isHome) {
  if (isHome) {
    scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  scrollContainer.scrollTo({
    top: targetEl.offsetTop,
    behavior: 'smooth'
  });
}

// Anchor link clicks
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    if (targetId === '#') return;

    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      e.preventDefault();
      scrollToSection(targetEl, targetId === '#home');
    }
  });
});

// ==========================================
// Reveal on scroll — IntersectionObserver
// ==========================================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.05,
  rootMargin: '0px 0px -20px 0px'
});

// Mark elements for reveal
const revealSelectors = [
  '.timeline-item', '.edu-card', '.skill-card',
  '.bento-card', '.project-card', '.contact-card',
  '.competency-item', '.soft-skill-tag',
  '.about-grid', '.personal-details', '.languages-section',
  '.cover-letter-content', '.section-header',
  '.hero-tag', '.hero-title', '.hero-desc', '.hero-actions',
  '.hero-divider', '.hero-scroll-indicator',
  '.contact-text', '.contact-email-btn',
  '.about-skills-inline'
];

document.querySelectorAll(revealSelectors.join(', ')).forEach(el => {
  el.classList.add('reveal-element');
  revealObserver.observe(el);
});

// ==========================================
// Floating particles in hero (subtle dots)
// ==========================================
(function createParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;

  for (let i = 0; i < 30; i++) {
    const dot = document.createElement('div');
    const size = Math.random() * 3 + 1;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const duration = Math.random() * 6 + 4;
    const delay = Math.random() * 4;
    const isAccent = Math.random() > 0.7;

    dot.style.cssText = `
      position: absolute;
      width: ${size}px; height: ${size}px;
      left: ${x}%; top: ${y}%;
      background: ${isAccent ? 'rgba(255,255,255,0.15)' : 'rgba(104,137,255,0.2)'};
      border-radius: 50%;
      animation: particleFloat ${duration}s ease-in-out ${delay}s infinite;
    `;
    container.appendChild(dot);
  }

  // Add the animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes particleFloat {
      0%, 100% { transform: translate(0, 0); opacity: 0.3; }
      25% { transform: translate(${Math.random() > 0.5 ? '' : '-'}10px, -15px); opacity: 0.6; }
      50% { transform: translate(${Math.random() > 0.5 ? '' : '-'}5px, -8px); opacity: 0.2; }
      75% { transform: translate(${Math.random() > 0.5 ? '' : '-'}12px, -20px); opacity: 0.5; }
    }
  `;
  document.head.appendChild(style);
})();

// ==========================================
// Dynamic copyright year
// ==========================================
const copyrightYearEl = document.getElementById('copyright-year');
if (copyrightYearEl) {
  copyrightYearEl.textContent = new Date().getFullYear();
}

// ==========================================
// Color picker — dots in header change site palette
// ==========================================
(function colorPicker() {
  function hexToRgb(hex) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return r + ',' + g + ',' + b;
  }

  document.querySelectorAll('.brand-color-dot input[type="color"]').forEach(function(input) {
    // Prevent clicks from bubbling to the link
    input.addEventListener('click', function(e) { e.stopPropagation(); });

    input.addEventListener('input', function() {
      var target = input.getAttribute('data-target');
      var hex = input.value;
      var rgb = hexToRgb(hex);
      var root = document.documentElement;

      if (target === 'secondary') {
        root.style.setProperty('--color-secondary', hex);
        root.style.setProperty('--glow-secondary', 'rgba(' + rgb + ',0.12)');
      } else if (target === 'accent') {
        root.style.setProperty('--color-accent', hex);
        root.style.setProperty('--color-primary', hex);
        root.style.setProperty('--glow-accent', 'rgba(' + rgb + ',0.06)');
      }

      // Update the dot's background to match
      input.parentElement.style.background = hex;
    });
  });
})();

// ==========================================
// Font size switcher — S / M / L with
// screen-size-aware defaults
// ==========================================
(function fontSizeSwitcher() {
  var scales = { small: 0.85, medium: 1, large: 1.12 };
  var btns = document.querySelectorAll('.font-size-btn');
  if (!btns.length) return;

  // Pick smart default based on screen width
  function getDefaultSize() {
    var w = window.innerWidth;
    if (w <= 767) return 'small';
    if (w <= 1024) return 'medium';
    return 'large';
  }

  function setSize(size) {
    var scale = scales[size] || 1;
    document.documentElement.style.setProperty('--font-scale', scale);
    btns.forEach(function(b) {
      b.classList.toggle('active', b.getAttribute('data-size') === size);
    });
  }

  // Set default on load
  setSize(getDefaultSize());

  // Click handlers
  btns.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      setSize(btn.getAttribute('data-size'));
    });
  });
})();

// ==========================================
// Language switcher — Arabic (default) / English
// ==========================================
(function langSwitcher() {
  var btns = document.querySelectorAll('.lang-btn');
  if (!btns.length) return;

  var currentLang = localStorage.getItem('site-lang') || 'en';

  function swapContent(lang) {
    var root = document.documentElement;

    // Set dir and lang on <html>
    root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    root.setAttribute('lang', lang);

    // Update <title>
    var titleEl = document.querySelector('title');
    if (titleEl && titleEl.dataset[lang]) {
      document.title = titleEl.dataset[lang];
    }

    // Translate plain text elements
    document.querySelectorAll('[data-en][data-ar]').forEach(function(el) {
      el.textContent = el.dataset[lang];
    });

    // Translate elements with inner HTML (icons + text)
    document.querySelectorAll('[data-en-html][data-ar-html]').forEach(function(el) {
      el.innerHTML = el.dataset[lang + 'Html'];
    });

    // Translate aria-labels
    document.querySelectorAll('[data-en-aria][data-ar-aria]').forEach(function(el) {
      el.setAttribute('aria-label', el.dataset[lang + 'Aria']);
    });

    // Translate title attributes
    document.querySelectorAll('[data-en-title][data-ar-title]').forEach(function(el) {
      el.setAttribute('title', el.dataset[lang + 'Title']);
    });

    // Re-set the copyright year (it gets cleared by innerHTML swap)
    var yearEl = document.getElementById('copyright-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Update button active states
    btns.forEach(function(b) {
      b.classList.toggle('active', b.getAttribute('data-lang') === lang);
    });

    // Save preference
    localStorage.setItem('site-lang', lang);
    currentLang = lang;
  }

  function applyLang(lang, animate) {
    if (!animate) {
      swapContent(lang);
      return;
    }

    var body = document.body;
    var dirClass = 'lang-to-' + lang;

    // Enable layout transition on boxes
    body.classList.add('lang-morph');

    // Phase 1: slide text out (direction depends on target language)
    body.classList.add('lang-slide-out', dirClass);

    setTimeout(function() {
      // Phase 2: swap content & direction while text is invisible
      swapContent(lang);

      // Phase 3: prepare slide-in starting position, then animate in
      body.classList.remove('lang-slide-out');
      body.classList.add('lang-slide-in');

      // Replay header datastream glow
      var ds = document.querySelector('.header-datastream');
      if (ds) {
        ds.classList.remove('glow-pass');
        void ds.offsetWidth;
        ds.classList.add('glow-pass');
      }

      // Clean up all transition classes
      setTimeout(function() {
        body.classList.remove('lang-slide-in', 'lang-morph', dirClass);
      }, 450);
    }, 250);
  }

  // Apply on load (no animation)
  applyLang(currentLang, false);

  // Click handlers
  btns.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var lang = btn.getAttribute('data-lang');
      if (lang !== currentLang) {
        applyLang(lang, true);
      }
    });
  });
})();
