'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const PEL = require('../core.js');

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'cases.js'), 'utf8'), sandbox, { filename: 'cases.js' });
const cases = JSON.parse(JSON.stringify(sandbox.window.PEL_CASES));
const FIRST = '2026-11-13T07:00:00.000Z';
const VIEWED = '2026-11-13T07:01:00.000Z';
const REVISED = '2026-11-13T07:02:00.000Z';
const REASON = 'Odpowiedź zachowuje wszystkie podane informacje i dokładnie spełnia wymagany format.';
const clone = value => JSON.parse(JSON.stringify(value));

function input(overrides = {}) {
  return {
    preference: 'A',
    ratings: {
      A: { accuracy: 5, instructions: 5, language: 4, usefulness: 5 },
      B: { accuracy: 3, instructions: 2, language: 4, usefulness: 3 }
    },
    reason: REASON,
    confidence: 'high',
    issues: { A: [], B: ['instruction_violation'] },
    ...overrides
  };
}

function review(caseIndex = 0, overrides = {}, now = FIRST, referenceSeen = false, previous = null) {
  return PEL.normalizeReview(input(overrides), cases[caseIndex].id, now, referenceSeen, previous);
}

function backup(records = [review()]) {
  return PEL.exportObject(Object.fromEntries(records.map(r => [r.caseId, r])), cases, 'Test Reviewer');
}

function parse(value) {
  return PEL.parseBackup(JSON.stringify(value), cases);
}

// A small reader verifies CSV behaviour as another program would consume it.
function readCSV(source) {
  const text = source.replace(/^\uFEFF/, '');
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(field); field = '';
    } else if ((char === '\r' || char === '\n') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += char;
  }
  row.push(field); rows.push(row);
  assert.equal(quoted, false, 'CSV must close quoted fields');
  return rows;
}

test('a new workspace contains no completed reviews or preselected judgments', () => {
  const draft = PEL.blankDraft();
  assert.equal(draft.preference, '');
  assert.equal(draft.reason, '');
  assert.equal(draft.confidence, '');
  for (const side of ['A', 'B']) {
    assert.deepEqual(draft.issues[side], []);
    for (const dimension of PEL.DIMENSIONS) assert.equal(draft.ratings[side][dimension.key], null);
  }
  assert.deepEqual(PEL.summarize({}, cases), {
    total: 12, saved: 0, reviewed: 0, skipped: 0, remaining: 12,
    ties: 0, lowConfidence: 0, referenceAssisted: 0, issues: 0
  });
  assert.deepEqual(backup([]).reviews, []);
});

test('drafts are independent objects and editing one does not fill another', () => {
  const first = PEL.blankDraft();
  const second = PEL.blankDraft();
  first.ratings.A.accuracy = 5;
  first.issues.A.push('factual_error');
  assert.equal(first.ratings.B.accuracy, null);
  assert.equal(second.ratings.A.accuracy, null);
  assert.deepEqual(second.issues.A, []);
});

test('all eight ratings are required for a comparative review', () => {
  for (const side of ['A', 'B']) {
    for (const dimension of PEL.DIMENSIONS) {
      const draft = input();
      delete draft.ratings[side][dimension.key];
      assert.ok(PEL.validateReview(draft).length > 0);
      assert.throws(() => PEL.normalizeReview(draft, cases[0].id, FIRST));
    }
  }
});

test('scores outside 1–5, fractional values and numeric strings are rejected', () => {
  for (const score of [0, 6, -1, 1.5, '5', null, NaN, Infinity]) {
    const draft = input();
    draft.ratings.A.accuracy = score;
    assert.ok(PEL.validateReview(draft).length > 0, `invalid score: ${String(score)}`);
  }
  assert.deepEqual(PEL.validateReview(input()), []);
});

