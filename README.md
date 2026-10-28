# Disaster Aid Navigator (MVP)

Pre-application household disaster-recovery screening tool covering FEMA Individual
Assistance, SBA Disaster Loans, State/Local Individual Assistance, and nonprofit aid.
Plain HTML, CSS, and JavaScript. No build step, no backend.

## Run it in VS Code

1. Open this folder in VS Code (File → Open Folder).
2. Install the recommended extensions when prompted (Live Server is the one you need).
3. Right-click `index.html` → **Open with Live Server**. It opens at http://localhost:5500.

No VS Code extension? Run `npm start` in the terminal (needs Node.js), or just
double-click `index.html`.

## Project layout

| File | What it holds |
|---|---|
| `index.html` | Page markup: landing, questionnaire, plan, and modals |
| `css/styles.css` | All styles and color tokens (`:root`) |
| `js/i18n-strings.js` | Translation tables (es, zh, tl, vi). Large; excluded from search |
| `js/i18n.js` | Language switching and lookup |
| `js/quiz.js` | Questionnaire steps, answers, and progress |
| `js/landing.js` | Landing-page agent bar and quick-pick chips |
| `js/engine.js` | Program registry and the deterministic eligibility evaluator |

Scripts load in that order as classic scripts and share global scope, so keep the order
in `index.html` if you add files.

## Notes

- Translations are machine-drafted and need native-speaker review before public use.
- Program data in `js/engine.js` stands in for a verified data layer (OpenFEMA, SBA, state
  feeds). Re-check deadlines and amounts before relying on them.
