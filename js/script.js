const $ = (selector) => document.querySelector(selector);

const menuButton = $('.menu-btn');
const navLinks = $('.nav-links');

if (menuButton && navLinks) {
  menuButton.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.textContent = isOpen ? '✕' : '☰';
  });
}

async function loadJSON(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Impossible de charger ${path}`);
  return response.json();
}

function externalLink(url, content, className = '') {
  return `<a class="${className}" href="${url}" target="_blank" rel="noopener noreferrer">${content}</a>`;
}

function renderTagline(items = []) {
  const icons = ['⚡', '🎮', '〰', '☺'];
  const target = $('#hero-tagline');
  if (!target) return;
  target.innerHTML = items.map((text, index) => `<span>${icons[index] || '•'} ${text}</span>`).join('');
}

function renderHeaderSocials(config) {
  const target = $('#header-socials');
  if (!target) return;

  const links = [
    { url: config.twitch.url, label: 'Twitch', text: 'T' },
    { url: config.discords[0]?.url, label: config.discords[0]?.nom, text: 'N' },
    { url: config.discords[1]?.url, label: config.discords[1]?.nom, text: 'S' },
    { url: config.youtube.url, label: 'YouTube', text: '▶' }
  ].filter(item => item.url);

  target.innerHTML = links.map(item =>
    `<a href="${item.url}" target="_blank" rel="noopener noreferrer" aria-label="${item.label}">${item.text}</a>`
  ).join('');
}

function renderHeroLinks(config) {
  const target = $('#hero-links');
  if (!target) return;

  const cards = [
    {
      className: 'twitch-card',
      url: config.twitch.url,
      image: config.twitch.image,
      title: config.twitch.label,
      description: config.twitch.description
    },
    ...config.discords.map((discord) => ({
      className: discord.id === 'norage' ? 'norage-card' : 'syndicate-card',
      url: discord.url,
      image: discord.image,
      title: discord.nom,
      description: discord.description
    })),
    {
      className: 'youtube-card',
      url: config.youtube.url,
      image: config.youtube.image,
      title: config.youtube.label,
      description: config.youtube.description
    }
  ];

  target.innerHTML = cards.map(card => `
    <a class="network-card ${card.className}" href="${card.url}" target="_blank" rel="noopener noreferrer">
      <span class="network-image image-slot" style="background-image:url('${card.image}')" aria-hidden="true"></span>
      <span class="network-copy">
        <strong>${card.title}</strong>
        <small>${card.description}</small>
      </span>
      <span class="network-arrow">→</span>
    </a>
  `).join('');
}

function renderUniverse(home) {
  const title = $('#universe-title');
  const grid = $('#universe-grid');
  if (title) title.textContent = home.universeTitle;
  if (!grid) return;

  grid.innerHTML = home.sections.map(card => `
    <a class="universe-card ${card.id}-card" href="${card.lien}">
      <div class="card-visual image-slot" style="background-image:url('${card.image}')" role="img" aria-label="${card.titre}"></div>
      <div class="card-content">
        <p>${card.kicker}</p>
        <h2>${card.titre}</h2>
        <span>${card.description}</span>
      </div>
    </a>
  `).join('');
}

function renderFindMe(config) {
  const target = $('#find-links');
  if (!target) return;

  const items = [
    { url: config.twitch.url, name: 'Twitch', description: config.twitch.description, icon: 'T', iconClass: 'twitch-icon' },
    { url: config.discords[0]?.url, name: config.discords[0]?.nom, description: config.discords[0]?.description, icon: 'N', iconClass: 'norage-icon' },
    { url: config.discords[1]?.url, name: config.discords[1]?.nom, description: config.discords[1]?.description, icon: 'S', iconClass: 'syndicate-icon' },
    { url: config.youtube.url, name: config.youtube.label, description: config.youtube.description, icon: '▶', iconClass: 'youtube-icon' }
  ].filter(item => item.url);

  target.innerHTML = items.map(item => `
    <a href="${item.url}" target="_blank" rel="noopener noreferrer">
      <span class="find-icon ${item.iconClass}">${item.icon}</span>
      <span><strong>${item.name}</strong><small>${item.description}</small></span>
      <b>→</b>
    </a>
  `).join('');
}

function setupTwitch(config) {
  const twitchPlayer = $('#twitch-player');
  const liveButton = $('#live-button');
  const liveTitle = $('#live-title');

  if (liveButton) liveButton.href = config.twitch.url;
  if (liveTitle) liveTitle.textContent = `La chaîne ${config.twitch.channel}`;
  if (!twitchPlayer) return;

  const parentDomain = window.location.hostname || 'localhost';
  const params = new URLSearchParams({
    channel: config.twitch.channel,
    parent: parentDomain,
    autoplay: 'false',
    muted: 'true'
  });
  twitchPlayer.src = `https://player.twitch.tv/?${params.toString()}`;
}

async function initSite() {
  try {
    const [config, home] = await Promise.all([
      loadJSON('data/config.json'),
      loadJSON('data/home.json')
    ]);

    document.title = `${config.site.pseudo} — Gaming & rétro-gaming`;
    $('#header-logo').src = config.site.logo;
    $('#hero-banner').src = config.site.banner;
    $('#copyright').textContent = config.site.copyright;

    const findMeArt = $('#find-me-art');
    if (findMeArt && config.site.findMeImage) {
      findMeArt.style.backgroundImage = `url('${config.site.findMeImage}')`;
    }

    const twitchWrap = document.querySelector('.twitch-frame-wrap');
    if (twitchWrap && config.site.offlineImage) {
      twitchWrap.style.backgroundImage = `url('${config.site.offlineImage}')`;
    }

    renderTagline(config.site.slogan);
    renderHeaderSocials(config);
    renderHeroLinks(config);
    renderUniverse(home);
    setupTwitch(config);
  } catch (error) {
    console.error(error);
    const heroLinks = $('#hero-links');
    if (heroLinks) {
      heroLinks.innerHTML = '<p class="data-error">Les données du site n’ont pas pu être chargées. Lance le site avec GitHub Pages ou Live Server.</p>';
    }
  }
}

initSite();

// Filtres de la page Collections (conservés pour les pages existantes).
const filterButtons = document.querySelectorAll('.filter-btn');
const collectionCards = document.querySelectorAll('.collection-card');
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;
    collectionCards.forEach(card => {
      card.style.display = filter === 'all' || card.dataset.category === filter ? '' : 'none';
    });
  });
});
