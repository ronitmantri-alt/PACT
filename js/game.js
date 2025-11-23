(() => {
  const seqEl = document.getElementById('sequence');
  const ansInput = document.getElementById('answerInput');
  const submitBtn = document.getElementById('submitAnswer');
  const choicesEl = document.getElementById('choices');
  const answerRow = document.getElementById('answerRow');
  const newBtn = document.getElementById('newPuzzle');
  const diffSel = document.getElementById('difficulty');
  const modeSel = document.getElementById('modeSelect');
  const feedback = document.getElementById('feedback');
  const scoreEl = document.getElementById('score');

  let current = null;
  let score = 0;

  function randInt(min, max) { return Math.floor(Math.random()*(max-min+1))+min }

  function generateArithmetic(length, difficulty){
    const step = randInt( (difficulty==='hard'? -6:-4), (difficulty==='hard'?6:5) );
    const start = randInt(1, 12);
    return Array.from({length}, (_,i)=> start + i*step);
  }

  function generateGeometric(length){
    const ratio = randInt(2,4);
    const start = randInt(1,5);
    return Array.from({length}, (_,i)=> start * Math.pow(ratio,i));
  }

  function generateFibonacci(length){
    const seq = [1,1];
    while(seq.length<length) seq.push(seq[seq.length-1]+seq[seq.length-2]);
    return seq.slice(0,length);
  }

  function generateSquares(length){
    const start = randInt(1,6);
    return Array.from({length}, (_,i)=> Math.pow(start+i,2));
  }

  function isPrime(n){
    if(n<2) return false;
    for(let i=2;i*i<=n;i++) if(n%i===0) return false;
    return true;
  }

  function generatePrimes(length){
    const result=[]; let n=randInt(2,10);
    while(result.length<length){ if(isPrime(n)) result.push(n); n++; }
    return result;
  }

  const generators = {
    arithmetic: generateArithmetic,
    geometric: generateGeometric,
    fibonacci: generateFibonacci,
    squares: generateSquares,
    primes: generatePrimes,
  };

  // Simple riddles database (can expand)
  const riddles = [
    { q: 'I speak without a mouth and hear without ears. I have nobody, but I come alive with wind. What am I?', options:['Echo','Fire','Shadow','Water'], a:0 },
    { q: 'What has keys but can’t open locks?', options:['Piano','Map','Clock','Bottle'], a:0 },
    { q: 'What gets wetter as it dries?', options:['Sponge','Towel','Rain','Soap'], a:1 },
    { q: 'What can travel around the world while staying in a corner?', options:['Stamp','Bird','Plane','Shadow'], a:0 },
    { q: 'What has a heart that doesn’t beat?', options:['Artichoke','Clock','Rock','Tree'], a:0 }
  ];

  function pickTypeByDifficulty(difficulty){
    const easy = ['arithmetic','fibonacci','squares'];
    const medium = ['arithmetic','geometric','fibonacci','squares'];
    const hard = ['arithmetic','geometric','fibonacci','primes','squares'];
    const pool = difficulty==='easy'? easy : difficulty==='hard'? hard : medium;
    return pool[randInt(0,pool.length-1)];
  }

  function generatePuzzle(difficulty){
    // For sequence mode produce a sequence puzzle
    const type = pickTypeByDifficulty(difficulty);
    const len = difficulty==='easy'? 5 : difficulty==='hard'? 7 : 6;
    const seq = generators[type](len, difficulty);
    const hideIndex = randInt(1, seq.length-2);
    const answer = seq[hideIndex];
    const display = seq.map((v,i)=> i===hideIndex? '...' : v);
    return {mode:'sequences', type, seq, hideIndex, display, answer};
  }

  function generateRiddle(){
    const r = riddles[randInt(0, riddles.length-1)];
    // shuffle options for variety while tracking correct index
    const opts = r.options.slice();
    for (let i = opts.length -1; i>0; i--){
      const j = randInt(0,i);
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    const answerIndex = opts.indexOf(r.options[r.a]);
    return {mode:'riddles', question: r.q, options: opts, answerIndex };
  }

  function renderPuzzle(p){
    feedback.textContent = '';
    feedback.className = 'feedback';
    choicesEl.innerHTML = '';
    // render according to mode
    if(p.mode === 'riddles'){
      seqEl.textContent = p.question;
      answerRow.classList.add('hidden');
      choicesEl.classList.remove('hidden');
      choicesEl.setAttribute('aria-hidden','false');
      p.options.forEach((opt, idx)=>{
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'choice-btn';
        btn.textContent = opt;
        btn.addEventListener('click', ()=> handleChoice(idx, p));
        choicesEl.appendChild(btn);
      });
    } else {
      seqEl.textContent = p.display.join('  ·  ');
      answerRow.classList.remove('hidden');
      choicesEl.classList.add('hidden');
      choicesEl.setAttribute('aria-hidden','true');
      ansInput.value = '';
      ansInput.focus();
    }
    current = p;
  }

  function handleChoice(selectedIndex, p){
    if(!p || p.mode !== 'riddles') return;
    const buttons = Array.from(choicesEl.querySelectorAll('.choice-btn'));
    buttons.forEach((b,i)=> b.disabled = true);
    const correct = selectedIndex === p.answerIndex;
    if(correct){
      score += 1;
      feedback.textContent = 'Correct!';
      feedback.className = 'feedback success';
      buttons[p.answerIndex].classList.add('correct');
      scoreEl.textContent = `Score: ${score}`;
      setTimeout(()=> startPuzzle(), 900);
    } else {
      feedback.textContent = `Incorrect — correct answer was "${p.options[p.answerIndex]}"`;
      feedback.className = 'feedback error';
      buttons[selectedIndex].classList.add('wrong');
      buttons[p.answerIndex].classList.add('correct');
    }
  }

  function checkAnswer(){
    if(!current) return;
    const user = ansInput.value.trim();
    if(user==='') { feedback.textContent = 'Please enter a number.'; feedback.className='feedback error'; return; }
    const expected = String(current.answer);
    if(user === expected){
      score += 1;
      feedback.textContent = 'Correct!';
      feedback.className = 'feedback success';
      scoreEl.textContent = `Score: ${score}`;
      // auto-next after short delay
      setTimeout(()=> startPuzzle(), 800);
    } else {
      feedback.textContent = `Incorrect — correct answer was ${expected}`;
      feedback.className = 'feedback error';
    }
  }

  function updateControlsVisibility(mode){
    // hide difficulty when riddles mode is active
    if(mode === 'riddles'){
      diffSel.classList.add('hidden');
    } else {
      diffSel.classList.remove('hidden');
    }
  }

  function startPuzzle(modeArg){
    const difficulty = diffSel.value;
    const mode = modeArg || (modeSel && modeSel.value) || 'sequences';
    updateControlsVisibility(mode);
    let p;
    if(mode === 'riddles'){
      p = generateRiddle();
    } else {
      p = generatePuzzle(difficulty);
    }
    renderPuzzle(p);
  }

  // events
  submitBtn.addEventListener('click', checkAnswer);
  newBtn.addEventListener('click', ()=> startPuzzle(modeSel && modeSel.value));
  modeSel.addEventListener('change', ()=> startPuzzle(modeSel && modeSel.value));
  ansInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') checkAnswer(); });

  // init
  startPuzzle(modeSel && modeSel.value);

  // expose for debugging
  window._seqGame = { startPuzzle };
})();
