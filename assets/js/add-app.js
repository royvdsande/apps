
// Helpers
const $ = s => document.querySelector(s);
const val = id => document.getElementById(id).value.trim();
const set = (id, v) => document.getElementById(id).value = v;

function slugify(input) {
  return input.toLowerCase()
    .replace(/['"()\[\]]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toJsonBlock() {
  const name = val('name');
  const id = val('id') || slugify(name);
  const description = val('desc');
  const path = val('path') || `apps/${id}/index.html`;
  const tags = val('tags') ? val('tags').split(',').map(s=>s.trim()).filter(Boolean) : [];
  const badge = val('badge');
  const dateAdded = val('date') || new Date().toISOString().slice(0,10);
  return { id, name, description, path, tags, badge, dateAdded };
}

function showJson() {
  const block = toJsonBlock();
  $('#jsonOut').textContent = JSON.stringify(block, null, 2);
}

$('#genJson').addEventListener('click', showJson);

// Auto-slug when typing name
$('#name').addEventListener('input', (e)=> { if (!val('id')) set('id', slugify(e.target.value)); });

// ---------- GitHub API Mode ----------
const statusEl = $('#status');
const store = {
  get k(){return 'rvds-gh-settings';},
  save(obj){ localStorage.setItem(this.k, JSON.stringify(obj)); },
  load(){ try { return JSON.parse(localStorage.getItem(this.k)||'{}'); } catch { return {}; } }
};

(function initStored(){
  const s = store.load();
  ['ghOwner','ghRepo','ghBranch','ghAppsPath','ghToken'].forEach(id=>{ if(s[id]) set(id, s[id]); });
})();

async function ghFetch(url, opts={}) {
  const token = val('ghToken');
  const headers = { 'Accept': 'application/vnd.github+json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { ...opts, headers });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GitHub API fout ${res.status}: ${txt}`);
  }
  return res.json();
}

function b64(str){ return btoa(unescape(encodeURIComponent(str))); }

async function getFile(owner, repo, path, ref) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(ref)}`;
  return ghFetch(url);
}

async function putFile(owner, repo, path, ref, content, message, sha) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;
  return ghFetch(url, {
    method: 'PUT',
    body: JSON.stringify({ message, content: b64(content), branch: ref, sha })
  });
}

async function pushToGithub() {
  const owner = val('ghOwner');
  const repo = val('ghRepo');
  const branch = val('ghBranch') || 'main';
  const appsPath = val('ghAppsPath') || 'apps.json';
  const token = val('ghToken');
  store.save({ ghOwner:owner, ghRepo:repo, ghBranch:branch, ghAppsPath:appsPath, ghToken:token });

  const entry = toJsonBlock();
  statusEl.textContent = 'Laden van huidige apps.json…';

  // 1) Fetch apps.json
  const file = await getFile(owner, repo, appsPath, branch);
  const sha = file.sha;
  const current = JSON.parse(atob(file.content.replace(/
/g, '')));

  // 2) Update JSON (append or replace if id exists)
  const apps = Array.isArray(current.apps) ? current.apps : [];
  const idx = apps.findIndex(a => a.id === entry.id);
  if (idx >= 0) { apps[idx] = entry; } else { apps.push(entry); }
  const updated = JSON.stringify({ apps }, null, 2) + '
';

  // 3) Put apps.json
  statusEl.textContent = 'Schrijven naar apps.json…';
  await putFile(owner, repo, appsPath, branch, updated, `chore(apps): add/update ${entry.id}`, sha);

  // 4) Optional: create stub app file
  if (document.getElementById('makeStub').checked) {
    const stubPath = entry.path || `apps/${entry.id}/index.html`;
    const template = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${entry.name}</title>
  <link rel="stylesheet" href="../../assets/css/styles.css" />
</head>
<body style="padding:24px">
  <a href="../../index.html" class="btn">← Terug naar Rvds</a>
  <h1>${entry.name}</h1>
  <p class="muted">Start hier met je app. Deze stub is automatisch aangemaakt.</p>
  <script>console.log('Stub voor ${entry.id}');<\/script>
</body>
</html>
`;

    // Ensure path directories exist: GitHub API will create the file path if parents exist. Creating nested dirs implicitly works when path includes them.
    statusEl.textContent = 'Aanmaken van app‑stub…';
    try {
      await putFile(owner, repo, stubPath, branch, template, `feat(app): stub for ${entry.id}`);
    } catch (e) {
      // If file exists, we update it
      const existing = await getFile(owner, repo, stubPath, branch);
      await putFile(owner, repo, stubPath, branch, template, `chore(app): update stub for ${entry.id}`, existing.sha);
    }
  }

  statusEl.textContent = 'Klaar! Vernieuw de apps pagina om de wijziging te zien.';
}

$('#pushGithub').addEventListener('click', async () => {
  try { await pushToGithub(); }
  catch (e) { statusEl.textContent = e.message; console.error(e); }
});
