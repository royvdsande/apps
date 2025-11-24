
// Locale: NL
const els = {
  grid: document.getElementById('appsGrid'),
  template: document.getElementById('cardTemplate'),
  empty: document.getElementById('emptyState'),
  search: document.getElementById('searchInput')
};

/** Helper: format date YYYY-MM-DD -> nl-NL **/
function fmtDate(iso) {
  if (!iso || iso === '-') return '';
  try { return new Date(iso).toLocaleDateString('nl-NL', { year:'numeric', month:'short', day:'2-digit' }); } catch { return iso; }
}

/** Render cards **/
let APPS = [];

function renderApps(apps) {
  els.grid.innerHTML = '';
  if (!apps.length) { els.empty.classList.remove('hidden'); els.grid.setAttribute('aria-busy','false'); return; }
  els.empty.classList.add('hidden');
  for (const app of apps) {
    const node = els.template.content.cloneNode(true);
    node.querySelector('.title').textContent = app.name;
    node.querySelector('.desc').textContent = app.description || '';
    const dateLabel = fmtDate(app.dateAdded);
    const dateEl = node.querySelector('.date');
    if (dateLabel) {
      dateEl.textContent = `Toegevoegd: ${dateLabel}`;
    } else {
      dateEl.classList.add('hidden');
    }
    const openBtn = node.querySelector('.btn.primary');
    openBtn.href = app.path;
    openBtn.setAttribute('aria-label', `Open ${app.name}`);
    openBtn.setAttribute('target', '_self'); // Nieuw toegevoegd
    els.grid.appendChild(node);

  }
  els.grid.setAttribute('aria-busy','false');
}

function filterAndRender() {
  const q = (els.search.value || '').trim().toLowerCase();
  let filtered = APPS;
  if (q) {
    filtered = filtered.filter(a => (
      a.name?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q)
    ));
  }
  renderApps(filtered);
}

async function loadApps() {
  els.grid.setAttribute('aria-busy','true');
  try {
    const res = await fetch('apps.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('apps.json niet gevonden');
    const data = await res.json();
    APPS = data.apps || [];
    filterAndRender();
  } catch (err) {
    console.error(err);
    els.empty.textContent = 'Kon apps.json niet laden. Plaats het bestand in de root van de site.';
    els.empty.classList.remove('hidden');
    els.grid.setAttribute('aria-busy','false');
  }
}

els.search?.addEventListener('input', filterAndRender);

loadApps();
