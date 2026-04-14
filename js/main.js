/* =========================================
   THE PIONEER — main.js
   ========================================= */

// --- Helpers ---
function meta(author, date, readTime) {
  return `
    <div class="article-meta">
      <span class="author">${author}</span>
      <span class="sep">&bull;</span>
      <time>${date}</time>
      <span class="sep">&bull;</span>
      <span class="read-time">${readTime}</span>
    </div>`;
}

function sectionDivider(label) {
  return `<div class="section-divider"><span>${label}</span></div>`;
}

// --- Render: Branding ---
function renderBranding() {
  document.title = SITE.name;
  const siteName = document.getElementById('siteName');
  siteName.innerHTML = `<img src="images/logo_dark.png" alt="${SITE.name}" class="site-logo" id="siteLogo" />`;
}

function updateLogo(theme) {
  const logo = document.getElementById('siteLogo');
  if (logo) logo.src = theme === 'light' ? 'images/logo_light.png' : 'images/logo_dark.png';
}

// --- Render: Hero ---
function renderHero() {
  const h = SITE.articles[0];
  return `
    <section class="hero reveal">
      <article class="hero-lead" onclick="location.href='article.html?slug=${h.slug}'">
        <div class="hero-img-wrap">
          <img src="${h.image}" alt="${h.imageAlt}" class="hero-img" loading="lazy" />
          <div class="hero-img-overlay"></div>
        </div>
        <div class="hero-body">
          <h1 class="hero-title">${h.title}</h1>
          <p class="hero-excerpt">${h.excerpt}</p>
          ${meta(h.author, h.date, h.readTime)}
        </div>
      </article>
    </section>`;
}

// --- Render: Article grid with pagination ---
const PAGE_SIZE = 6;
let currentPage = 1;

function renderCard(a, i) {
  return `
    <article class="card reveal-delay-${i % 4}" onclick="location.href='article.html?slug=${a.slug}'">
      <div class="card-img-wrap">
        <img src="${a.image}" alt="${a.imageAlt}" class="card-img" loading="lazy" />
      </div>
      <div class="card-body">
        <h2>${a.title}</h2>
        <p class="card-excerpt">${a.excerpt}</p>
        ${meta(a.author, a.date, a.readTime)}
      </div>
    </article>`;
}

function renderArticleGrid() {
  return `
    <section class="article-grid" id="articleGrid"></section>
    <div class="pagination" id="pagination"></div>`;
}

function loadPage(page) {
  const grid = document.getElementById('articleGrid');
  const pagination = document.getElementById('pagination');
  const allExceptHero = SITE.articles.slice(1);
  const total = allExceptHero.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const slice = allExceptHero.slice(start, start + PAGE_SIZE);

  // Fade out, swap content, fade in
  grid.style.opacity = '0';
  grid.style.transform = 'translateY(10px)';

  setTimeout(() => {
    grid.innerHTML = slice.map((a, i) => renderCard(a, i)).join('');
    grid.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
    grid.style.opacity = '1';
    grid.style.transform = 'translateY(0)';

    // Lazy image fade-in for new cards
    grid.querySelectorAll('img[loading="lazy"]').forEach(img => {
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.4s ease';
      const show = () => { img.style.opacity = '1'; };
      if (img.complete) show(); else img.addEventListener('load', show);
    });

    // Re-observe new cards for reveal
    grid.querySelectorAll('.card').forEach(el => observer.observe(el));
  }, 200);

  // Pagination controls
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  let buttons = '';
  for (let p = 1; p <= totalPages; p++) {
    buttons += `<button class="page-btn ${p === page ? 'active' : ''}" onclick="goToPage(${p})">${p}</button>`;
  }
  pagination.innerHTML = `
    <button class="page-btn page-prev" onclick="goToPage(${page - 1})" ${page === 1 ? 'disabled' : ''}>&#8592;</button>
    ${buttons}
    <button class="page-btn page-next" onclick="goToPage(${page + 1})" ${page === totalPages ? 'disabled' : ''}>&#8594;</button>
  `;

  currentPage = page;
}

function goToPage(page) {
  const total = SITE.articles.slice(1).length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (page < 1 || page > totalPages) return;
  // Scroll up to the grid smoothly
  document.getElementById('articleGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => loadPage(page), 300);
}

// --- Render: Footer ---
function renderFooter() {
  const footer = document.getElementById('siteFooter');
  footer.innerHTML = `
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="footer-logo">${SITE.name}</div>
        <p class="footer-tagline">${SITE.tagline}</p>
      </div>
    </div>
    <div class="footer-bottom">
      &copy; ${new Date().getFullYear()} ${SITE.name}. All rights reserved.
    </div>`;
}

// --- Render: Main ---
function renderMain() {
  document.getElementById('siteMain').innerHTML = `
    ${renderHero()}
    ${sectionDivider('More Articles')}
    ${renderArticleGrid()}
  `;
}

// =========================================
// Interactions
// =========================================

// Reading progress bar
const progressBar = document.getElementById('progressBar');
window.addEventListener('scroll', () => {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0) + '%';
  document.getElementById('siteHeader').classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// Theme toggle
const html = document.documentElement;
html.setAttribute('data-theme', localStorage.getItem('pioneer-theme') || 'dark');
document.getElementById('themeToggle').addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('pioneer-theme', next);
  updateLogo(next);
});

// Search overlay
const searchOverlay = document.getElementById('searchOverlay');
const searchInput   = document.getElementById('searchInput');

function openSearch() {
  searchOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => searchInput.focus(), 80);
}
function closeSearch() {
  searchOverlay.classList.remove('open');
  document.body.style.overflow = '';
  searchInput.value = '';
}

document.getElementById('searchBtn').addEventListener('click', openSearch);
document.getElementById('searchClose').addEventListener('click', closeSearch);
searchOverlay.addEventListener('click', e => { if (e.target === searchOverlay) closeSearch(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSearch();
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
});

// Scroll reveal
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });

// --- Boot ---
renderBranding();
renderMain();
renderFooter();
loadPage(1);
updateLogo(html.getAttribute('data-theme'));

document.querySelectorAll('.reveal, .reveal-delay-0, .reveal-delay-1, .reveal-delay-2, .reveal-delay-3')
  .forEach(el => observer.observe(el));

// Click ripple
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `@keyframes ripple-anim { to { transform: scale(1); opacity: 0; } }`;
document.head.appendChild(rippleStyle);

function createRipple(e, el) {
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  const r = document.createElement('span');
  Object.assign(r.style, {
    position: 'absolute', borderRadius: '50%',
    width: size + 'px', height: size + 'px',
    left: (e.clientX - rect.left - size / 2) + 'px',
    top:  (e.clientY - rect.top  - size / 2) + 'px',
    background: 'rgba(255,255,255,0.04)',
    transform: 'scale(0)',
    animation: 'ripple-anim 0.5s ease-out forwards',
    pointerEvents: 'none',
  });
  el.appendChild(r);
  setTimeout(() => r.remove(), 550);
}

document.querySelectorAll('.card, .hero-lead')
  .forEach(el => el.addEventListener('click', e => createRipple(e, el)));

// Lazy image fade-in
document.querySelectorAll('img[loading="lazy"]').forEach(img => {
  img.style.opacity = '0';
  img.style.transition = 'opacity 0.5s ease';
  const show = () => { img.style.opacity = '1'; };
  if (img.complete) show(); else img.addEventListener('load', show);
});
