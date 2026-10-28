/* ---- i18n: English source strings -> [es, zh, tl, vi]. Translations are machine-drafted and need native-speaker review before public use. ---- */
// Translation tables live in js/i18n-strings.js (loaded first).
const IDX = {es:0, zh:1, tl:2, vi:3};
const LOCALE = {en:undefined, es:'es-US', zh:'zh-CN', tl:'fil-PH', vi:'vi-VN'};
let LANG = 'en';
const MISSING = new Set();
function norm(s){ return String(s).replace(/\s+/g,' ').trim(); }
function lookup(k){
  let e = I18N[k];
  if(e) return e[IDX[LANG]];
  const m = k.match(/^Step (\d+) of 6$/);
  if(m){ e = I18N['Step {n} of 6']; return e[IDX[LANG]].split('{n}').join(m[1]); }
  return null;
}
function t(s){
  if(LANG==='en' || s==null) return s;
  const r = lookup(norm(s));
  if(r) return r;
  if(/[A-Za-z]{3}/.test(s)) MISSING.add(norm(s));
  return s;
}
function tf(s, v){ let r = t(s); for(const k in v) r = r.split('{'+k+'}').join(v[k]); return r; }
function translateDOM(){
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {acceptNode(n){
    const p = n.parentElement;
    if(!p || p.closest('script,style,[data-no-i18n],[data-i18n-html]')) return NodeFilter.FILTER_REJECT;
    return NodeFilter.FILTER_ACCEPT;
  }});
  const nodes = []; while(w.nextNode()) nodes.push(w.currentNode);
  nodes.forEach(n=>{
    if(n.__o === undefined) n.__o = n.nodeValue;
    const k = norm(n.__o); if(!k) return;
    const tr = LANG==='en' ? null : lookup(k);
    if(tr){ n.nodeValue = n.__o.match(/^\s*/)[0] + tr + n.__o.match(/\s*$/)[0]; }
    else { n.nodeValue = n.__o; if(LANG!=='en' && /[A-Za-z]{3}/.test(k)) MISSING.add(k); }
  });
  ['placeholder','aria-label','data-fill'].forEach(a=>{
    document.querySelectorAll('['+a+']').forEach(el=>{
      if(el.closest('[data-no-i18n]')) return;
      const key='__a_'+a; if(el[key]===undefined) el[key]=el.getAttribute(a);
      const tr = LANG==='en' ? null : lookup(norm(el[key]));
      if(!tr && LANG!=='en') MISSING.add(norm(el[key]));
      el.setAttribute(a, tr || el[key]);
    });
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el=>{
    if(el.__h === undefined) el.__h = el.innerHTML;
    const tr = LANG==='en' ? null : (HT[el.dataset.i18nHtml] || [])[IDX[LANG]];
    el.innerHTML = tr || el.__h;
  });
}
function setLang(c){
  LANG = c;
  document.documentElement.lang = {en:'en', es:'es', zh:'zh-Hans', tl:'tl', vi:'vi'}[c];
  translateDOM();
  const s = document.getElementById('langSel'); if(s) s.value = c;
  if(document.getElementById('quizView').style.display==='block') showStep(current, true);
  if(document.getElementById('planView').style.display==='block') showPlan(true);
}
