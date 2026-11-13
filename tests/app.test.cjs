'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const STORAGE_KEY = 'polish-eval-lab:v1';

/*
 * Startup integration checks, not browser or DOM tests.
 * Actual application scripts execute in a vm. The document adapter captures
 * generated HTML and the two status mutations needed during startup. It does
 * not parse HTML, lay out a page, emulate input events or test downloads.
 */
function boot({ includeCases = true, throwStorage = false, seed = null } = {}) {
  const persisted = new Map();
  const calls = { reads: 0, writes: 0 };
  const listeners = new Map();
  const element = () => ({
    innerHTML: '', textContent: '', hidden: true,
    addEventListener(type, handler) { listeners.set(type, handler); }
  });
  const root = element();
  root.querySelectorAll = () => [];
  const status = element();
  const warning = element();
  const backupInput = element();
  const elements = new Map([
    ['app', root], ['backup-input', backupInput],
    ['storage-status', status], ['storage-warning', warning]
  ]);
  const sandbox = {
    document: { getElementById: id => elements.get(id) || null },
    localStorage: {
      getItem(key) {
        calls.reads++;
        if (throwStorage) throw new Error('Storage is unavailable in this test');
        return persisted.get(key) || null;
      },
      setItem(key, value) {
        calls.writes++;
        if (throwStorage) throw new Error('Storage is unavailable in this test');
        persisted.set(key, value);
      }
    },
    addEventListener(type, handler) { listeners.set(`window:${type}`, handler); },
    setTimeout, clearTimeout
  };
  sandbox.window = sandbox;
  const context = vm.createContext(sandbox);
  vm.runInContext(source('core.js'), context, { filename: 'core.js' });
  if (includeCases) vm.runInContext(source('cases.js'), context, { filename: 'cases.js' });
  if (seed) persisted.set(STORAGE_KEY, seed(context));
  vm.runInContext(source('app.js'), context, { filename: 'app.js' });
  return { root, status, warning, persisted, calls, listeners, context };
}

function checkedInputs(html, namePattern) {
  return (html.match(/<input\b[^>]*>/g) || [])
    .filter(tag => namePattern.test(tag) && /\schecked(?:\s|>)/.test(tag));
}

test('application boots empty without checked scores or fabricated saved reviews', () => {
  const app = boot();
  assert.match(app.root.innerHTML, /Polish Eval Lab/);
  assert.match(app.root.innerHTML, /Oceniaj odpowiedzi/);
  assert.match(app.root.innerHTML, /aria-valuenow="0"/);
  assert.equal(checkedInputs(app.root.innerHTML, /name="score-/).length, 0);
  assert.equal(checkedInputs(app.root.innerHTML, /name="preference"/).length, 0);
  assert.match(app.root.innerHTML, /data-action="reference"\s+disabled/);
  const saved = JSON.parse(app.persisted.get(STORAGE_KEY));
  assert.deepEqual(saved.reviews, {});
  assert.equal(Object.values(saved.drafts).filter(d => d.preference || d.reason).length, 0);
  assert.equal(app.status.textContent, 'Zapis lokalny');
});

test('application restores a valid saved review through its actual storage-loading path', () => {
  const reason = 'Wybrana odpowiedź zachowuje fakty i spełnia wszystkie wymagania polecenia.';
  let recordId;
  const app = boot({ seed(context) {
    const C = context.PEL;
    recordId = context.PEL_CASES[0].id;
    const draft = C.blankDraft();
    draft.preference = 'A';
    draft.confidence = 'high';
    draft.reason = reason;
    for (const side of ['A', 'B']) {
      for (const dimension of C.DIMENSIONS) draft.ratings[side][dimension.key] = side === 'A' ? 5 : 3;
    }
    const record = C.normalizeReview(draft, recordId, '2026-11-13T07:00:00.000Z');
    const exported = C.exportObject({ [recordId]: record }, context.PEL_CASES, 'Test Reviewer');
    return JSON.stringify({
      schemaVersion: exported.schemaVersion, datasetVersion: exported.datasetVersion,
      reviewerName: exported.reviewerName, activeId: recordId, drafts: {},
      reviews: Object.fromEntries(exported.reviews.map(item => [item.caseId, item]))
    });
  } });
  assert.match(app.root.innerHTML, /aria-valuenow="1"/);
  assert.equal(checkedInputs(app.root.innerHTML, /name="score-/).length, 8);
  assert.equal(checkedInputs(app.root.innerHTML, /name="preference" value="A"/).length, 1);
  assert.match(app.root.innerHTML, /<option value="high" selected>Wysoka<\/option>/);
  assert.ok(app.root.innerHTML.includes(reason));
  assert.doesNotMatch(app.root.innerHTML, /data-action="reference"\s+disabled/);
  const saved = JSON.parse(app.persisted.get(STORAGE_KEY));
  assert.equal(Object.keys(saved.reviews).length, 1);
  assert.equal(saved.reviews[recordId].reason, reason);
  assert.equal(saved.reviewerName, 'Test Reviewer');
});

test('unavailable storage does not prevent startup and produces a persistence warning', () => {
  const app = boot({ throwStorage: true });
  assert.match(app.root.innerHTML, /Oceniaj odpowiedzi/);
  assert.match(app.root.innerHTML, /Nie udało się przywrócić zapisu tej przeglądarki/);
  assert.equal(app.status.textContent, 'Tylko w tej karcie');
  assert.equal(app.warning.hidden, false);
  assert.match(app.warning.textContent, /Przeglądarka nie zapisała danych na dysku/);
  assert.match(app.warning.textContent, /Pobierz kopię JSON/);
  assert.equal(app.calls.reads, 1);
  assert.equal(app.calls.writes, 1);
});

test('missing cases script shows an actionable diagnostic instead of a partial workspace', () => {
  const app = boot({ includeCases: false });
  assert.match(app.root.innerHTML, /Nie udało się wczytać projektu/);
  assert.match(app.root.innerHTML, /Wypakuj całą paczkę/);
  assert.match(app.root.innerHTML, /cases\.js/);
  assert.doesNotMatch(app.root.innerHTML, /class="rating-matrix"/);
  assert.equal(app.calls.reads, 0);
  assert.equal(app.calls.writes, 0);
});
