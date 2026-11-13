(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PEL = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const DATASET_VERSION = 'pl-eval-v1';
  const DIMENSIONS = Object.freeze([
    { key: 'accuracy', label: 'Poprawność', hint: 'Fakty, obliczenia i zgodność z podanym kontekstem.' },
    { key: 'instructions', label: 'Instrukcja', hint: 'Wykonanie polecenia, wymagany format i ograniczenia.' },
    { key: 'language', label: 'Język polski', hint: 'Poprawność języka, naturalność i jasność.' },
    { key: 'usefulness', label: 'Użyteczność', hint: 'Czy odpowiedź faktycznie pomaga wykonać zadanie?' }
  ]);
  const ISSUES = Object.freeze([
    { key: 'factual_error', label: 'Błąd merytoryczny' },
    { key: 'unsupported_claim', label: 'Niepoparta informacja' },
    { key: 'instruction_violation', label: 'Istotne naruszenie instrukcji' },
    { key: 'meaning_change', label: 'Zmiana znaczenia' }
  ]);
  const PREFERENCE_LABELS = Object.freeze({ A: 'Odpowiedź A', B: 'Odpowiedź B', tie: 'Remis', skip: 'Pomijam ocenę' });
  const CONFIDENCE_LABELS = Object.freeze({ low: 'Niska', medium: 'Średnia', high: 'Wysoka' });
  const own = (value, key) => Object.prototype.hasOwnProperty.call(value || {}, key);
  const issueKeys = new Set(ISSUES.map(x => x.key));
  function blankScores() { return Object.fromEntries(DIMENSIONS.map(d => [d.key, null])); }
  function blankDraft() { return { preference: '', ratings: { A: blankScores(), B: blankScores() }, reason: '', confidence: '', issues: { A: [], B: [] } }; }
  function validTimestamp(value) { return typeof value === 'string' && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value; }
  function validateReview(value) {
    const errors = [];
    if (!value || typeof value !== 'object' || Array.isArray(value)) return ['Nieprawidłowy format oceny.'];
    if (!own(PREFERENCE_LABELS, value.preference)) errors.push('Wybierz odpowiedź A, B, remis albo pominięcie.');
    if (typeof value.reason !== 'string' || value.reason.trim().length < 30) errors.push('Uzasadnij wybór w co najmniej 30 znakach. Wskaż konkretny fragment lub kryterium.');
    if (typeof value.reason === 'string' && value.reason.length > 4000) errors.push('Uzasadnienie może mieć maksymalnie 4000 znaków.');
    if (value.preference !== 'skip') {
      if (!own(CONFIDENCE_LABELS, value.confidence)) errors.push('Określ pewność swojej oceny.');
      const missing = ['A', 'B'].some(side => DIMENSIONS.some(d => !Number.isInteger(value.ratings?.[side]?.[d.key]) || value.ratings[side][d.key] < 1 || value.ratings[side][d.key] > 5));
      if (missing) errors.push('Oceń obie odpowiedzi we wszystkich czterech kryteriach, od 1 do 5.');
    }
    if (value.issues !== undefined) {
      for (const side of ['A', 'B']) {
        if (!Array.isArray(value.issues?.[side]) || value.issues[side].length > ISSUES.length || value.issues[side].some(x => !issueKeys.has(x)) || new Set(value.issues[side]).size !== value.issues[side].length) errors.push('Nieprawidłowa lista błędów krytycznych.');
      }
    }
    return [...new Set(errors)];
  }
  function normalizeReview(value, caseId, now = new Date().toISOString(), referenceSeenBeforeSave = false, previous = null) {
    const errors = validateReview(value);
    if (errors.length) throw new Error(errors.join(' '));
    if (!validTimestamp(now)) throw new Error('Nieprawidłowy czas zapisu.');
    const skipped = value.preference === 'skip';
    return {
      caseId, preference: value.preference,
      ratings: Object.fromEntries(['A', 'B'].map(side => [side, Object.fromEntries(DIMENSIONS.map(d => [d.key, skipped ? null : value.ratings[side][d.key]]))])),
      reason: value.reason.trim(), confidence: skipped ? null : value.confidence,
      issues: { A: skipped ? [] : [...(value.issues?.A || [])], B: skipped ? [] : [...(value.issues?.B || [])] },
      firstSavedAt: previous?.firstSavedAt || now, savedAt: now,
      referenceSeenBeforeSave: Boolean(referenceSeenBeforeSave),
      referenceViewedAt: previous?.referenceViewedAt || null
    };
  }
  function summarize(reviews, cases) {
    const validIds = new Set(cases.map(c => c.id));
    const values = Object.values(reviews || {}).filter(r => validIds.has(r.caseId));
    const decisions = values.filter(r => r.preference !== 'skip');
    return {
      total: cases.length, saved: values.length, reviewed: decisions.length,
      skipped: values.length - decisions.length, remaining: cases.length - values.length,
      ties: decisions.filter(r => r.preference === 'tie').length,
      lowConfidence: decisions.filter(r => r.confidence === 'low').length,
      referenceAssisted: decisions.filter(r => r.referenceSeenBeforeSave).length,
      issues: decisions.reduce((sum, r) => sum + r.issues.A.length + r.issues.B.length, 0)
    };
  }
  function exportObject(reviews, cases, reviewerName = '') {
    return {
      schemaVersion: 1, datasetVersion: DATASET_VERSION, createdAt: new Date().toISOString(),
      reviewerName: String(reviewerName).trim().slice(0, 80),
      provenance: 'Synthetic practice examples and illustrative reference notes created with AI assistance. Ratings and rationales are entered by the person using this app. Not an official Alignerr assessment.',
      reviews: cases.filter(c => own(reviews, c.id)).map(c => reviews[c.id])
    };
  }
  function parseBackup(text, cases) {
    if (typeof text !== 'string' || text.length > 2000000) throw new Error('Plik jest zbyt duży. Maksymalny rozmiar to 2 MB.');
    let value;
    try { value = JSON.parse(text); } catch { throw new Error('Ten plik nie zawiera poprawnego JSON.'); }
    if (!value || value.schemaVersion !== 1 || value.datasetVersion !== DATASET_VERSION) throw new Error('Nieobsługiwana wersja pliku lub inny zestaw przykładów.');
    if (!Array.isArray(value.reviews) || value.reviews.length > cases.length) throw new Error('Nieprawidłowa liczba ocen.');
    if (value.reviewerName !== undefined && (typeof value.reviewerName !== 'string' || value.reviewerName.length > 80)) throw new Error('Nieprawidłowy podpis raportu.');
    const validIds = new Set(cases.map(c => c.id));
    const seen = new Set();
    const reviews = {};
    for (const record of value.reviews) {
      if (!record || !validIds.has(record.caseId) || seen.has(record.caseId)) throw new Error('Plik zawiera nieznany albo powtórzony identyfikator przykładu.');
      if (!validTimestamp(record.savedAt) || !validTimestamp(record.firstSavedAt) || typeof record.referenceSeenBeforeSave !== 'boolean' || (record.referenceViewedAt !== null && !validTimestamp(record.referenceViewedAt))) throw new Error('Ocena zawiera nieprawidłowe informacje o zapisie lub omówieniu.');
      if (Date.parse(record.firstSavedAt) > Date.parse(record.savedAt)) throw new Error('Pierwszy zapis nie może być późniejszy od ostatniego.');
      if (record.referenceViewedAt && Date.parse(record.referenceViewedAt) < Date.parse(record.firstSavedAt)) throw new Error('Omówienie nie mogło być wyświetlone przed pierwszym zapisem.');
      if (record.referenceViewedAt && Date.parse(record.referenceViewedAt) < Date.parse(record.savedAt) && !record.referenceSeenBeforeSave) throw new Error('Niespójna informacja o znajomości omówienia przed zapisem.');
      if (record.referenceSeenBeforeSave && (!record.referenceViewedAt || Date.parse(record.referenceViewedAt) > Date.parse(record.savedAt))) throw new Error('Niespójny czas wyświetlenia omówienia.');
      if (record.preference === 'skip' && (record.confidence !== null || ['A', 'B'].some(side => DIMENSIONS.some(d => record.ratings?.[side]?.[d.key] !== null)))) throw new Error('Pominięty przykład nie może zawierać ocen punktowych.');
      const normalized = normalizeReview(record, record.caseId, record.savedAt, record.referenceSeenBeforeSave, record);
      reviews[record.caseId] = normalized;
      seen.add(record.caseId);
    }
    return { reviews, reviewerName: value.reviewerName || '' };
  }
  function csvCell(value) {
    let text = value === null || value === undefined ? '' : String(value);
    if (/^\s*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }
  function toCSV(reviews, cases) {
    const headers = ['case_id', 'category', 'preference', 'confidence', ...['A', 'B'].flatMap(s => DIMENSIONS.map(d => `${s}_${d.key}`)), 'issues_A', 'issues_B', 'rationale', 'first_saved_at', 'saved_at', 'reference_seen_before_save', 'reference_viewed_at'];
    const rows = cases.filter(c => own(reviews, c.id)).map(c => {
      const r = reviews[c.id];
      return [c.id, c.category, r.preference, r.confidence, ...['A', 'B'].flatMap(s => DIMENSIONS.map(d => r.ratings[s][d.key])), r.issues.A.join(';'), r.issues.B.join(';'), r.reason, r.firstSavedAt, r.savedAt, r.referenceSeenBeforeSave, r.referenceViewedAt];
    });
    return '\uFEFF' + [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n');
  }
  function md(value) { return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/([\\`*_{}\[\]()#+.!|])/g, '\\$1'); }
  function toMarkdown(reviews, cases, reviewerName = '') {
    const s = summarize(reviews, cases);
    const lines = ['# Polish Eval Lab — raport portfolio', '', reviewerName.trim() ? `Osoba oceniająca: ${md(reviewerName.trim())}` : 'Osoba oceniająca: nie podano', `Zestaw: ${DATASET_VERSION}`, '', '## Zakres', '', `Oceniono ${s.reviewed} z ${s.total} przykładów. Pominięto: ${s.skipped}. Bez zapisanego wyniku: ${s.remaining}.`, `Oceny zapisane po wcześniejszym obejrzeniu omówienia: ${s.referenceAssisted}.`, '', 'Przykłady są syntetyczne, a omówienia powstały z pomocą AI. Raport dokumentuje ręcznie wpisane wybory i uzasadnienia; nie jest wynikiem oficjalnego testu Alignerr, oceną kwalifikacji ani benchmarkiem modeli. Nie stanowi uwierzytelnionego dziennika audytowego.', '', '## Metoda', '', 'Dwie odpowiedzi oceniane w skali 1–5: poprawność, zgodność z instrukcją, język polski i użyteczność. Wybór A/B/remis/pominięcie, poziom pewności, flagi istotnych błędów oraz uzasadnienie. Przykładowe omówienie staje się dostępne po zapisaniu oceny. Zmiany po obejrzeniu omówienia są oznaczane.', ''];
    for (const c of cases) {
      const r = reviews[c.id];
      if (!r) continue;
      lines.push(`## ${md(c.id)} — ${md(c.title)}`, '', `Kategoria: ${md(c.category)}`, '', '**Polecenie**', '', ...c.prompt.split('\n').map(line => '> ' + md(line)), '', '**Odpowiedź A**', '', ...c.responseA.split('\n').map(line => '> ' + md(line)), '', '**Odpowiedź B**', '', ...c.responseB.split('\n').map(line => '> ' + md(line)), '', `**Wybór:** ${PREFERENCE_LABELS[r.preference]}`, `**Pewność:** ${CONFIDENCE_LABELS[r.confidence] || 'Nie dotyczy — pominięcie'}`, '');
      if (r.preference !== 'skip') {
        lines.push('| Kryterium | A | B |', '|---|---:|---:|', ...DIMENSIONS.map(d => `| ${d.label} | ${r.ratings.A[d.key]} | ${r.ratings.B[d.key]} |`), '');
        for (const side of ['A', 'B']) lines.push(`Flagi ${side}: ${r.issues[side].map(key => ISSUES.find(i => i.key === key).label).join(', ') || 'Brak zaznaczonych flag'}`);
      }
      lines.push('', '**Uzasadnienie osoby oceniającej**', '', ...r.reason.split('\n').map(line => '> ' + md(line)), '', `Zapis: ${r.savedAt}. Omówienie znane przed tym zapisem: ${r.referenceSeenBeforeSave ? 'tak' : 'nie'}.`, '');
    }
    return lines.join('\n');
  }
  return { DATASET_VERSION, DIMENSIONS, ISSUES, PREFERENCE_LABELS, CONFIDENCE_LABELS, blankDraft, validateReview, normalizeReview, summarize, exportObject, parseBackup, csvCell, toCSV, toMarkdown };
});
