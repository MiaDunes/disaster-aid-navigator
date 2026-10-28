
  const steps = Array.from(document.querySelectorAll('#quizView .step'));
  let current = 0;
  const answers = {};

  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const progressTime = document.getElementById('progressTime');
  const urgentBanner = document.getElementById('urgentBanner');
  const backBtn = document.getElementById('backBtn');
  const nextBtn = document.getElementById('nextBtn');

  const totalContentSteps = 6; // steps 1–6 (step 0 is the urgent check, not counted in "Step X of 6")

  function renderProgress(){
    const pct = Math.min(100, Math.round((current / totalContentSteps) * 100));
    progressFill.style.width = (current === 0 ? 6 : pct) + '%';
    if(current === 0){
      progressText.textContent = t('Before we start');
      progressTime.textContent = '';
    } else {
      progressText.textContent = tf('Step {n} of 6',{n:current});
      const remaining = Math.max(1, (totalContentSteps - current) * 1.3).toFixed(0);
      progressTime.textContent = current === totalContentSteps ? t('Almost done') : tf('About {n} min left',{n:remaining});
    }
  }

  function showStep(i, keep){
    steps.forEach(s => s.classList.remove('active'));
    steps[i].classList.add('active');
    backBtn.style.visibility = i === 0 ? 'hidden' : 'visible';
    nextBtn.textContent = t(i === steps.length - 1 ? 'See my plan' : 'Continue');
    renderProgress();
    if(i === steps.length - 1) buildReview();
    if(!keep) window.scrollTo({top:0, behavior:'smooth'});
  }

  // option selection
  document.querySelectorAll('[data-group]').forEach(group => {
    const groupName = group.dataset.group;
    const type = group.dataset.type;
    group.querySelectorAll('.opt').forEach(opt => {
      opt.addEventListener('click', () => {
        if(type === 'single'){
          group.querySelectorAll('.opt').forEach(o => o.classList.remove('selected'));
          opt.classList.add('selected');
          answers[groupName] = opt.dataset.value;
          if(groupName === 'urgent'){
            urgentBanner.classList.toggle('show', opt.dataset.value === 'yes');
          }
        } else {
          opt.classList.toggle('selected');
          const vals = Array.from(group.querySelectorAll('.opt.selected')).map(o => o.dataset.value);
          answers[groupName] = vals;
        }
      });
    });
  });

  document.getElementById('dateInput').addEventListener('input', e => answers.date = e.target.value);
  document.getElementById('addressInput').addEventListener('input', e => answers.address = e.target.value);
  document.getElementById('householdSize').addEventListener('input', e => answers.householdSize = e.target.value);

  document.getElementById('skipHousehold').addEventListener('click', () => {
    current = Math.min(current + 1, steps.length - 1);
    showStep(current);
  });

  function txCountyLabel(v){
    if(!v) return undefined;
    if(v==='harris-houston') return t('Harris County or the City of Houston');
    if(v==='other') return t('Another Texas county');
    return v.split('-').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ');
  }
  function buildReview(){
    const list = document.getElementById('reviewList');
    const V = {
      disasterType:{flood:'Flood',wildfire:'Wildfire',hurricane:'Hurricane',tornado:'Tornado',earthquake:'Earthquake',other:'Something else'},
      declared:{yes:'Yes',no:'No',unsure:'Not sure'},
      ownRent:{own:'Own',rent:'Rent',other:'Living with family/other'},
      primaryResidence:{yes:'Yes',no:'No, a second home or rental'},
      livable:{yes:"Yes, it's livable",no:"No, we've been displaced"},
      insurance:{filed:"Yes, and I've already filed a claim",'not-filed':"Yes, but I haven't filed a claim yet",none:'No insurance',unsure:'Not sure'},
      citizenship:{yes:'Yes',no:'No',unsure:'Not sure'},
      accessNeeds:{yes:'Yes',no:'No'},
      state:{ca:'California',tx:'Texas',ok:'Oklahoma',wa:'Washington',fl:'Florida',other:'Another state'},
      waEvent:{wildfire26:'The 2026 wildfires',flood25:'The December 2025 floods',other:'A different event'},
      txEvent:{flood26:'The July 2026 storms and flooding',storms24:'The 2024 storms, tornadoes and flooding, or Hurricane Beryl',flood25:'The July 2025 Hill Country flooding',other:'A different event'},
      lossType:{structure:'Structural home damage',property:'Personal property (car, furniture, appliances)',business:'Business or self-employment income',medical:'Medical, funeral, or dependent-care costs'}
    };
    const val = (f,v) => {
      if(v===undefined || v===null || v==='') return undefined;
      if(Array.isArray(v)) return v.length ? v.map(x=>t((V[f]||{})[x]||x)).join(', ') : undefined;
      return t((V[f]||{})[v]||v);
    };
    let dateStr;
    if(answers.date){ const d = new Date(answers.date+'T00:00:00'); dateStr = isNaN(d) ? answers.date : d.toLocaleDateString(LOCALE[LANG],{year:'numeric',month:'long',day:'numeric'}); }
    const rows = [
      ['Disaster type', val('disasterType',answers.disasterType)],
      ['State', val('state',answers.state)],
      ['Texas event', answers.state==='tx' ? val('txEvent',answers.txEvent) : undefined],
      ['County', answers.state==='tx' ? txCountyLabel(answers.txCounty) : undefined],
      ['Washington event', answers.state==='wa' ? val('waEvent',answers.waEvent) : undefined],
      ['Date', dateStr],
      ['Location', answers.address],
      ['FEMA individual assistance open in your county', val('declared',answers.declared)],
      ['Home', val('ownRent',answers.ownRent)],
      ['Primary residence', val('primaryResidence',answers.primaryResidence)],
      ['Livable now', val('livable',answers.livable)],
      ['What was affected', val('lossType',answers.lossType)],
      ['Insurance', val('insurance',answers.insurance)],
      ['Household size', answers.householdSize],
      ['Citizenship/qualified status in household', val('citizenship',answers.citizenship)],
      ['Extra support needs', val('accessNeeds',answers.accessNeeds)],
    ];
    list.innerHTML = rows.filter(r=>r[1]).map(r=>`<div class="review-item"><span class="k">${esc(t(r[0]))}</span><span class="v">${esc(r[1])}</span></div>`).join('');
    if(!list.innerHTML){ list.innerHTML = `<div class="review-item"><span class="k">${esc(t('No answers yet'))}</span></div>`; }
  }

  backBtn.addEventListener('click', () => {
    current = Math.max(0, current - 1);
    showStep(current);
  });

  nextBtn.addEventListener('click', () => {
    if(current === steps.length - 1){
      showPlan();
      return;
    }
    current = Math.min(current + 1, steps.length - 1);
    showStep(current);
  });

  
