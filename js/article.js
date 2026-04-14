/* =========================================
   THE PIONEER — article.js
   ========================================= */

// --- Find article by slug ---
const params = new URLSearchParams(window.location.search);
const slug = params.get('slug');

const article = SITE.articles.find(a => a.slug === slug);

// --- Branding ---
document.getElementById('siteName').textContent = SITE.name;

// --- Theme ---
const html = document.documentElement;
html.setAttribute('data-theme', localStorage.getItem('pioneer-theme') || 'dark');
document.getElementById('themeToggle').addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('pioneer-theme', next);
});

// --- Render article or 404 ---
const main = document.getElementById('articleMain');

if (!article) {
  document.title = 'Not Found — ' + SITE.name;
  main.innerHTML = `
    <div class="not-found">
      <h1>Article not found</h1>
      <p>This article may have moved or been removed.</p>
      <a href="index.html">&larr; Back to home</a>
    </div>`;
} else {
  document.title = article.title + ' — ' + SITE.name;

  main.innerHTML = `
    <a href="index.html" class="article-back">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
      Back
    </a>

    <header class="article-header">
      <h1 class="article-title">${article.title}</h1>
      <p class="article-excerpt">${article.excerpt}</p>
      <div class="article-meta-bar">
        <span class="author">${article.author}</span>
        <span class="sep">&bull;</span>
        <time>${article.date}</time>
        <span class="sep">&bull;</span>
        <span>${article.readTime}</span>
      </div>
    </header>

    <img
      src="${article.image}"
      alt="${article.imageAlt}"
      class="article-hero-img"
      id="articleHeroImg"
    />

    <div class="article-body">${article.body}</div>

    <div class="article-end">${SITE.name}</div>
  `;

  // Fade in image on load
  const img = document.getElementById('articleHeroImg');
  if (img.complete) {
    img.classList.add('loaded');
  } else {
    img.addEventListener('load', () => img.classList.add('loaded'));
  }
}

// --- Footer ---
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

// --- Reading progress bar ---
const progressBar = document.getElementById('progressBar');
window.addEventListener('scroll', () => {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0) + '%';
  document.getElementById('siteHeader').classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });
