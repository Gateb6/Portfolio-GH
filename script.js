document.addEventListener('DOMContentLoaded', () => {
  const competenceCards = document.querySelectorAll('.competence-card');

  competenceCards.forEach(card => {
    card.addEventListener('click', () => {
      const tooltip = card.querySelector('.tooltip');
      // fermer tous les autres tooltips
      document.querySelectorAll('.competence-card .tooltip').forEach(t => {
        if (t !== tooltip) t.style.display = 'none';
      });
      // toggle du tooltip cliqué
      if (tooltip.style.display === 'block') {
        tooltip.style.display = 'none';
      } else {
        tooltip.textContent = card.dataset.description;
        tooltip.style.display = 'block';
      }
    });
  });
});

const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('nav a');

function scrollSpy() {
  const scrollPosition = window.scrollY + 60; // offset pour tenir compte du header
  let current = sections[0].getAttribute('id'); // par défaut : Accueil

  sections.forEach(section => {
    if (scrollPosition >= section.offsetTop) {
      current = section.getAttribute('id');
    }
  });

  // Vérifier si on est tout en bas pour activer la dernière section (Contact)
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
    current = sections[sections.length - 1].getAttribute('id');
  }

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', scrollSpy);
window.addEventListener('load', scrollSpy);


document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('veilles-news');
  const loading = document.getElementById('veilles-loading');

  // Flux RSS francophone (portail RGPD / SSI par exemple)
  const rssUrl = encodeURIComponent('https://feeds.feedburner.com/TheHackersNews');
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;


  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      loading.style.display = 'none';
      if (data.items && data.items.length > 0) {
        data.items.slice(0, 6).forEach(item => {
          const card = document.createElement('div');
          card.className = 'card';

          // Essayer d'extraire une image
          let imageHtml = '';
          if (item.enclosure && item.enclosure.link) {
            // Certains flux intègrent l'image dans "enclosure"
            imageHtml = `<img src="${item.enclosure.link}" alt="${item.title}" style="width:100%; border-radius:8px; margin-bottom:8px;">`;
          } else if (item.thumbnail) {
            // Certains convertisseurs ajoutent une miniature
            imageHtml = `<img src="${item.thumbnail}" alt="${item.title}" style="width:100%; border-radius:8px; margin-bottom:8px;">`;
          }

          card.innerHTML = `
            ${imageHtml}
            <h3>${item.title}</h3>
            <p>${item.pubDate ? new Date(item.pubDate).toLocaleDateString('fr-FR') : ''}</p>
            <a href="${item.link}" target="_blank">Lire l'article</a>
          `;
          container.appendChild(card);
        });
      } else {
        container.innerHTML = '<p>Aucun article récent trouvé.</p>';
      }
    })
    .catch(err => {
      loading.textContent = "Erreur de chargement des actualités.";
      console.error(err);
    });
});
