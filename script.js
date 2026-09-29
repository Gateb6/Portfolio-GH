document.addEventListener('DOMContentLoaded', () => {
  /* Thème clair / sombre */
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');

  function applyTheme(theme) {
    root.dataset.theme = theme;
    toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    toggle.setAttribute('aria-label', theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre');
  }
  applyTheme(root.dataset.theme || 'dark');

  toggle.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* Lien actif dans la navigation */
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.links a');

  function setActive(id) {
    navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
  }

  function scrollSpy() {
    const pos = window.scrollY + 80;
    let current = sections[0].id;
    sections.forEach(s => { if (pos >= s.offsetTop) current = s.id; });
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
      current = sections[sections.length - 1].id;
    }
    setActive(current);
  }

  // Après un clic sur le menu, on garde le lien cliqué jusqu'à la fin du défilement
  // (les dernières sections ne peuvent pas toujours remonter tout en haut de l'écran)
  let clicked = null, timer;
  navLinks.forEach(l => l.addEventListener('click', () => {
    clicked = l.getAttribute('href').slice(1);
    setActive(clicked);
    clearTimeout(timer);
    timer = setTimeout(() => { clicked = null; }, 1200);
  }));

  window.addEventListener('scroll', () => {
    if (clicked) {
      clearTimeout(timer);
      timer = setTimeout(() => { clicked = null; }, 150);
      return;
    }
    scrollSpy();
  }, { passive: true });
  scrollSpy();

  /* Veille cybersécurité (flux RSS) */
  const container = document.getElementById('veilles-news');
  const loading = document.getElementById('veilles-loading');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rssUrl = encodeURIComponent('https://feeds.feedburner.com/TheHackersNews');

  fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`)
    .then(res => res.json())
    .then(data => {
      loading.style.display = 'none';
      if (!data.items || !data.items.length) {
        container.innerHTML = '<p>Aucun article récent trouvé.</p>';
        return;
      }
      data.items.slice(0, 6).forEach(item => {
        const img = (item.enclosure && item.enclosure.link) || item.thumbnail;
        const date = item.pubDate ? new Date(item.pubDate).toLocaleDateString('fr-FR') : '';
        const card = document.createElement('article');
        card.className = 'card';
        card.innerHTML = `
          ${img ? `<img src="${esc(img)}" alt="" loading="lazy" style="width:100%;border-radius:8px;margin-bottom:8px;">` : ''}
          <h3>${esc(item.title)}</h3>
          <p>${date}</p>
          <a href="${esc(item.link)}" target="_blank" rel="noopener">Lire l'article</a>`;
        container.appendChild(card);
      });
    })
    .catch(err => {
      loading.textContent = 'Impossible de charger les actualités pour le moment.';
      console.error(err);
    });
});