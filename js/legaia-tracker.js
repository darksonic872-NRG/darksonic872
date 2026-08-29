(function(){
  const types = [
    { name: 'treasure', key: 'legaia_track_treasure_v2', countId: 'count-treasure', barId: 'bar-treasure' },
    { name: 'seru', key: 'legaia_track_seru_v2', countId: 'count-seru', barId: 'bar-seru' },
    { name: 'art', key: 'legaia_track_art_v2', countId: 'count-art', barId: 'bar-art' },
    { name: 'achievement', key: 'legaia_track_achievement_v2', countId: 'count-achievement', barId: 'bar-achievement' }
  ];

  function load(key){ try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch(e){ return []; } }
  function save(key, values){ localStorage.setItem(key, JSON.stringify(values)); }

  const map = {};
  types.forEach(type => {
    type.inputs = Array.from(document.querySelectorAll(`input[data-tracker="${type.name}"]`));
    map[type.name] = type;
    const checked = new Set(load(type.key));
    type.inputs.forEach(input => { input.checked = checked.has(input.value); });
  });

  function currentValues(inputs){ return inputs.filter(i => i.checked).map(i => i.value); }

  function updateType(type){
    const total = type.inputs.length;
    const checked = type.inputs.filter(i => i.checked).length;
    const countNode = document.getElementById(type.countId);
    const barNode = document.getElementById(type.barId);
    if (countNode) countNode.textContent = `${checked} / ${total}`;
    if (barNode) barNode.style.width = `${total ? (checked / total) * 100 : 0}%`;
  }

  function updateGroups(){
    document.querySelectorAll('.tracker-checklist[data-group]').forEach(group => {
      const inputs = Array.from(group.querySelectorAll('input[type="checkbox"]'));
      const checked = inputs.filter(i => i.checked).length;
      const badge = document.querySelector(`[data-count-for="${group.dataset.group}"]`);
      if (badge) badge.textContent = `${checked} / ${inputs.length}`;
    });
  }

  function persistType(typeName){
    const type = map[typeName];
    if (!type) return;
    save(type.key, currentValues(type.inputs));
    updateType(type);
    updateGroups();
  }

  types.forEach(type => {
    type.inputs.forEach(input => {
      input.addEventListener('change', () => persistType(type.name));
    });
    updateType(type);
  });
  updateGroups();

  const resetCurrent = document.getElementById('reset-current-btn');
  if (resetCurrent) resetCurrent.addEventListener('click', () => {
    types.forEach(type => {
      type.inputs.forEach(i => i.checked = false);
      save(type.key, []);
      updateType(type);
    });
    updateGroups();
  });

  const resetAll = document.getElementById('reset-all-btn');
  if (resetAll) resetAll.addEventListener('click', () => {
    types.forEach(type => {
      type.inputs.forEach(i => i.checked = false);
      save(type.key, []);
      updateType(type);
    });
    updateGroups();
  });
})();