test('preference, confidence and review container shape are validated', () => {
  for (const bad of [null, [], 'text']) assert.ok(PEL.validateReview(bad).length > 0);
  for (const preference of ['', 'C', 'toString', '__proto__']) {
    assert.ok(PEL.validateReview(input({ preference })).length > 0);
  }
  for (const confidence of ['', null, 'certain', 'toString']) {
    assert.ok(PEL.validateReview(input({ confidence })).length > 0);
  }
});

test('rationale validation uses trimmed length and normalization preserves user meaning', () => {
  assert.throws(() => review(0, { reason: ' '.repeat(20) + 'a'.repeat(29) + '\n' }));
  assert.equal(review(0, { reason: '  ' + 'a'.repeat(30) + '\n' }).reason, 'a'.repeat(30));
  const rationale = '  Pierwsza obserwacja dotyczy instrukcji.\nDruga obserwacja wyjaśnia różnicę.  ';
  assert.equal(review(0, { reason: rationale }).reason, rationale.trim());
  assert.throws(() => review(0, { reason: 'a'.repeat(4001) }));
});

test('skip records neither inflate reviewed totals nor retain stale numerical ratings', () => {
  const skipped = review(0, { preference: 'skip' });
  const values = { [skipped.caseId]: skipped };
  const summary = PEL.summarize(values, cases);
  assert.equal(summary.saved, 1);
  assert.equal(summary.reviewed, 0);
  assert.equal(summary.skipped, 1);
  assert.equal(summary.remaining, 11);
  assert.equal(skipped.confidence, null);
  for (const side of ['A', 'B']) {
    assert.deepEqual(skipped.issues[side], []);
    for (const dimension of PEL.DIMENSIONS) assert.equal(skipped.ratings[side][dimension.key], null);
  }
  const csv = readCSV(PEL.toCSV(values, cases));
  for (const side of ['A', 'B']) {
    for (const dimension of PEL.DIMENSIONS) assert.equal(csv[1][csv[0].indexOf(`${side}_${dimension.key}`)], '');
  }
  assert.doesNotMatch(PEL.toMarkdown(values, cases), /\| Kryterium \| A \| B \|/);
});

test('ties and low-confidence decisions are counted without creating a correctness score', () => {
  const tied = review(0, { preference: 'tie', confidence: 'low', issues: { A: [], B: [] } });
  const other = review(1, { preference: 'B' });
  const summary = PEL.summarize({ [tied.caseId]: tied, [other.caseId]: other }, cases);
  assert.equal(summary.reviewed, 2);
  assert.equal(summary.ties, 1);
  assert.equal(summary.lowConfidence, 1);
  assert.equal(summary.remaining, 10);
  assert.equal(Object.hasOwn(summary, 'accuracy'), false);
});

test('critical issue lists reject unknown, duplicated and malformed values', () => {
  for (const issues of [
    { A: ['unknown_issue'], B: [] },
    { A: ['factual_error', 'factual_error'], B: [] },
    { A: 'factual_error', B: [] },
    { A: [], B: null },
    { A: [] }
  ]) assert.throws(() => review(0, { issues }));
});

test('JSON backup roundtrip preserves judgments, notes, timestamps and reference provenance', () => {
  const initial = review(0);
  const revised = review(0, { reason: REASON + ' Uzupełniono wyjaśnienie.' }, REVISED, true, { ...initial, referenceViewedAt: VIEWED });
  const records = [revised, review(1, { preference: 'skip' }), review(2, { preference: 'tie', confidence: 'medium' })];
  const encoded = PEL.exportObject(Object.fromEntries(records.map(r => [r.caseId, r])), cases, '  Test Reviewer  ');
  const restored = parse(encoded);
  assert.equal(restored.reviewerName, 'Test Reviewer');
  assert.deepEqual(restored.reviews, Object.fromEntries(records.map(r => [r.caseId, r])));
  assert.equal(PEL.summarize(restored.reviews, cases).referenceAssisted, 1);
});

