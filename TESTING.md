# Validation

Validation date: 13 November 2026.

## Executed checks

Run from this directory with Node.js:

```bash
node --test tests/*.test.cjs
```

Result at packaging: **27 passed, 0 failed**.

The 23 core checks cover complete and partial ratings, ties and skips, rationale validation, issue flags, backup roundtrips, corrupted imports, reference-view chronology, CSV escaping and formula protection, Markdown evidence, and dataset integrity.

The 4 startup checks run the actual application scripts in a Node VM with a minimal document and storage adapter. They cover an empty initial state, restoration of a saved review, storage failure and a missing-dataset diagnostic. This adapter is not a complete browser DOM.

Syntax checks passed for `core.js`, `cases.js` and `app.js`. The existing MIT licence was preserved byte for byte. The 12 examples were reviewed for consistency between instructions, preferences and illustrative explanations.

## Browser validation still to perform

Full browser interaction, downloads, visual layout and responsive behaviour were **not verified** in this environment. Local Chromium was blocked by process restrictions, and the available cloud browser did not allow local file URLs. The restrictions were not bypassed.

Before sharing the project, perform these checks in a current desktop browser:

1. Extract the entire folder and open `index.html`. Confirm that the initial count is zero and no ratings are selected.
2. Attempt to save an empty review. Confirm that the app asks for missing ratings, preference, confidence and rationale.
3. Enter all eight ratings, a preference, confidence and a specific rationale. Save, reload the page and check that the values remain.
4. Open the illustrative discussion after saving. Change the review and save again. Confirm that the report marks prior reference exposure.
5. Write an unfinished rationale in another example, navigate away and back, and confirm that the draft remains. Drafts are local only; exports include saved reviews.
6. Save one skipped example. Confirm that it counts as skipped, not as a completed comparison.
7. Export JSON, CSV and Markdown. Check their contents. Back up the JSON, reset the workspace, import the backup and verify restored values.
8. Check the interface in a narrow window or on a phone, including rating controls, report tables and buttons.
9. If local storage is unavailable, confirm that a warning appears and use JSON exports to preserve saved work.

Do not count these manual checks as passed until they have actually been performed.
