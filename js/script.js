const menuButton = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');

if (menuButton && navLinks) {
  menuButton.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.textContent = isOpen ? '✕' : '☰';
  });
}

// Le lecteur Twitch choisit automatiquement le bon domaine parent.
// Cela permet son fonctionnement sur GitHub Pages et sur un serveur local.
const twitchPlayer = document.querySelector('#twitch-player');
if (twitchPlayer) {
  const parentDomain = window.location.hostname || 'localhost';
  const params = new URLSearchParams({
    channel: 'norage_gaming',
    parent: parentDomain,
    autoplay: 'false',
    muted: 'true'
  });
  twitchPlayer.src = `https://player.twitch.tv/?${params.toString()}`;
}