test('invalid JSON, excessive input and incompatible backup versions are rejected', () => {
  assert.throws(() => PEL.parseBackup('{broken', cases));
  assert.throws(() => PEL.parseBackup('a'.repeat(2000001), cases));
  assert.throws(() => parse({ ...backup(), schemaVersion: 2 }));
  assert.throws(() => parse({ ...backup(), datasetVersion: 'another-dataset' }));
  assert.throws(() => parse({ ...backup(), reviews: {} }));
  assert.throws(() => parse({ ...backup(), reviewerName: 42 }));
  assert.throws(() => parse({ ...backup(), reviewerName: 'x'.repeat(81) }));
});

test('unknown or duplicated case identifiers cannot enter an imported workspace', () => {
  const unknown = backup(); unknown.reviews[0].caseId = 'PEL-999';
  assert.throws(() => parse(unknown));
  const duplicate = backup(); duplicate.reviews.push(clone(duplicate.reviews[0]));
  assert.throws(() => parse(duplicate));
  const prototype = backup(); prototype.reviews[0].caseId = '__proto__';
  assert.throws(() => parse(prototype));
});

test('imports reject malformed and impossible calendar timestamps', () => {
  for (const field of ['firstSavedAt', 'savedAt']) {
    for (const timestamp of ['yesterday', '2026-13-01T07:00:00.000Z', '2026-02-30T07:00:00.000Z']) {
      const value = backup(); value.reviews[0][field] = timestamp;
      assert.throws(() => parse(value), `${field}: ${timestamp}`);
    }
  }
  const malformedReference = backup(); malformedReference.reviews[0].referenceViewedAt = 'never';
  assert.throws(() => parse(malformedReference));
  const wrongBoolean = backup(); wrongBoolean.reviews[0].referenceSeenBeforeSave = 'false';
  assert.throws(() => parse(wrongBoolean));
});

test('an imported revision cannot precede the first saved evaluation', () => {
  const value = backup(); value.reviews[0].firstSavedAt = REVISED;
  assert.throws(() => parse(value));
});

test('reference exposure cannot be recorded before the first saved evaluation', () => {
  const value = backup();
  Object.assign(value.reviews[0], {
    firstSavedAt: VIEWED, savedAt: REVISED,
    referenceViewedAt: FIRST, referenceSeenBeforeSave: true
  });
  assert.throws(() => parse(value));
});

test('reference-assisted revisions cannot be relabeled as blind evaluations', () => {
  const value = backup();
  Object.assign(value.reviews[0], { savedAt: REVISED, referenceViewedAt: VIEWED, referenceSeenBeforeSave: false });
  assert.throws(() => parse(value));
});

test('reference timing distinguishes initial exposure from later assisted revisions', () => {
  const initial = backup(); initial.reviews[0].referenceViewedAt = VIEWED;
  assert.equal(parse(initial).reviews[cases[0].id].referenceSeenBeforeSave, false);
  const assisted = clone(initial);
  Object.assign(assisted.reviews[0], { savedAt: REVISED, referenceSeenBeforeSave: true });
  assert.equal(parse(assisted).reviews[cases[0].id].referenceSeenBeforeSave, true);
  const future = clone(assisted); future.reviews[0].referenceViewedAt = '2026-11-13T08:00:00.000Z';
  assert.throws(() => parse(future));
  const missing = clone(assisted); missing.reviews[0].referenceViewedAt = null;
  assert.throws(() => parse(missing));
});

test('imports reject corrupted ratings, issue flags and numerical scores on a skip', () => {
  const rating = backup(); rating.reviews[0].ratings.B.language = '4';
  assert.throws(() => parse(rating));
  const issues = backup(); issues.reviews[0].issues.A = ['unknown'];
  assert.throws(() => parse(issues));
  const skipped = backup([review(0, { preference: 'skip' })]);
  skipped.reviews[0].ratings.A.accuracy = 5;
  assert.throws(() => parse(skipped));
});

