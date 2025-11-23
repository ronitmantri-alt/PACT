# Number Sequence Puzzles

Small static web game that shows numeric sequences with one missing number. Players guess the missing number.

Files added
- `index.html` — main UI file
- `css/styles.css` — styling
- `js/game.js` — game logic and puzzle generator

How to run

- Open `index.html` in your browser directly (Chrome/Edge may block some features when opened as `file://`); or
- Serve with a simple HTTP server from the repository root:

```bash
cd /workspaces/ronitpapaproject
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

Gameplay
- Choose a `Mode` (Sequences or Riddles) and a difficulty, then press "New Puzzle".
- Sequences: Enter the missing number and press Submit.
- Riddles: Choose the correct option from the multiple-choice buttons.
- Score increases for each correct answer.

Bank generation (fast & robust)
- This project supports runtime generation of very large question banks without shipping thousands of static files.
- From the browser console you can pre-generate banks and (optionally) persist them to `localStorage`.

Example (generate 1000 riddles at `medium` difficulty and persist):
```js
// in the page console
window._seqGame.buildBank({ mode: 'riddles', difficulty: 'medium', count: 1000, persist: true });
```

Example (generate 1000 sequences spread across sequence categories at `easy` difficulty):
```js
window._seqGame.buildBank({ mode: 'sequences', difficulty: 'easy', count: 1000, persist: true });
```

Notes
- The bank builder avoids repeats during generation and mixes curated riddles with synthetic variants to reach large counts quickly.
- If you prefer static JSON files instead, I can add a generator script to write `data/*.json` files.

Notes and next improvements
- Add timer and streaks
- Add persistence (localStorage) for high scores
- Add more sequence types and configurable length

Enjoy! If you want, I can add a small Node/Express dev server or packaged build next.
