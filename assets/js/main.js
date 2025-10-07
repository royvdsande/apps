
// Locale: NL
const els = {
  grid: document.getElementById('appsGrid'),
  template: document.getElementById('cardTemplate'),
  empty: document.getElementById('emptyState'),
  tags: document.getElementById('tagsContainer'),
  search: document.getElementById('searchInput')
};

/** Helper: format date YYYY-MM-DD -> nl-NL **/
function fmtDate(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('nl-NL', { year:'numeric', month:'short', day:'2-digit' }); } catch { return iso; }
}

/** Render cards **/
let APPS = [];
let activeTag = null;

function renderApps(apps) {
  els.grid.innerHTML = '';
  if (!apps.length) { els.empty.classList.remove('hidden'); els.grid.setAttribute('aria-busy','false'); return; }
  els.empty.classList.add('hidden');
  for (const app of apps) {
    const node = els.template.content.cloneNode(true);
    node.querySelector('.badge').textContent = (app.badge || 'Web‑app');
    node.querySelector('.title').textContent = app.name;
    node.querySelector('.desc').textContent = app.description || '';
    node.querySelector('.tags').textContent = (app.tags || []).map(t => `#${t}`).join(' ');
    node.querySelector('.date').textContent = app.dateAdded ? `Toegevoegd: ${fmtDate(app.dateAdded)}` : '';
    const openBtn = node.querySelector('.btn.primary');
    openBtn.href = app.path; // Respecteer relatieve paden in apps.json
    openBtn.setAttribute('aria-label', `Open ${app.name}`);
    els.grid.appendChild(node);
  }
  els.grid.setAttribute('aria-busy','false');
}

/** Build tag pills from all tags **/
function buildTags(apps) {
  const all = new Set();
  apps.forEach(a => (a.tags||[]).forEach(t => all.add(t)));
  els.tags.innerHTML = '';
  if (!all.size) return;
  const mk = (label, value=null) => {
    const span = document.createElement('button');
    span.type = 'button';
    span.className = 'tag' + ((value===activeTag)?' active':'');
    span.textContent = label;
    span.addEventListener('click', () => {
      activeTag = (value===activeTag) ? null : value;
      filterAndRender();
      buildTags(APPS);
    });
    return span;
  };
  els.tags.appendChild(mk('Alle', null));
  [...all].sort().forEach(t => els.tags.appendChild(mk(`#${t}`, t)));
}

function filterAndRender() {
  const q = (els.search.value || '').trim().toLowerCase();
  let filtered = APPS;
  if (q) {
    filtered = filtered.filter(a => (
      a.name?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q) ||
      (a.tags||[]).some(t => t.toLowerCase().includes(q))
    ));
  }
  if (activeTag) filtered = filtered.filter(a => (a.tags||[]).includes(activeTag));
  renderApps(filtered);
}

async function loadApps() {
  els.grid.setAttribute('aria-busy','true');
  try {
    const res = await fetch('apps.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('apps.json niet gevonden');
    const data = await res.json();
    APPS = data.apps || [];
    buildTags(APPS);
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
