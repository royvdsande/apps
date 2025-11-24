const els = {
  grid: document.getElementById('appsGrid'),
  template: document.getElementById('cardTemplate'),
  status: document.getElementById('status'),
  search: document.getElementById('searchInput'),
};

let APPS = [];

function render(apps) {
  els.grid.innerHTML = '';

  if (!apps.length) {
    els.status.textContent = 'Geen apps gevonden.';
    els.status.hidden = false;
    return;
  }

  els.status.hidden = true;

  apps.forEach((app) => {
    const node = els.template.content.cloneNode(true);
    node.querySelector('.app-title').textContent = app.name || 'Naam ontbreekt';
    node.querySelector('.app-desc').textContent = app.description || 'Geen beschrijving.';

    const button = node.querySelector('.app-button');
    button.href = app.path || '#';
    button.setAttribute('aria-label', `Open ${app.name || 'app'}`);

    els.grid.appendChild(node);
  });
}

function filterApps() {
  const q = (els.search.value || '').trim().toLowerCase();
  const filtered = q
    ? APPS.filter((app) =>
        app.name?.toLowerCase().includes(q) || app.description?.toLowerCase().includes(q)
      )
    : APPS;
  render(filtered);
}

async function loadApps() {
  els.status.textContent = 'Bezig met laden…';
  els.status.hidden = false;

  try {
    const res = await fetch('./apps.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('apps.json kon niet geladen worden');
    const data = await res.json();
    APPS = Array.isArray(data.apps) ? data.apps : [];
    filterApps();
  } catch (err) {
    console.error(err);
    els.status.textContent = 'Kon apps.json niet laden. Controleer of het bestand in de root staat.';
  }
}

els.search?.addEventListener('input', filterApps);

loadApps();
