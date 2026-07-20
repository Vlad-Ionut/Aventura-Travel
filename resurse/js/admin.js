let charts = {};

document.querySelectorAll('.admin-tabs button').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-tabs button').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.admin-tab').forEach((t) => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'dashboard') loadDashboard();
    if (btn.dataset.tab === 'pachete') loadPachete();
    if (btn.dataset.tab === 'rezervari') loadRezervari();
    if (btn.dataset.tab === 'utilizatori') loadUseri();
    if (btn.dataset.tab === 'recenzii') loadRecenzii();
    if (btn.dataset.tab === 'rapoarte') loadRaport();
  });
});

async function loadDashboard() {
  const s = await fetch('/api/admin/stats').then((r) => r.json());
  document.getElementById('stat-cards').innerHTML = `
    <div class="stat-card"><div>Clienți</div><div class="val">${s.clienti}</div></div>
    <div class="stat-card"><div>Pachete active</div><div class="val">${s.pachete}</div></div>
    <div class="stat-card"><div>Rezervări</div><div class="val">${s.rezervari}</div></div>
    <div class="stat-card"><div>Venituri (RON)</div><div class="val">${Math.round(s.venituri)}</div></div>
  `;

  const mk = (id, type, labels, data, label) => {
    if (charts[id]) charts[id].destroy();
    charts[id] = new Chart(document.getElementById(id), {
      type,
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            backgroundColor: ['#05386b', '#379683', '#5cdb95', '#8ee4af', '#edf5e1', '#e07a3d', '#f2c14e', '#6c8cbf'],
            borderColor: '#05386b',
            tension: 0.3,
          },
        ],
      },
      options: { responsive: true, plugins: { legend: { display: type === 'doughnut' } } },
    });
  };

  mk(
    'chart-rezervari',
    'bar',
    s.rezervariPeLuna.map((x) => x.luna),
    s.rezervariPeLuna.map((x) => x.nr),
    'Rezervări'
  );
  mk(
    'chart-venituri',
    'line',
    s.venituriPeLuna.map((x) => x.luna),
    s.venituriPeLuna.map((x) => x.total),
    'Venituri'
  );
  mk(
    'chart-dest',
    'doughnut',
    s.destinatiiPopulare.map((x) => x.destinatie),
    s.destinatiiPopulare.map((x) => x.nr),
    'Populare'
  );
}

async function loadPachete() {
  const list = await fetch('/api/pachete').then((r) => r.json());
  document.getElementById('lista-pachete-admin').innerHTML = `
    <table class="admin-table">
      <thead><tr><th>ID</th><th>Destinație</th><th>Preț</th><th>Red%</th><th>Locuri</th><th>Activ</th><th></th></tr></thead>
      <tbody>
        ${list
          .map(
            (p) => `<tr>
          <td>${p.id}</td><td>${esc(p.destinatie)}</td><td>${p.pret}</td><td>${p.reducere_procent}</td>
          <td>${p.locuri_disponibile}</td><td>${p.activ ? 'da' : 'nu'}</td>
          <td>
            <button type="button" class="btn btn-outline btn-sm" onclick="openUpload(${p.id})">Imagini</button>
            <button type="button" class="btn btn-outline btn-sm" onclick="stergePachet(${p.id})">Dezactivează</button>
          </td>
        </tr>`
          )
          .join('')}
      </tbody>
    </table>`;
}

window.openUpload = (id) => {
  document.getElementById('upload-zone').hidden = false;
  document.getElementById('upload-pid').textContent = id;
};

document.getElementById('upload-files')?.addEventListener('change', (e) => {
  const preview = document.getElementById('upload-preview');
  preview.innerHTML = '';
  [...e.target.files].forEach((f) => {
    const url = URL.createObjectURL(f);
    const img = document.createElement('img');
    img.src = url;
    preview.appendChild(img);
  });
});

document.getElementById('btn-upload')?.addEventListener('click', async () => {
  const id = document.getElementById('upload-pid').textContent;
  const files = document.getElementById('upload-files').files;
  if (!files.length) return alert('Selectează imagini');
  const fd = new FormData();
  [...files].forEach((f) => fd.append('imagini', f));
  const res = await fetch('/api/pachete/' + id + '/imagini', { method: 'POST', body: fd });
  const data = await res.json();
  if (!res.ok) alert(data.error || 'Eroare');
  else {
    alert('Încărcat & comprimat: ' + data.imagini.length + ' imagini');
    document.getElementById('upload-zone').hidden = true;
  }
});

window.stergePachet = async (id) => {
  if (!confirm('Dezactivezi pachetul?')) return;
  await fetch('/api/pachete/' + id, { method: 'DELETE' });
  loadPachete();
};

