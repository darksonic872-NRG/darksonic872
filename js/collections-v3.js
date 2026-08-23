(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  let data = null, currentPlatform = null, currentGame = null, pendingGame = null;
  const el = {};

  const formatScore = (n) => { n = Number(n || 0); return `${n > 0 ? '+' : ''}${n}/20`; };
  const gamesFor = (id) => data.games.filter(g => g.platform === id);

  function cache() {
    ['platforms','games','detail','platformGrid','family','consoleName','gameCount','gameGrid','searchGame','sort','detailPlatform','detailTitle','bigCover','short','facts','description','score','myfacts','opinion','anecdote','modal','modalTitle','modalBody','addConsole','addGame','backPlatforms','backGames','editGame','close'].forEach(id => el[id] = document.getElementById(id));
  }

  function show(id) {
    ['platforms','games','detail'].forEach(name => el[name].hidden = name !== id);
    window.scrollTo({top:0, behavior:'smooth'});
  }

  function renderPlatforms() {
    el.platformGrid.innerHTML = data.platforms.map(p => `
      <button class="v3platform" data-platform="${p.id}" type="button">
        <div class="consolepic">${p.short}</div><small>${p.family}</small><h3>${p.name}</h3>
        <p>${gamesFor(p.id).length} jeu(x) dans la maquette</p><b>Voir la collection →</b>
      </button>`).join('');
    $$('[data-platform]').forEach(btn => btn.addEventListener('click', () => openPlatform(btn.dataset.platform)));
  }

  function openPlatform(id) {
    currentPlatform = data.platforms.find(p => p.id === id);
    el.family.textContent = currentPlatform.family;
    el.consoleName.textContent = currentPlatform.name;
    el.searchGame.value = '';
    el.sort.value = 'az';
    renderGames();
    show('games');
  }

  function renderGames() {
    let list = gamesFor(currentPlatform.id);
    const q = el.searchGame.value.trim().toLowerCase();
    if (q) list = list.filter(g => g.title.toLowerCase().includes(q));
    list.sort((a,b) => a.title.localeCompare(b.title,'fr') * (el.sort.value === 'az' ? 1 : -1));
    el.gameCount.textContent = `${gamesFor(currentPlatform.id).length} jeux dans cette maquette`;
    el.gameGrid.innerHTML = list.length ? list.map(g => `
      <button class="v3game" data-game="${g.id}" type="button">
        <div class="cover">${g.title}</div><h3>${g.title}</h3><p>${g.short}</p>
      </button>`).join('') : '<p class="collection-empty">Aucun jeu dans la démo.</p>';
    $$('[data-game]').forEach(btn => btn.addEventListener('click', () => openGame(btn.dataset.game)));
  }

  function openGame(id) {
    currentGame = data.games.find(g => g.id === id);
    el.detailPlatform.textContent = currentPlatform.name;
    el.detailTitle.textContent = currentGame.title;
    el.bigCover.textContent = currentGame.title;
    el.short.textContent = currentGame.short;
    el.facts.innerHTML = [['Année',currentGame.year],['Genre',currentGame.genre],['Développeur',currentGame.developer],['Éditeur',currentGame.publisher]].map(([k,v]) => `<div><span>${k}</span><b>${v || '—'}</b></div>`).join('');
    el.description.textContent = currentGame.description || 'Aucune description.';
    el.score.textContent = formatScore(currentGame.score);
    el.myfacts.innerHTML = [['Région',currentGame.region],['État',currentGame.condition],['Version',currentGame.version]].map(([k,v]) => `<div><span>${k}</span><b>${v || '—'}</b></div>`).join('');
    el.opinion.textContent = currentGame.opinion || 'Aucun avis pour le moment.';
    el.anecdote.textContent = currentGame.anecdote || 'Aucune anecdote pour le moment.';
    show('detail');
  }

  function openModal(title, html) {
    el.modalTitle.textContent = title;
    el.modalBody.innerHTML = html;
    el.modal.hidden = false;
    document.body.classList.add('modal-open');
  }
  function closeModal() { el.modal.hidden = true; document.body.classList.remove('modal-open'); }

  function platformDatabaseHtml() {
    return `<p class="modalintro">Simulation du futur catalogue de consoles.</p><div class="dbresults">${data.dbPlatforms.map(p => `
      <button data-add-platform="${p.id}" type="button"><div>${p.short}</div><span><small>${p.family}</small><b>${p.name}</b></span><strong>Ajouter</strong></button>`).join('')}</div>`;
  }

  function gameDatabaseHtml() {
    return `<p class="modalintro">Dans la version finale, ces résultats viendront automatiquement d'une base de jeux.</p><div class="dbresults">${data.dbGames.map((g,i) => `
      <button data-add-game="${i}" type="button"><div class="miniCover">${g.title.slice(0,1)}</div><span><small>${g.year} • ${g.genre}</small><b>${g.title}</b><em>${g.short}</em></span><strong>Sélectionner</strong></button>`).join('')}</div>`;
  }

  function personalFormHtml(g, editing=false) {
    return `<div class="prefill">✓ Titre, année, genre, développeur et éditeur sont déjà préremplis.</div>
      <form id="mineForm">
        <div class="form-two">
          <label>Région<select name="region"><option ${g.region==='PAL'?'selected':''}>PAL</option><option ${g.region==='JAP'?'selected':''}>JAP</option><option ${g.region==='US'?'selected':''}>US</option></select></label>
          <label>État<select name="condition"><option ${g.condition==='Complet'?'selected':''}>Complet</option><option ${g.condition==='Boîte'?'selected':''}>Boîte</option><option ${g.condition==='Loose'?'selected':''}>Loose</option></select></label>
        </div>
        <label>Version<input name="version" value="${g.version || ''}" placeholder="PAL FR, Platinum…"></label>
        <label>Ma note : <b id="scorePreview">${formatScore(g.score ?? 15)}</b><input id="scoreSlider" name="score" type="range" min="-20" max="20" value="${g.score ?? 15}"></label>
        <label>Mon avis<textarea name="opinion" rows="4">${g.opinion || ''}</textarea></label>
        <label class="anecdoteInput">Anecdote<textarea name="anecdote" rows="4">${g.anecdote || ''}</textarea></label>
        <button class="admin-primary" type="submit">${editing ? 'Enregistrer les modifications' : 'Ajouter à ma collection'}</button>
      </form>`;
  }

  function wirePlatformChoices() {
    $$('[data-add-platform]').forEach(btn => btn.addEventListener('click', () => {
      const p = data.dbPlatforms.find(x => x.id === btn.dataset.addPlatform);
      if (!p) return;
      data.platforms.push({...p});
      data.dbPlatforms = data.dbPlatforms.filter(x => x.id !== p.id);
      closeModal();
      renderPlatforms();
    }));
  }

  function wireGameChoices() {
    $$('[data-add-game]').forEach(btn => btn.addEventListener('click', () => {
      pendingGame = data.dbGames[Number(btn.dataset.addGame)];
      openModal(`Compléter mon exemplaire — ${pendingGame.title}`, personalFormHtml(pendingGame));
      wirePersonalForm(false);
    }));
  }

  function wirePersonalForm(editing) {
    const slider = $('#scoreSlider'), preview = $('#scorePreview'), form = $('#mineForm');
    slider?.addEventListener('input', () => preview.textContent = formatScore(slider.value));
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      if (editing) {
        currentGame.region = fd.get('region'); currentGame.condition = fd.get('condition'); currentGame.version = fd.get('version');
        currentGame.score = Number(fd.get('score')); currentGame.opinion = fd.get('opinion'); currentGame.anecdote = fd.get('anecdote');
        closeModal(); openGame(currentGame.id); return;
      }
      data.games.push({...pendingGame,id:`demo-${Date.now()}`,platform:currentPlatform.id,region:fd.get('region'),condition:fd.get('condition'),version:fd.get('version'),score:Number(fd.get('score')),opinion:fd.get('opinion'),anecdote:fd.get('anecdote'),description:'Description automatiquement récupérée dans la future version.'});
      pendingGame = null; closeModal(); renderGames(); show('games');
    });
  }

  function bind() {
    el.addConsole.addEventListener('click', () => { openModal('Choisir une console', platformDatabaseHtml()); wirePlatformChoices(); });
    el.addGame.addEventListener('click', () => { openModal('Rechercher dans la base', gameDatabaseHtml()); wireGameChoices(); });
    el.editGame.addEventListener('click', () => { openModal(`Modifier ma fiche — ${currentGame.title}`, personalFormHtml(currentGame,true)); wirePersonalForm(true); });
    el.backPlatforms.addEventListener('click', () => show('platforms'));
    el.backGames.addEventListener('click', () => show('games'));
    el.searchGame.addEventListener('input', renderGames);
    el.sort.addEventListener('change', renderGames);
    el.close.addEventListener('click', closeModal);
    el.modal.addEventListener('click', e => { if (e.target === el.modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !el.modal.hidden) closeModal(); });
  }

  async function init() {
    cache(); bind();
    const r = await fetch('data/collections-v3-demo.json');
    if (!r.ok) throw new Error('collections-v3-demo.json introuvable');
    data = await r.json();
    renderPlatforms();
  }

  init().catch(err => { console.error(err); if (el.platformGrid) el.platformGrid.innerHTML = '<p class="data-error">Impossible de charger la maquette. Teste-la via GitHub Pages ou Live Server.</p>'; });
})();
