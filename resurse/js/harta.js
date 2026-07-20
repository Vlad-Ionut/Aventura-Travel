(async function () {
  const map = L.map('harta-globala').setView([45.94, 24.96], 3);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
  }).addTo(map);

  const data = await fetch('/api/harta').then((r) => r.json());
  const layers = { hotel: [], aeroport: [], obiectiv: [], pachet: [] };
  const info = document.getElementById('harta-info');

  const iconColors = {
    hotel: '#05386b',
    aeroport: '#379683',
    obiectiv: '#e07a3d',
    pachet: '#5cdb95',
  };

  function markerIcon(tip) {
    return L.divIcon({
      className: '',
      html: `<span style="background:${iconColors[tip] || '#333'};width:12px;height:12px;border-radius:50%;display:block;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></span>`,
      iconSize: [12, 12],
    });
  }

  data.pachete.forEach((p) => {
    const m = L.marker([+p.latitudine, +p.longitudine], { icon: markerIcon('pachet') }).bindPopup(
      `<b>${p.destinatie}</b><br>${p.tip_turism} · ${p.pret} RON<br><a href="/produs/${p.id}">Vezi pachet</a>`
    );
    m.on('click', () => {
      info.textContent = `Pachet: ${p.destinatie} — ${p.hotel_nume || ''}`;
    });
    layers.pachet.push(m);
    m.addTo(map);
  });

  data.poi.forEach((p) => {
    const tip = p.tip || 'obiectiv';
    const m = L.marker([+p.latitudine, +p.longitudine], { icon: markerIcon(tip) }).bindPopup(
      `<b>${p.nume}</b><br>${tip}<br>${p.descriere || ''}`
    );
    m.on('click', () => {
      info.textContent = `${tip}: ${p.nume}`;
    });
    if (!layers[tip]) layers[tip] = [];
    layers[tip].push(m);
    m.addTo(map);
  });

  document.querySelectorAll('.harta-filtre input').forEach((cb) => {
    cb.addEventListener('change', () => {
      const tip = cb.dataset.tip;
      (layers[tip] || []).forEach((m) => {
        if (cb.checked) m.addTo(map);
        else map.removeLayer(m);
      });
    });
  });
})();
