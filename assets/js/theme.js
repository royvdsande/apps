
// Thema wisselaar: system / light / dark
(function(){
  // Verwijder oude voorkeur om systeem als standaard te houden
  var STORAGE_KEY = 'theme-preference';
  var mql = window.matchMedia('(prefers-color-scheme: dark)');
  var root = document.documentElement;

  function applyTheme(pref){
    if(pref === 'light'){
      root.setAttribute('data-theme','light');
    } else if(pref === 'dark'){
      root.setAttribute('data-theme','dark');
    } else {
      root.removeAttribute('data-theme'); // system
    }
    setActiveButton(pref || 'system');
  }

  function setActiveButton(pref){
    document.querySelectorAll('.theme-btn').forEach(function(btn){
      var on = btn.getAttribute('data-theme') === pref;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function getPref(){
    try { return localStorage.getItem(STORAGE_KEY) || 'system'; }
    catch(e){ return 'system'; }
  }

  function setPref(pref){
    try { localStorage.setItem(STORAGE_KEY, pref); } catch(e){}
  }

  // Bind UI
  document.addEventListener('click', function(e){
    var btn = e.target.closest('.theme-btn');
    if(!btn) return;
    var pref = btn.getAttribute('data-theme');
    setPref(pref);
    applyTheme(pref);
  });

  // Reageer op systeem-wissel
  mql.addEventListener && mql.addEventListener('change', function(){
    if(getPref() === 'system') applyTheme('system');
  });

  // Init
  applyTheme(getPref());
})();
