(() => {
  const $ = s => document.querySelector(s);
  const clone = x => JSON.parse(JSON.stringify(x));
  const familyOrder = ['Tout', 'Sony', 'Nintendo', 'SEGA', 'Microsoft', 'Ordinateurs', 'Autres'];

  const state = { data:null, family:'Tout', platformQuery:'', platform:null, gameQuery:'', region:'all', gameState:'all', sort:'az', page:1, modalMode:null, editingGameIndex:null, editingPlatformId:null };

  function esc(v='') { return String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
  function gameCount(id) { return state.data.jeux.filter(g => g.plateforme === id).length; }

  function renderFamilyFilters() {
    const familiesInData = new Set(state.data.plateformes.map(p => p.famille));
    const families = familyOrder.filter(f => f === 'Tout' || familiesInData.has(f));
    $('#family-filters').innerHTML = families.map(f => `<button class="family-btn ${state.family===f?'active':''}" data-family="${esc(f)}">${esc(f)}</button>`).join('');
    document.querySelectorAll('.family-btn').forEach(btn => btn.onclick = () => { state.family=btn.dataset.family; renderFamilyFilters(); renderPlatforms(); });
  }

  function renderPlatforms() {
    const q = state.platformQuery.trim().toLowerCase();
    const list = state.data.plateformes.filter(p => (state.family==='Tout'||p.famille===state.family) && (!q||p.nom.toLowerCase().includes(q)||p.famille.toLowerCase().includes(q)));
    $('#platform-grid').innerHTML = list.length ? list.map(p => `
      <article class="platform-card-wrap">
        <button class="platform-card" data-platform="${esc(p.id)}" type="button">
          <span class="platform-visual" style="background-image:url('${esc(p.image)}')"><b>${esc(p.labelCourt||p.nom)}</b></span>
          <span class="platform-info"><small>${esc(p.famille)}</small><strong>${esc(p.nom)}</strong><span>${gameCount(p.id)} jeu${gameCount(p.id)>1?'x':''}</span></span>
          <i>Voir la collection →</i>
        </button>
        <div class="admin-card-actions">
          <button data-edit-platform="${esc(p.id)}">Modifier</button>
          <button class="danger" data-delete-platform="${esc(p.id)}">Supprimer</button>
        </div>
      </article>`).join('') : '<p class="collection-empty">Aucune plateforme trouvée.</p>';

    document.querySelectorAll('.platform-card').forEach(card => card.onclick = () => openPlatform(card.dataset.platform));
    document.querySelectorAll('[data-edit-platform]').forEach(btn => btn.onclick = () => openPlatformModal(btn.dataset.editPlatform));
    document.querySelectorAll('[data-delete-platform]').forEach(btn => btn.onclick = () => deletePlatform(btn.dataset.deletePlatform));
  }

  function openPlatform(id) {
    state.platform=state.data.plateformes.find(p=>p.id===id); state.page=1; state.gameQuery=''; state.region='all'; state.gameState='all'; state.sort='az';
    $('#game-search').value=''; $('#region-filter').value='all'; $('#state-filter').value='all'; $('#sort-games').value='az';
    $('#platform-view').hidden=true; $('#games-view').hidden=false; $('#catalog-family').textContent=state.platform.famille; $('#catalog-title').textContent=state.platform.nom;
    renderGames(); window.scrollTo({top:0,behavior:'smooth'});
  }

  function filteredGames() {
    let list=state.data.jeux.map((g,i)=>({...g,_index:i})).filter(g=>g.plateforme===state.platform.id);
    const q=state.gameQuery.trim().toLowerCase();
    if(q) list=list.filter(g=>g.titre.toLowerCase().includes(q));
    if(state.region!=='all') list=list.filter(g=>g.region===state.region);
    if(state.gameState!=='all') list=list.filter(g=>g.etat===state.gameState);
    list.sort((a,b)=>a.titre.localeCompare(b.titre,'fr',{numeric:true})*(state.sort==='az'?1:-1));
    return list;
  }

  function renderGames() {
    const list=filteredGames(), per=state.data.parPage||30, pages=Math.max(1,Math.ceil(list.length/per));
    if(state.page>pages) state.page=pages;
    const visible=list.slice((state.page-1)*per,state.page*per), total=gameCount(state.platform.id);
    $('#catalog-count').textContent=`${total} jeu${total>1?'x':''} dans la collection • ${list.length} affiché${list.length>1?'s':''}`;
    $('#demo-notice').textContent='Prototype : ajoute, modifie ou supprime des fiches pour tester le futur fonctionnement. Rien n’est sauvegardé après actualisation.';
    $('#games-grid').innerHTML = visible.length ? visible.map(g=>`
      <article class="game-card">
        <div class="game-cover" style="background-image:url('${esc(g.image)}')"><span>${esc(state.platform.labelCourt||state.platform.nom)}</span></div>
        <div class="game-info">
          <h3>${esc(g.titre)}</h3>
          <div class="game-tags"><span>${esc(g.region||'—')}</span><span>${esc(g.etat||'—')}</span></div>
          ${g.annee?`<p class="game-meta">${esc(g.annee)}${g.genre?' • '+esc(g.genre):''}</p>`:''}
          ${g.description?`<p class="game-description">${esc(g.description)}</p>`:''}
          <div class="admin-game-actions"><button data-edit-game="${g._index}">Modifier</button><button class="danger" data-delete-game="${g._index}">Supprimer</button></div>
        </div>
      </article>`).join('') : '<p class="collection-empty">Aucun jeu ne correspond.</p>';
    document.querySelectorAll('[data-edit-game]').forEach(btn=>btn.onclick=()=>openGameModal(Number(btn.dataset.editGame)));
    document.querySelectorAll('[data-delete-game]').forEach(btn=>btn.onclick=()=>deleteGame(Number(btn.dataset.deleteGame)));
    renderPagination(pages);
  }

  function renderPagination(pages) {
    const target=$('#pagination'); if(pages<=1){target.innerHTML='';return;}
    let nums=[]; for(let i=1;i<=pages;i++) if(i===1||i===pages||Math.abs(i-state.page)<=2) nums.push(i);
    let html=`<button ${state.page===1?'disabled':''} data-page="${state.page-1}">‹</button>`,prev=0;
    [...new Set(nums)].forEach(n=>{if(prev&&n-prev>1)html+='<span>…</span>';html+=`<button class="${n===state.page?'active':''}" data-page="${n}">${n}</button>`;prev=n;});
    html+=`<button ${state.page===pages?'disabled':''} data-page="${state.page+1}">›</button>`; target.innerHTML=html;
    target.querySelectorAll('[data-page]').forEach(btn=>btn.onclick=()=>{if(btn.disabled)return;state.page=Number(btn.dataset.page);renderGames();});
  }

  function openModal(title,mode,fields){state.modalMode=mode;$('#modal-title').textContent=title;$('#admin-form').innerHTML=fields;$('#admin-modal').hidden=false;document.body.classList.add('modal-open');}
  function closeModal(){$('#admin-modal').hidden=true;document.body.classList.remove('modal-open');state.modalMode=null;}

  function platformForm(p={}) { return `
    <label>Nom de la console / plateforme<input name="nom" required value="${esc(p.nom||'')}"></label>
    <label>Famille<select name="famille">${['Sony','Nintendo','SEGA','Microsoft','Ordinateurs','Autres'].map(f=>`<option ${p.famille===f?'selected':''}>${f}</option>`).join('')}</select></label>
    <label>Nom court<input name="labelCourt" value="${esc(p.labelCourt||'')}"></label>
    <label>Image de la console<input name="imageFile" type="file" accept="image/*"></label>
    <label>Description<textarea name="description" rows="4">${esc(p.description||'')}</textarea></label>
    <button class="admin-primary form-submit" type="submit">${p.id?'Enregistrer les modifications':'Ajouter la console'}</button>`; }

  function gameForm(g={}) { return `
    <label>Titre du jeu<input name="titre" required value="${esc(g.titre||'')}"></label>
    <div class="form-two"><label>Région<select name="region">${['PAL','JAP','US'].map(v=>`<option ${g.region===v?'selected':''}>${v}</option>`).join('')}</select></label><label>État<select name="etat">${['Complet','Boîte','Loose'].map(v=>`<option ${g.etat===v?'selected':''}>${v}</option>`).join('')}</select></label></div>
    <div class="form-two"><label>Année<input name="annee" type="number" min="1970" max="2100" value="${esc(g.annee||'')}"></label><label>Genre<input name="genre" value="${esc(g.genre||'')}"></label></div>
    <label>Image / jaquette<input name="imageFile" type="file" accept="image/*"></label>
    <label>Description<textarea name="description" rows="5">${esc(g.description||'')}</textarea></label>
    <button class="admin-primary form-submit" type="submit">${Number.isInteger(state.editingGameIndex)?'Enregistrer les modifications':'Ajouter le jeu'}</button>`; }

  function openPlatformModal(id=null){state.editingPlatformId=id;const p=id?state.data.plateformes.find(x=>x.id===id):{};openModal(id?'Modifier la plateforme':'Ajouter une console',id?'edit-platform':'add-platform',platformForm(p));}
  function openGameModal(index=null){state.editingGameIndex=index;const g=Number.isInteger(index)?state.data.jeux[index]:{};openModal(Number.isInteger(index)?'Modifier le jeu':'Ajouter un jeu',Number.isInteger(index)?'edit-game':'add-game',gameForm(g));}
  function preview(input,fallback){const file=input.files&&input.files[0];return file?URL.createObjectURL(file):fallback;}

  function submitForm(e){
    e.preventDefault(); const fd=new FormData(e.currentTarget);
    if(state.modalMode==='add-platform'||state.modalMode==='edit-platform'){
      const existing=state.editingPlatformId?state.data.plateformes.find(p=>p.id===state.editingPlatformId):null;
      const id=existing?existing.id:fd.get('nom').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      const obj={id,nom:fd.get('nom'),famille:fd.get('famille'),labelCourt:fd.get('labelCourt')||fd.get('nom'),image:preview(e.currentTarget.querySelector('[name=imageFile]'),existing?.image||'images/placeholder.svg'),description:fd.get('description')||''};
      if(existing)Object.assign(existing,obj);else state.data.plateformes.push(obj); closeModal();renderFamilyFilters();renderPlatforms();
    } else {
      const existing=Number.isInteger(state.editingGameIndex)?state.data.jeux[state.editingGameIndex]:null;
      const obj={titre:fd.get('titre'),plateforme:state.platform.id,region:fd.get('region'),etat:fd.get('etat'),annee:fd.get('annee'),genre:fd.get('genre'),image:preview(e.currentTarget.querySelector('[name=imageFile]'),existing?.image||'images/placeholder.svg'),description:fd.get('description')||''};
      if(existing)state.data.jeux[state.editingGameIndex]=obj;else state.data.jeux.push(obj);closeModal();state.page=1;renderGames();
    }
  }

  function deletePlatform(id){const p=state.data.plateformes.find(x=>x.id===id);if(!confirm(`Supprimer ${p.nom} et ses jeux de cette démo ?`))return;state.data.plateformes=state.data.plateformes.filter(x=>x.id!==id);state.data.jeux=state.data.jeux.filter(g=>g.plateforme!==id);renderFamilyFilters();renderPlatforms();}
  function deleteGame(index){if(!confirm('Supprimer ce jeu de la démo ?'))return;state.data.jeux.splice(index,1);renderGames();}

  async function init(){
    const res=await fetch('data/collections.json');state.data=clone(await res.json());renderFamilyFilters();renderPlatforms();
    $('#platform-search').oninput=e=>{state.platformQuery=e.target.value;renderPlatforms();}; $('#back-platforms').onclick=()=>{$('#games-view').hidden=true;$('#platform-view').hidden=false;};
    $('#game-search').oninput=e=>{state.gameQuery=e.target.value;state.page=1;renderGames();}; $('#sort-games').onchange=e=>{state.sort=e.target.value;state.page=1;renderGames();};
    $('#region-filter').onchange=e=>{state.region=e.target.value;state.page=1;renderGames();}; $('#state-filter').onchange=e=>{state.gameState=e.target.value;state.page=1;renderGames();};
    $('#add-platform-btn').onclick=()=>openPlatformModal(); $('#add-game-btn').onclick=()=>openGameModal(); $('#modal-close').onclick=closeModal; $('#admin-modal').onclick=e=>{if(e.target.id==='admin-modal')closeModal();}; $('#admin-form').onsubmit=submitForm;
  }
  init().catch(err=>{console.error(err);$('#platform-grid').innerHTML='<p class="data-error">Impossible de charger la démo. Utilise GitHub Pages ou Live Server.</p>';});
})();