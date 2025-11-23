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

Notes and next improvements
- Add timer and streaks
- Add persistence (localStorage) for high scores
- Add more sequence types and configurable length

Enjoy! If you want, I can add a small Node/Express dev server or packaged build next.
