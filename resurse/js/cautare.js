async function cauta(params) {
  const qs = new URLSearchParams(params);
  const res = await fetch('/api/search?' + qs.toString());
  return res.json();
}

function randareRezultate(data) {
  const box = document.getElementById('search-results');
  const count = document.getElementById('search-count');
  count.textContent = data.count + ' rezultate găsite';
  if (!data.results.length) {
    box.innerHTML = '<p>Niciun pachet nu corespunde filtrelor.</p>';
    return;
  }
  box.innerHTML = data.results
    .map(
      (p) => `
    <article class="card-pachet">
      <a href="/produs/${p.id}">
        <h2>${escapeHtml(p.destinatie)}</h2>
        <p>${escapeHtml(p.tip_turism || '')} · ${escapeHtml(p.categorie || '')}</p>
        <p class="pret-nou">${p.pret_final} RON
          ${p.reducere_procent > 0 ? `<span class="badge-reducere">−${p.reducere_procent}%</span>` : ''}
        </p>
        <p class="muted">${p.durata_zile} zile · ${p.locuri_disponibile} locuri</p>
      </a>
    </article>`
    )
    .join('');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.getElementById('form-cautare').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const params = {};
  for (const [k, v] of fd.entries()) {
    if (v) params[k] = v;
  }
  const data = await cauta(params);
  randareRezultate(data);
  history.replaceState(null, '', '/cautare?' + new URLSearchParams(params));
});

// Auto-search dacă există query în URL
(async () => {
  const q = Object.fromEntries(new URLSearchParams(location.search));
  if (Object.keys(q).length) {
    const form = document.getElementById('form-cautare');
    for (const [k, v] of Object.entries(q)) {
      if (form.elements[k]) form.elements[k].value = v;
    }
    randareRezultate(await cauta(q));
  }
})();
