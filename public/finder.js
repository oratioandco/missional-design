(() => {
  const query = document.getElementById('pattern-query');
  if (!query) return;
  const groups = [...document.querySelectorAll('.pattern-group')];
  const entries = [...document.querySelectorAll('.search-entry')];
  const count = document.getElementById('finder-count');
  const empty = document.getElementById('finder-empty');
  const reset = document.getElementById('finder-reset');
  const subgroups = [...document.querySelectorAll('.pattern-subgroup')];
  let subgroupState = new Set();
  let previousQuery = '';
  let expandedBeforeSearch = new Set();
  function update() {
    const value = query.value.trim().toLowerCase();
    if (value && !previousQuery) expandedBeforeSearch = new Set(groups.filter(g => g.open));
    if (value && !previousQuery) subgroupState = new Set(subgroups.filter(g => g.open));
    const words = value.split(/\s+/).filter(Boolean);
    let found = 0;
    for (const entry of entries) {
      entry.hidden = !words.every(word => entry.dataset.search.includes(word));
      if (!entry.hidden) found++;
    }
    for (const group of groups) {
      const groupEntries = [...group.querySelectorAll('.search-entry')];
      const matches = groupEntries.filter(entry => !entry.hidden).length;
      group.hidden = !matches;
      group.querySelector('.collection-count').textContent = value ? `${matches} of ${groupEntries.length} patterns` : `${groupEntries.length} patterns`;
      if (value) group.open = !group.hidden;
      else if (previousQuery) group.open = expandedBeforeSearch.has(group);
    }
    for (const subgroup of subgroups) {
      const matched = [...subgroup.querySelectorAll('.search-entry')].some(e => !e.hidden);
      subgroup.hidden = !matched;
      if (value) subgroup.open = matched;
      else if (previousQuery) subgroup.open = subgroupState.has(subgroup);
    }
    count.textContent = value ? `${found} matching pattern${found === 1 ? '' : 's'}.` : `Browse ${entries.length} published patterns.`;
    empty.hidden = found !== 0;
    reset.hidden = !value;
    previousQuery = value;
  }
  function openAnchor() {
    const group = groups.find(g => '#' + g.id === location.hash);
    if (group) group.open = true;
  }
  openAnchor();
  window.addEventListener('hashchange', openAnchor);
  query.addEventListener('input', update);
  reset.addEventListener('click', () => { query.value = ''; update(); query.focus(); });
})();
