(() => {
  const $c = (s) => document.querySelector(s);
  const state = {
    data: null,
    family: 'Tout',
    platformQuery: '',
    platform: null,
    gameQuery: '',
    region: 'all',
    gameState: 'all',
    sort: 'az',
    page: 1
  };

  const familyOrder = ['Tout', 'Sony', 'Nintendo', 'SEGA', 'Microsoft', 'Ordinateurs', 'Autres'];

  function escapeHTML(value = '') {
    return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }

  function gameCount(platformId) {
    return state.data.jeux.filter(g => g.plateforme === platformId).length;
  }

  function renderFamilyFilters() {
    const familiesInData = new Set(state.data.plateformes.map(p => p.famille));
    const families = familyOrder.filter(f => f === 'Tout' || familiesInData.has(f));
    $c('#family-filters').innerHTML = families.map(f => `
      <button class="family-btn ${state.family === f ? 'active' : ''}" data-family="${escapeHTML(f)}">${escapeHTML(f)}</button>
    `).join('');

    document.querySelectorAll('.family-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.family = btn.dataset.family;
        renderFamilyFilters();
        renderPlatforms();
      });
    });
  }

  function renderPlatforms() {
    const q = state.platformQuery.trim().toLowerCase();
    const list = state.data.plateformes.filter(p => {
      const familyOK = state.family === 'Tout' || p.famille === state.family;
      const queryOK = !q || p.nom.toLowerCase().includes(q) || p.famille.toLowerCase().includes(q);
      return familyOK && queryOK;
    });

    const target = $c('#platform-grid');
    if (!list.length) {
      target.innerHTML = '<p class="collection-empty">Aucune plateforme trouvée.</p>';
      return;
    }

    target.innerHTML = list.map(p => {
      const count = gameCount(p.id);
      return `
        <button class="platform-card" data-platform="${escapeHTML(p.id)}" type="button">
          <span class="platform-visual" style="background-image:url('${escapeHTML(p.image)}')">
            <b>${escapeHTML(p.labelCourt || p.nom)}</b>
          </span>
          <span class="platform-info">
            <small>${escapeHTML(p.famille)}</small>
            <strong>${escapeHTML(p.nom)}</strong>
            <span>${count} ${count > 1 ? 'jeux' : 'jeu'}</span>
          </span>
          <i>Voir la collection →</i>
        </button>
      `;
    }).join('');

    document.querySelectorAll('.platform-card').forEach(card => {
      card.addEventListener('click', () => openPlatform(card.dataset.platform));
    });
  }

  function openPlatform(platformId) {
    state.platform = state.data.plateformes.find(p => p.id === platformId);
    state.page = 1;
    state.gameQuery = '';
    state.region = 'all';
    state.gameState = 'all';
    state.sort = 'az';

    $c('#game-search').value = '';
    $c('#region-filter').value = 'all';
    $c('#state-filter').value = 'all';
    $c('#sort-games').value = 'az';

    $c('#platform-view').hidden = true;
    $c('#games-view').hidden = false;
    $c('#catalog-family').textContent = state.platform.famille;
    $c('#catalog-title').textContent = state.platform.nom;
    renderGames();
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  function filteredGames() {
    let list = state.data.jeux.filter(g => g.plateforme === state.platform.id);
    const q = state.gameQuery.trim().toLowerCase();
    if (q) list = list.filter(g => g.titre.toLowerCase().includes(q));
    if (state.region !== 'all') list = list.filter(g => g.region === state.region);
    if (state.gameState !== 'all') list = list.filter(g => g.etat === state.gameState);
    list.sort((a,b) => a.titre.localeCompare(b.titre, 'fr', {numeric:true}) * (state.sort === 'az' ? 1 : -1));
    return list;
  }

  function renderGames() {
    const list = filteredGames();
    const perPage = state.data.parPage || 30;
    const pages = Math.max(1, Math.ceil(list.length / perPage));
    if (state.page > pages) state.page = pages;
    const start = (state.page - 1) * perPage;
    const visible = list.slice(start, start + perPage);

    const totalPlatform = gameCount(state.platform.id);
    $c('#catalog-count').textContent = `${totalPlatform} jeu${totalPlatform > 1 ? 'x' : ''} dans la collection • ${list.length} affiché${list.length > 1 ? 's' : ''}`;
    $c('#demo-notice').textContent = state.data.note || '';

    $c('#games-grid').innerHTML = visible.length ? visible.map(g => `
      <article class="game-card">
        <div class="game-cover" style="background-image:url('${escapeHTML(g.image)}')">
          <span>${escapeHTML(state.platform.labelCourt || state.platform.nom)}</span>
        </div>
        <div class="game-info">
          <h3>${escapeHTML(g.titre)}</h3>
          <div class="game-tags">
            <span>${escapeHTML(g.region || '—')}</span>
            <span>${escapeHTML(g.etat || '—')}</span>
          </div>
        </div>
      </article>
    `).join('') : '<p class="collection-empty">Aucun jeu ne correspond à ces filtres.</p>';

    renderPagination(pages);
  }

  function renderPagination(pages) {
    const target = $c('#pagination');
    if (pages <= 1) { target.innerHTML = ''; return; }

    let nums = [];
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - state.page) <= 2) nums.push(i);
    }
    nums = [...new Set(nums)];

    let html = `<button ${state.page === 1 ? 'disabled' : ''} data-page="${state.page - 1}">‹</button>`;
    let prev = 0;
    nums.forEach(n => {
      if (prev && n - prev > 1) html += '<span>…</span>';
      html += `<button class="${n === state.page ? 'active' : ''}" data-page="${n}">${n}</button>`;
      prev = n;
    });
    html += `<button ${state.page === pages ? 'disabled' : ''} data-page="${state.page + 1}">›</button>`;
    target.innerHTML = html;

    target.querySelectorAll('button[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        state.page = Number(btn.dataset.page);
        renderGames();
        $c('#catalog-title').scrollIntoView({behavior:'smooth', block:'start'});
      });
    });
  }

  async function initCollections() {
    try {
      const response = await fetch('data/collections.json');
      if (!response.ok) throw new Error('collections.json introuvable');
      state.data = await response.json();

      renderFamilyFilters();
      renderPlatforms();

      $c('#platform-search').addEventListener('input', e => {
        state.platformQuery = e.target.value;
        renderPlatforms();
      });
      $c('#back-platforms').addEventListener('click', () => {
        $c('#games-view').hidden = true;
        $c('#platform-view').hidden = false;
      });
      $c('#game-search').addEventListener('input', e => {
        state.gameQuery = e.target.value; state.page = 1; renderGames();
      });
      $c('#sort-games').addEventListener('change', e => {
        state.sort = e.target.value; state.page = 1; renderGames();
      });
      $c('#region-filter').addEventListener('change', e => {
        state.region = e.target.value; state.page = 1; renderGames();
      });
      $c('#state-filter').addEventListener('change', e => {
        state.gameState = e.target.value; state.page = 1; renderGames();
      });
    } catch (err) {
      console.error(err);
      $c('#platform-grid').innerHTML = '<p class="data-error">Impossible de charger la collection. Ouvre le site via GitHub Pages ou Live Server.</p>';
    }
  }

  initCollections();
})();