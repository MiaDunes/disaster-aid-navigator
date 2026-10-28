
  const bar = document.getElementById('agentBar');
  const input = document.getElementById('agentInput');
  const send = document.getElementById('agentSend');
  const chips = document.querySelectorAll('.chip');

  input.addEventListener('focus', () => bar.classList.add('lit'));
  input.addEventListener('blur', () => { if(!input.value) bar.classList.remove('lit'); });

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.fill;
      input.focus();
      bar.classList.add('lit');
    });
  });

  

  const landingView = document.getElementById('landingView');
  const quizView = document.getElementById('quizView');
  const typedInput = document.getElementById('agentInput');
  const goBtn = document.getElementById('agentSend');

  function guessDisaster(text){
    const s = (text||'').toLowerCase();
    if(/flood|water|inund|洪|水|淹|binaha|\bbaha\b|ngập|lũ lụt/.test(s)) return 'flood';
    if(/wildfire|fire|burn|incendio|火|sunog|cháy/.test(s)) return 'wildfire';
    if(/hurricane|huracán|huracan|飓|bagyo|bão/.test(s)) return 'hurricane';
    if(/tornado|龙卷|buhawi|lốc/.test(s)) return 'tornado';
    if(/earthquake|terremoto|地震|lindol|động đất/.test(s)) return 'earthquake';
    return null;
  }

  function openQuestionnaire(){
    landingView.style.display = 'none';
    quizView.style.display = 'block';
    current = 0;
    showStep(0);
    const g = guessDisaster(typedInput.value);
    if(g){
      const opt = document.querySelector('[data-group="disasterType"] .opt[data-value="'+g+'"]');
      if(opt) opt.click();
    }
    window.scrollTo({top:0});
  }
  function openLanding(){
    quizView.style.display = 'none';
    landingView.style.display = 'block';
    window.scrollTo({top:0});
  }

  // arrow button (and Enter) opens the questionnaire
  goBtn.addEventListener('click', openQuestionnaire);
  typedInput.addEventListener('keydown', e => { if(e.key === 'Enter') openQuestionnaire(); });
  document.querySelector('#quizView .wordmark').style.cursor = 'pointer';
  document.querySelector('#quizView .wordmark').addEventListener('click', openLanding);