document.getElementById('form-pachet')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = Object.fromEntries(fd);
  body.pret = +body.pret;
  body.durata_zile = +body.durata_zile;
  body.reducere_procent = +body.reducere_procent || 0;
  body.locuri_disponibile = +body.locuri_disponibile || 20;
  if (body.latitudine) body.latitudine = +body.latitudine;
  if (body.longitudine) body.longitudine = +body.longitudine;
  const res = await fetch('/api/pachete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) alert((await res.json()).error);
  else {
    e.target.reset();
    loadPachete();
    alert('Pachet adăugat');
  }
});

async function loadRezervari() {
  const list = await fetch('/api/admin/rezervari').then((r) => r.json());
  document.getElementById('lista-rez-admin').innerHTML = `
    <table class="admin-table">
      <thead><tr><th>ID</th><th>Client</th><th>Pachet</th><th>Pers</th><th>Total</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${list
          .map(
            (r) => `<tr>
          <td>${r.id}</td><td>${esc(r.client)}<br><small>${esc(r.email)}</small></td>
          <td>${esc(r.destinatie)}</td><td>${r.numar_persoane}</td><td>${r.pret_total}</td>
          <td>
            <select onchange="setRezStatus(${r.id}, this.value)">
              ${['pending', 'confirmata', 'anulata', 'finalizata']
                .map((s) => `<option ${s === r.status ? 'selected' : ''}>${s}</option>`)
                .join('')}
            </select>
          </td>
          <td></td>
        </tr>`
          )
          .join('')}
      </tbody>
    </table>`;
}

window.setRezStatus = async (id, status) => {
  await fetch('/api/admin/rezervari/' + id, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
};

async function loadUseri() {
  const el = document.getElementById('lista-useri');
  if (!el) return;
  const list = await fetch('/api/admin/utilizatori').then((r) => r.json());
  el.innerHTML = `
    <table class="admin-table">
      <thead><tr><th>ID</th><th>Nume</th><th>Email</th><th>Rol</th><th>Activ</th></tr></thead>
      <tbody>
        ${list
          .map(
            (u) => `<tr>
          <td>${u.id}</td><td>${esc(u.nume)}</td><td>${esc(u.email)}</td>
          <td>
            <select onchange="setUser(${u.id}, {rol: this.value})">
              ${['client', 'angajat', 'administrator']
                .map((r) => `<option ${r === u.rol ? 'selected' : ''}>${r}</option>`)
                .join('')}
            </select>
          </td>
          <td><input type="checkbox" ${u.activ ? 'checked' : ''} onchange="setUser(${u.id}, {activ: this.checked})"></td>
        </tr>`
          )
          .join('')}
      </tbody>
    </table>`;
}

window.setUser = async (id, patch) => {
  await fetch('/api/admin/utilizatori/' + id, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
};

async function loadRecenzii() {
  const list = await fetch('/api/admin/recenzii').then((r) => r.json());
  document.getElementById('lista-recenzii-admin').innerHTML = `
    <table class="admin-table">
      <thead><tr><th>ID</th><th>User</th><th>Pachet</th><th>★</th><th>Comentariu</th><th>Status</th></tr></thead>
      <tbody>
        ${list
          .map(
            (r) => `<tr>
          <td>${r.id}</td><td>${esc(r.nume)}</td><td>${esc(r.destinatie)}</td><td>${r.rating}</td>
          <td>${esc(r.comentariu || '')}</td>
          <td>
            <select onchange="setRec(${r.id}, this.value)">
              ${['pending', 'aprobata', 'respinsa']
                .map((s) => `<option ${s === r.status ? 'selected' : ''}>${s}</option>`)
                .join('')}
            </select>
          </td>
        </tr>`
          )
          .join('')}
      </tbody>
    </table>`;
}

window.setRec = async (id, status) => {
  await fetch('/api/admin/recenzii/' + id, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
};

async function loadRaport() {
  const list = await fetch('/api/admin/raport').then((r) => r.json());
  document.getElementById('lista-raport').innerHTML = `
    <table class="admin-table">
      <thead><tr><th>Destinație</th><th>Tip</th><th>Țară</th><th>Rezervări</th><th>Venituri</th><th>Rating</th></tr></thead>
      <tbody>
        ${list
          .map(
            (r) => `<tr>
          <td>${esc(r.destinatie)}</td><td>${r.tip_turism || ''}</td><td>${esc(r.tara || '')}</td>
          <td>${r.nr_rezervari}</td><td>${Math.round(r.venituri)}</td><td>${Number(r.rating).toFixed(1)}</td>
        </tr>`
          )
          .join('')}
      </tbody>
    </table>`;
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

loadDashboard();
