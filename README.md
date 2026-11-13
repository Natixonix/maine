# Polish Eval Lab

A small workspace for practising and documenting the evaluation of Polish-language AI responses. Prepared for Natalia Michalik's portfolio, it lets a reviewer compare two responses, apply a rubric and explain a decision in their own words.

The project opens with **12 synthetic examples and no completed evaluations**. A useful portfolio submission is the reviewer's exported work: the ratings, reasoning, disagreements and revisions they actually record.

## What the application does

- Presents a prompt and two candidate responses in Polish.
- Supports four ratings for each response: accuracy, instruction following, Polish clarity and usefulness.
- Records a preference for A, B or a tie, or a decision to skip an example.
- Captures a written rationale, confidence and critical issue flags.
- Reveals an illustrative discussion after an evaluation is saved and tracks whether it was already seen before a later saved revision.
- Saves drafts and evaluations locally when browser storage is available.
- Exports a JSON backup, detailed CSV and Markdown portfolio report; imports compatible JSON backups.

The interface and exercises are in Polish. The code uses plain HTML, CSS and JavaScript, with no API key, paid service or build step.

## Szybki start

1. Rozpakuj cały folder projektu.
2. Otwórz plik **`index.html`** w przeglądarce. Pozostałe pliki zostaw obok niego.
3. Przeczytaj instrukcję i kryteria, oceń pierwszy przykład i zapisz własne uzasadnienie.
4. Po pracy wyeksportuj kopię JSON oraz raport do portfolio.

Szczegółowa instrukcja jest w [START_TUTAJ.md](START_TUTAJ.md). Opis skali i kryteriów znajduje się w [RUBRIC.md](RUBRIC.md).

## Evaluation workflow

Read the complete prompt before comparing the responses. Score each response independently on a scale from 1 to 5 using the four dimensions in the rubric. Select a preference and give a rationale of at least 30 characters that points to evidence in the prompt or response. Where relevant, mark a critical issue such as an invented claim or a change in meaning.

Save the evaluation before opening the illustrative discussion. You can disagree with that discussion: explain your reasoning and keep the distinction between an independent first judgment and a revision made after seeing the reference. Use the skip option when you cannot make a defensible judgment, and explain why.

These are practice ratings. They are not a hiring result, a measure of the reviewer's overall ability or a benchmark score for a deployed model.

## Data and authorship

Dataset version: **`pl-eval-v1`**.

All prompts, responses and illustrative discussions were created for this project with AI assistance. They are synthetic teaching examples, not confidential recruitment tasks or outputs collected from named AI models. The illustrative preference and rationale are examples to examine critically, not authoritative ground truth.

Application code and starting materials were prepared with AI assistance. The human contribution is the reviewer's own evaluation work, explanations, verification and subsequent improvements. No completed review is attributed to Natalia until she performs and records it.

This is an independent portfolio project and is not affiliated with Alignerr or Labelbox.

## Saved work and exports

The app stores work in the current browser on the current device. It does not upload evaluations to a server. Browser storage can be cleared, and some browsers restrict storage for pages opened through `file://`. A JSON export is the portable backup; keep a copy outside the project folder and import it when needed.

| Export | Purpose |
| --- | --- |
| JSON | Back up evaluations and restore compatible work in the app. |
| CSV | Inspect individual ratings and decisions in a spreadsheet. |
| Markdown | Share a readable record of the reviewer's work in a portfolio or repository. |

Review the contents before sharing an export. Only include information you intend to make public. Resetting the workspace requires confirmation; exporting a backup first preserves work you want to keep.

## Files

- `index.html` — application entry point.
- `styles.css` — responsive presentation.
- `core.js` — evaluation and export logic.
- `app.js` — interface and browser persistence.
- `cases.js` — synthetic exercises and illustrative discussions.
- `RUBRIC.md` — evaluation criteria.
- `START_TUTAJ.md` — Polish walkthrough and portfolio guidance.
- `tests/core.test.cjs` — automated checks for core behaviour.
- `tests/app.test.cjs` — startup checks with a minimal Node test adapter.

## Run the automated checks

With Node.js installed, run from the project folder:

```bash
node --test tests/*.test.cjs
```

Validation: the logic and startup tests were executed in Node. The startup adapter captures generated HTML and storage interactions; it is not a full DOM or browser. Full browser interaction and responsive visual checks were not completed because this environment blocks local Chromium and cloud `file://` access.

For a manual check, complete an example, reload the page, export a JSON backup and import it into an empty workspace. Confirm that the decision, rationale and ratings are preserved. Check the layout on both a desktop and a narrow mobile screen.

## Add the project to GitHub

The intended repository is [Natixonix/maine](https://github.com/Natixonix/maine).

1. Sign in to the GitHub account that owns the repository.
2. Choose **Add file → Upload files**.
3. Upload the extracted project files to the repository root so that `index.html` appears at the top level. Upload the contents, not the ZIP archive or an extra enclosing folder. Keep the existing MIT licence.
4. Review the file list and commit the changes.

If GitHub Pages is available for the repository, its usual setup is **Settings → Pages → Deploy from a branch → main → /(root)**. Save the setting and use the deployment URL GitHub displays once publication completes.

After completing the exercises, add a reviewed report of your actual work. The report and your explanation of specific decisions make the project useful to a reader assessing your evaluation skills.

## Licence

MIT. See [LICENSE](LICENSE) for the repository's existing licence notice.
