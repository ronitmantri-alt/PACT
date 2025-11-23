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

  // In-session seen pools to avoid repetition
  const seenSequences = {};// seenSequences[type] = { difficulty: Set(keys) }
  const seenRiddles = { easy: new Set(), medium: new Set(), hard: new Set() };

  function makeSeqKey(type, difficulty, seq, hideIndex){
    return `${type}|${difficulty}|${seq.join(',')}|${hideIndex}`;
  }

  function generateUniqueSequence(type, difficulty){
    seenSequences[type] = seenSequences[type] || { easy:new Set(), medium:new Set(), hard:new Set() };
    let attempts = 0;
    while(attempts < 5000){
      attempts++;
      const len = difficulty==='easy'? 5 : difficulty==='hard'? 7 : 6;
      const seq = generators[type](len, difficulty);
      const hideIndex = randInt(1, seq.length-2);
      const key = makeSeqKey(type, difficulty, seq, hideIndex);
      if(!seenSequences[type][difficulty].has(key)){
        seenSequences[type][difficulty].add(key);
        return {mode:'sequences', type, seq, hideIndex, display: seq.map((v,i)=> i===hideIndex? '...' : v), answer: seq[hideIndex] };
      }
    }
    // fallback to a last-generated sequence
    const seq = generators[type](difficulty==='easy'?5:(difficulty==='hard'?7:6), difficulty);
    const hideIndex = 1;
    return {mode:'sequences', type, seq, hideIndex, display: seq.map((v,i)=> i===hideIndex? '...' : v), answer: seq[hideIndex] };
  }

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

  // Synthetic riddle generator by difficulty to expand the pool
  const smallWords = ['apple','river','stone','chair','cloud','clock','light','paper','heart','star','leaf','water','door','shoe','glass'];
  function generateSyntheticRiddle(difficulty){
    if(difficulty === 'easy'){
      // simple math MCQ
      const a = randInt(1,20);
      const b = randInt(1,20);
      const ans = a + b;
      const q = `What is ${a} + ${b}?`;
      const opts = [ans, ans+randInt(1,5), ans-randInt(1,3), ans+randInt(6,12)];
      shuffleArray(opts);
      const ai = opts.indexOf(ans);
      return {mode:'riddles', question:q, options:opts.map(String), answerIndex:ai};
    } else if(difficulty === 'medium'){
      // anagram from smallWords
      const w = smallWords[randInt(0, smallWords.length-1)];
      const shuffled = w.split('').sort(()=>Math.random()-0.5).join('');
      const q = `Unscramble the letters: ${shuffled}`;
      const opts = [w, smallWords[randInt(0, smallWords.length-1)], smallWords[randInt(0, smallWords.length-1)], smallWords[randInt(0, smallWords.length-1)]];
      shuffleArray(opts);
      const ai = opts.indexOf(w);
      return {mode:'riddles', question:q, options:opts, answerIndex:ai};
    } else {
      // hard: small logic puzzle (find next number)
      const a = randInt(2,9);
      const seq = [a, a*2, a*3, a*4];
      const correct = seq[3];
      const q = `Find the next number in the sequence: ${seq[0]}, ${seq[1]}, ${seq[2]}, ...`;
      const opts = [correct, correct+randInt(1,7), correct-randInt(1,4), correct+randInt(8,15)];
      shuffleArray(opts);
      const ai = opts.indexOf(correct);
      return {mode:'riddles', question:q, options:opts.map(String), answerIndex:ai};
    }
  }

  function shuffleArray(arr){
    for(let i=arr.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function generateUniqueRiddle(difficulty){
    let attempts = 0;
    while(attempts < 5000){
      attempts++;
      // mix curated and synthetic
      const useCurated = Math.random() < 0.4;
      const r = useCurated ? riddles[randInt(0, riddles.length-1)] : null;
      const p = r ? (()=>{
        const opts = r.options.slice();
        shuffleArray(opts);
        return {mode:'riddles', question: r.q, options: opts, answerIndex: opts.indexOf(r.options[r.a]) };
      })() : generateSyntheticRiddle(difficulty);
      const key = `${p.question}|${p.options.join(',')}`;
      if(!seenRiddles[difficulty].has(key)){
        seenRiddles[difficulty].add(key);
        return p;
      }
    }
    return generateSyntheticRiddle(difficulty);
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
      p = generateUniqueRiddle(difficulty);
    } else {
      const type = pickTypeByDifficulty(difficulty);
      p = generateUniqueSequence(type, difficulty);
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

  // bank-builder: create N unique puzzles for given mode/category/difficulty and optionally persist
  function buildBank({mode='sequences', category=null, difficulty='medium', count=1000, persist=false}){
    const bank = [];
    if(mode === 'sequences'){
      const types = category ? [category] : Object.keys(generators);
      // distribute counts among types evenly
      const perType = Math.ceil(count / types.length);
      for(const t of types){
        for(let i=0;i<perType && bank.length<count;i++){
          bank.push(generateUniqueSequence(t, difficulty));
        }
      }
    } else {
      for(let i=0;i<count;i++){
        bank.push(generateUniqueRiddle(difficulty));
      }
    }
    if(persist){
      try{
        const key = 'questionBank_v1';
        const storage = JSON.parse(localStorage.getItem(key) || '{}');
        storage[mode] = storage[mode] || {};
        storage[mode][difficulty] = bank;
        localStorage.setItem(key, JSON.stringify(storage));
      }catch(e){
        console.warn('Could not persist bank to localStorage:', e);
      }
    }
    return bank;
  }

  // expose for debugging and bank generation
  window._seqGame = { startPuzzle, buildBank };
})();
