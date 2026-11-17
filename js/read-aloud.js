/* ---- Read aloud: optional voice-over using the browser's built-in speech (Web Speech API).
   Off by default. Nothing is recorded or sent anywhere; speech is generated on the device. ---- */
(function(){
  if(!('speechSynthesis' in window) || !window.SpeechSynthesisUtterance) return; // unsupported browser: no toggle

  const synth = window.speechSynthesis;
  let on = false;

  const VOICE_LANG = {en:'en-US', es:'es-US', zh:'zh-CN', tl:'fil-PH', vi:'vi-VN'};
  function pickVoice(code){
    const voices = synth.getVoices();
    const base = code.split('-')[0];
    return voices.find(v=>v.lang===code) || voices.find(v=>v.lang.replace('_','-').startsWith(base)) ||
           (base==='fil' ? voices.find(v=>/^tl/i.test(v.lang)) : null) || null;
  }
  const clean = s => String(s||'').replace(/\s+/g,' ').trim();

  function speak(text){
    text = clean(text);
    if(!on || !text) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const code = VOICE_LANG[LANG] || 'en-US';
    u.lang = code;
    const v = pickVoice(code); if(v) u.voice = v;
    u.rate = 0.95;
    synth.speak(u);
  }
  const txt = el => el ? clean(el.textContent) : '';
  const visible = id => { const el=document.getElementById(id); return el && getComputedStyle(el).display!=='none'; };

  /* What to read for the screen the person is on */
  function readStep(){
    const step = document.querySelector('#quizView .step.active'); if(!step) return;
    const parts = [txt(step.querySelector('.qtitle')), txt(step.querySelector('.qhelp'))];
    const opts = Array.from(step.querySelectorAll('.opt')).map(txt).filter(Boolean);
    if(opts.length) parts.push(opts.join('. '));
    speak(parts.filter(Boolean).join('. '));
  }
  function readPlan(){
    const body = document.getElementById('planBody'); if(!body) return;
    const parts = [txt(body.querySelector('h1')), txt(body.querySelector('.sub'))];
    body.querySelectorAll('.glance .grow').forEach(r=>{
      const s = r.querySelectorAll('span'); parts.push(txt(s[0]) + ': ' + txt(s[1]));
    });
    speak(parts.filter(Boolean).join('. '));
  }
  function readLanding(){
    speak([txt(document.querySelector('#landingView .hero h1')), txt(document.querySelector('#landingView .hero .lede'))].join('. '));
  }
  function readCurrent(){
    if(visible('planView')) readPlan();
    else if(visible('quizView')) readStep();
    else readLanding();
  }

  /* Read each new question and the plan as they appear */
  const origShowStep = window.showStep;
  if(typeof origShowStep==='function') window.showStep = function(i, keep){ origShowStep(i, keep); if(!keep) setTimeout(readStep, 50); };
  const origShowPlan = window.showPlan;
  if(typeof origShowPlan==='function') window.showPlan = function(keep){ origShowPlan(keep); if(!keep) setTimeout(readPlan, 50); };

  /* Say the label of whatever option or button is clicked.
     Capture phase, so a click that moves to a new screen is read first and then replaced by that screen. */
  document.addEventListener('click', e=>{
    if(!on) return;
    const el = e.target.closest('.opt, .chip, button, a');
    if(!el || el.closest('#langBar')) return;
    const label = el.getAttribute('aria-label') || txt(el);
    if(label) speak(label);
  }, true);

  /* The toggle, placed next to the language picker */
  const bar = document.getElementById('langBar'); if(!bar) return;
  const btn = document.createElement('button');
  btn.type = 'button'; btn.id = 'readAloudBtn';
  btn.setAttribute('aria-pressed','false');
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path class="wave" d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><span></span>';
  const label = btn.querySelector('span');
  function paint(){
    label.textContent = t(on ? 'Read aloud: on' : 'Read aloud: off');
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.classList.toggle('on', on);
  }
  btn.addEventListener('click', ()=>{
    on = !on; paint();
    if(on) readCurrent(); else synth.cancel();
  });
  bar.insertBefore(btn, bar.firstChild);
  paint();

  /* Keep the label in the chosen language, and stop speaking in the old one */
  const origSetLang = window.setLang;
  if(typeof origSetLang==='function') window.setLang = function(c){ synth.cancel(); origSetLang(c); paint(); };

  if(synth.onvoiceschanged!==undefined) synth.onvoiceschanged = ()=>{}; // some browsers load voices late
  window.addEventListener('pagehide', ()=>synth.cancel());
})();