test('CSV preserves commas, quotes and multiline explanations as one field', () => {
  const reason = 'Ocena zawiera przecinek, cytat "przykład" i własny komentarz.\nDrugi wiersz uzasadnia decyzję.';
  const record = review(0, { reason });
  const rows = readCSV(PEL.toCSV({ [record.caseId]: record }, cases));
  assert.equal(rows.length, 2);
  assert.equal(rows[0].length, rows[1].length);
  assert.equal(rows[1][rows[0].indexOf('rationale')], reason);
  assert.equal(rows[1][rows[0].indexOf('case_id')], cases[0].id);
});

test('CSV protects spreadsheet readers against formula-prefixed user content', () => {
  for (const text of ['=1+1', '+SUM(A1:A2)', '-1+2', '@SUM(A1:A2)', '  =1+1', '\ttext', '\rtext', '\ntext']) {
    const cell = readCSV(PEL.csvCell(text));
    assert.equal(cell[0][0], "'" + text);
  }
  const record = review(0, { reason: '=SUM(A1:A2) oraz dalsza treść uzasadniająca ocenę przykładu.' });
  const rows = readCSV(PEL.toCSV({ [record.caseId]: record }, cases));
  assert.equal(rows[1][rows[0].indexOf('rationale')], "'" + record.reason);
});

test('Markdown report contains actual evidence and discloses reference-assisted judgment', () => {
  const sample = { ...cases[0], prompt: 'Polecenie źródłowe do oceny', responseA: 'Pierwsza rzeczywista odpowiedź', responseB: 'Druga rzeczywista odpowiedź' };
  const initial = review(0);
  const record = review(0, {}, REVISED, true, { ...initial, referenceViewedAt: VIEWED });
  const report = PEL.toMarkdown({ [record.caseId]: record }, [sample], 'Test Reviewer');
  for (const text of [sample.prompt, sample.responseA, sample.responseB, 'Test Reviewer']) assert.ok(report.includes(text), text);
  assert.ok(report.includes(REASON.replace(/\./g, '\\.')));
  assert.match(report, /Oceniono 1 z 1 przykładów/);
  assert.match(report, /Omówienie znane przed tym zapisem: tak/);
  assert.match(report, /nie jest wynikiem oficjalnego testu Alignerr/);
});

test('Markdown escapes user HTML and keeps multiline explanations in quoted text', () => {
  const reason = '<img src=x onerror=alert(1)>\n# Własny opis obejmuje konkretne wymaganie zadania.';
  const record = review(0, { reason });
  const report = PEL.toMarkdown({ [record.caseId]: record }, cases, '<b>Reviewer</b>');
  assert.doesNotMatch(report, /<img|<b>/);
  assert.match(report, /&lt;img/);
  assert.ok(report.includes('\n> \\# Własny opis'));
});

test('dataset has 12 unique examples, balanced illustrative choices and no human defaults', () => {
  assert.equal(cases.length, 12);
  assert.equal(new Set(cases.map(c => c.id)).size, 12);
  const counts = { A: 0, B: 0, tie: 0 };
  const allowedCategories = new Set(['Zgodność z instrukcją', 'Poprawność', 'Język polski', 'Użyteczność', 'Niepewność']);
  const allowedIssues = new Set(PEL.ISSUES.map(issue => issue.key));
  for (const item of cases) {
    assert.match(item.id, /^PEL-\d{3}$/);
    assert.ok(allowedCategories.has(item.category));
    for (const key of ['title', 'prompt', 'responseA', 'responseB']) assert.ok(typeof item[key] === 'string' && item[key].trim().length > 0);
    assert.ok(Object.hasOwn(counts, item.reference.preferred));
    counts[item.reference.preferred]++;
    assert.ok(item.reference.reason.length >= 30);
    for (const side of ['A', 'B']) {
      const issues = item.reference[`criticalIssues${side}`];
      assert.ok(Array.isArray(issues));
      assert.ok(issues.every(issue => allowedIssues.has(issue)));
    }
    for (const key of ['ratings', 'reason', 'preference', 'savedAt']) assert.equal(Object.hasOwn(item, key), false);
  }
  assert.deepEqual(counts, { A: 5, B: 5, tie: 2 });
});
