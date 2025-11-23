(() => {
  const seqEl = document.getElementById('sequence');
  const ansInput = document.getElementById('answerInput');
  const submitBtn = document.getElementById('submitAnswer');
  const newBtn = document.getElementById('newPuzzle');
  const diffSel = document.getElementById('difficulty');
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

  function pickTypeByDifficulty(difficulty){
    const easy = ['arithmetic','fibonacci','squares'];
    const medium = ['arithmetic','geometric','fibonacci','squares'];
    const hard = ['arithmetic','geometric','fibonacci','primes','squares'];
    const pool = difficulty==='easy'? easy : difficulty==='hard'? hard : medium;
    return pool[randInt(0,pool.length-1)];
  }

  function generatePuzzle(difficulty){
    const type = pickTypeByDifficulty(difficulty);
    const len = difficulty==='easy'? 5 : difficulty==='hard'? 7 : 6;
    const seq = generators[type](len, difficulty);
    // hide one element (not the first to keep solvable clues)
    const hideIndex = randInt(1, seq.length-2);
    const answer = seq[hideIndex];
    const display = seq.map((v,i)=> i===hideIndex? '...' : v);
    return {type, seq, hideIndex, display, answer};
  }

  function renderPuzzle(p){
    seqEl.textContent = p.display.join('  ·  ');
    feedback.textContent = '';
    feedback.className = 'feedback';
    ansInput.value = '';
    ansInput.focus();
    current = p;
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

  function startPuzzle(){
    const difficulty = diffSel.value;
    const p = generatePuzzle(difficulty);
    renderPuzzle(p);
  }

  // events
  submitBtn.addEventListener('click', checkAnswer);
  newBtn.addEventListener('click', startPuzzle);
  ansInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') checkAnswer(); });

  // init
  startPuzzle();

  // expose for debugging
  window._seqGame = { startPuzzle };
})();
