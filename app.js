(function () {
  'use strict';
  const C = window.PEL;
  const cases = window.PEL_CASES;
  const root = document.getElementById('app');
  if (!C || !Array.isArray(cases) || !cases.length) {
    root.innerHTML = '<main style="max-width:600px;margin:60px auto;padding:20px"><h1>Nie udało się wczytać projektu</h1><p>Wypakuj całą paczkę. Pliki index.html, core.js, cases.js, app.js i styles.css muszą leżeć obok siebie.</p></main>';
    return;
  }
  const KEY = 'polish-eval-lab:v1';
  const h = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icons = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    book: '<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Z"/><path d="M12 5v15"/>',
    chart: '<path d="M4 3v17h17M9 15V9m5 6V5m5 10v-4"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    circle: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 15v5h16v-5"/>',
    upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/>',
    prompt: '<path d="M21 11a8 8 0 0 1-8 8H5l-3 3V11a9 9 0 0 1 19 0Z"/><path d="M7 9h10M7 13h6"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    back: '<path d="M20 12H4m6-6-6 6 6 6"/>',
    save: '<path d="M5 3h12l4 4v14H3V3h2Z"/><path d="M7 3v6h10V3M7 21v-8h10v8"/>',
    flag: '<path d="M5 21V3m0 1c5-4 9 4 14 0v10c-5 4-9-4-14 0"/>',
    spark: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z"/>',
    dots: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.circle}</svg>`;
  const initialState = () => ({ schemaVersion: 1, datasetVersion: C.DATASET_VERSION, activeId: cases[0].id, view: 'workspace', filter: 'all', reviews: {}, drafts: {}, reviewerName: '' });
  let state = initialState();
  let storageOK = true;
  let storageMessage = '';
  let toastTimer;
  let saveTimer;
  function cleanDraft(value) {
    const d = C.blankDraft();
    if (!value || typeof value !== 'object') return d;
    if (Object.hasOwn(C.PREFERENCE_LABELS, value.preference)) d.preference = value.preference;
    if (Object.hasOwn(C.CONFIDENCE_LABELS, value.confidence)) d.confidence = value.confidence;
    d.reason = typeof value.reason === 'string' ? value.reason.slice(0, 4000) : '';
    for (const side of ['A', 'B']) {
      for (const dim of C.DIMENSIONS) {
        const number = value.ratings?.[side]?.[dim.key];
        if (Number.isInteger(number) && number >= 1 && number <= 5) d.ratings[side][dim.key] = number;
      }
      d.issues[side] = Array.isArray(value.issues?.[side]) ? [...new Set(value.issues[side].filter(key => C.ISSUES.some(i => i.key === key)))] : [];
    }
    return d;
  }
  try {
    const text = localStorage.getItem(KEY);
    if (text) {
      const saved = JSON.parse(text);
      const restored = C.parseBackup(JSON.stringify({ schemaVersion: saved.schemaVersion, datasetVersion: saved.datasetVersion, reviewerName: saved.reviewerName, reviews: Object.values(saved.reviews || {}) }), cases);
      state.reviews = restored.reviews;
      state.reviewerName = restored.reviewerName;
      if (cases.some(c => c.id === saved.activeId)) state.activeId = saved.activeId;
      for (const c of cases) if (saved.drafts?.[c.id]) state.drafts[c.id] = cleanDraft(saved.drafts[c.id]);
    }
  } catch (error) {
    storageMessage = 'Nie udało się przywrócić zapisu tej przeglądarki. Możesz wczytać wcześniej wyeksportowaną kopię JSON.';
  }
  function persist() {
    clearTimeout(saveTimer);
    try { localStorage.setItem(KEY, JSON.stringify(state)); storageOK = true; }
    catch { storageOK = false; storageMessage = 'Przeglądarka nie zapisała danych na dysku. Pozostają w tej karcie. Pobierz kopię JSON przed zamknięciem strony.'; }
    const status = document.getElementById('storage-status');
    if (status) status.textContent = storageOK ? 'Zapis lokalny' : 'Tylko w tej karcie';
    const warning = document.getElementById('storage-warning');
    if (warning && !storageOK) { warning.hidden = false; warning.textContent = storageMessage; }
  }
  function queuePersist() { clearTimeout(saveTimer); saveTimer = setTimeout(persist, 200); }
  function toast(message) {
    const element = document.getElementById('toast');
    clearTimeout(toastTimer);
    element.textContent = message;
    element.hidden = false;
    toastTimer = setTimeout(() => { element.hidden = true; }, 4300);
  }
  const activeCase = () => cases.find(c => c.id === state.activeId) || cases[0];
  function draftFor(id) {
    if (!state.drafts[id]) state.drafts[id] = cleanDraft(state.reviews[id] || C.blankDraft());
    return state.drafts[id];
  }
  function hasDraft(id) {
    const d = state.drafts[id];
    return Boolean(d && (d.reason || d.preference || ['A', 'B'].some(s => Object.values(d.ratings[s]).some(x => x !== null))));
  }
  function dirty(id) {
    if (!hasDraft(id)) return false;
    return JSON.stringify(cleanDraft(state.drafts[id])) !== JSON.stringify(cleanDraft(state.reviews[id]));
  }
  function matchingCases() { return cases.filter(c => state.filter === 'all' || (state.filter === 'pending' && !state.reviews[c.id]) || (state.filter === 'saved' && state.reviews[c.id])); }
  function sidebar() {
    const stats = C.summarize(state.reviews, cases);
    const items = matchingCases();
    return `<aside class="sidebar"><div class="brand"><div class="brand-mark" aria-hidden="true">e.</div><div><div class="brand-name">Polish Eval Lab</div><small>Human judgment matters</small></div></div>
      <nav class="nav" aria-label="Sekcje aplikacji">${[['workspace', 'grid', 'Pracownia'], ['rubric', 'book', 'Kryteria'], ['report', 'chart', 'Raport']].map(([view, sym, label]) => `<button type="button" class="nav-btn ${state.view === view ? 'active' : ''}" data-view="${view}" ${state.view === view ? 'aria-current="page"' : ''}>${icon(sym)}${label}${view === 'report' ? `<span class="nav-count">${stats.reviewed}</span>` : ''}</button>`).join('')}</nav>
      <div class="sidebar-label">Zestaw ćwiczeń · ${cases.length}</div><label class="sr-only" for="case-filter">Filtr przykładów</label><select id="case-filter" class="filter"><option value="all" ${state.filter === 'all' ? 'selected' : ''}>Wszystkie przykłady</option><option value="pending" ${state.filter === 'pending' ? 'selected' : ''}>Bez zapisanego wyniku</option><option value="saved" ${state.filter === 'saved' ? 'selected' : ''}>Zapisane wyniki</option></select>
      <nav class="case-list" aria-label="Przykłady do oceny">${items.length ? items.map(c => { const r = state.reviews[c.id]; const status = r ? (r.preference === 'skip' ? 'skipped' : 'done') : hasDraft(c.id) ? 'draft' : ''; const label = r ? (r.preference === 'skip' ? 'pominięty' : 'oceniony') : hasDraft(c.id) ? 'wersja robocza' : 'do oceny'; return `<button type="button" class="case-item ${state.activeId === c.id && state.view === 'workspace' ? 'active' : ''} ${status}" data-case="${h(c.id)}" aria-label="${h(c.title)}, ${label}" ${state.activeId === c.id && state.view === 'workspace' ? 'aria-current="true"' : ''}><span class="case-num">${String(cases.indexOf(c) + 1).padStart(2, '0')}</span><span class="case-title">${h(c.title)}</span><span class="state-dot" aria-hidden="true"></span></button>`; }).join('') : '<div class="empty-filter">Brak przykładów w tym filtrze.</div>'}</nav>
      <div class="sidebar-bottom"><div class="profile"><div class="avatar" aria-hidden="true">NM</div><div><b>Natalia Michalik</b><small>Projekt portfolio · język polski</small></div></div><p class="sidebar-note">Niezależny projekt edukacyjny.<br>Przykłady syntetyczne · wersja 1.0</p></div></aside>`;
  }
  function statsBar() {
    const s = C.summarize(state.reviews, cases);
    return `<div class="stats" aria-label="Podsumowanie pracy"><div class="stat"><div class="stat-top">Ocenione przykłady ${icon('circle')}</div><strong>${s.reviewed} <span>/ ${s.total}</span></strong><div class="progress" role="progressbar" aria-label="Postęp oceniania" aria-valuemin="0" aria-valuemax="${s.total}" aria-valuenow="${s.reviewed}"><span style="width:${s.reviewed / s.total * 100}%"></span></div></div><div class="stat"><div class="stat-top">Do rozstrzygnięcia ${icon('dots')}</div><strong>${s.remaining}</strong><div class="stat-foot">${s.skipped} pominiętych osobno</div></div><div class="stat"><div class="stat-top">Kryteria oceny ${icon('grid')}</div><strong>4 <span>× A/B</span></strong><div class="stat-foot">Jedna skala od 1 do 5</div></div><div class="stat"><div class="stat-top">Twoje uzasadnienia ${icon('prompt')}</div><strong>${s.saved}</strong><div class="stat-foot">Zapisane w raporcie</div></div></div>`;
  }
  function header(title, text, eyebrow) { return `<div class="hero"><div><div class="eyebrow">${h(eyebrow)}</div><h1>${h(title)}</h1><p>${h(text)}</p></div><div class="hero-aside">${icon('check')} Bez API · bez opłat</div></div>`; }
  function radioGroup(side, dimension, draft, disabled) {
    return `<fieldset class="rating-group"><legend class="sr-only">${dimension.label}, odpowiedź ${side}</legend>${[1,2,3,4,5].map(n => `<label><input type="radio" name="score-${side}-${dimension.key}" value="${n}" data-score-side="${side}" data-dimension="${dimension.key}" ${draft.ratings[side][dimension.key] === n ? 'checked' : ''} ${disabled ? 'disabled' : ''} aria-label="${dimension.label}, ${side}: ${n}"><span>${n}</span></label>`).join('')}</fieldset>`;
  }
  function workspace() {
    const c = activeCase(), draft = draftFor(c.id), r = state.reviews[c.id];
    const index = cases.indexOf(c), skip = draft.preference === 'skip';
    const seen = Boolean(r?.referenceViewedAt);
    return `${header('Oceniaj odpowiedzi. Uzasadniaj wybory.', 'Dobra odpowiedź zaczyna się od uważnej oceny. Porównaj dwie wersje i pokaż, na czym opierasz swój wybór.', 'Pracownia oceny AI')}${statsBar()}
    <div class="workspace-top"><h2>${h(c.title)}</h2><span class="badge">${h(c.category)}</span><span class="badge ${r ? 'green' : ''}" id="draft-status">${dirty(c.id) ? 'Wersja robocza' : r ? 'Zapisano' : 'Do oceny'}</span><span class="steps">Przykład ${String(index + 1).padStart(2,'0')} / ${cases.length} · ${h(c.id)}</span></div>
    <section class="prompt-card" aria-labelledby="prompt-label"><div class="tiny-label" id="prompt-label">${icon('prompt')} Polecenie użytkownika</div><p class="prompt-text">${h(c.prompt)}</p></section>
    <div class="response-grid">${['A','B'].map(side => `<section class="response-card" aria-labelledby="response-${side}"><div class="response-header"><span class="letter ${side === 'B' ? 'b' : ''}">${side}</span><h3 id="response-${side}">Odpowiedź ${side}</h3><small>Przykład syntetyczny</small></div><div class="response-body">${h(c['response' + side])}</div></section>`).join('')}</div>
    <form id="evaluation-form" class="evaluation-card" novalidate><div class="section-heading"><h2>Twoja ocena</h2><small>Oceń treść, a nie samą długość odpowiedzi.</small></div>
    ${seen ? '<p class="review-note">Omówienie zostało już wyświetlone. Kolejny zapis będzie oznaczony jako ocena po zapoznaniu się z omówieniem.</p>' : ''}
    <div class="rating-matrix"><div class="matrix-head first">Kryterium</div><div class="matrix-head">Odpowiedź A</div><div class="matrix-head">Odpowiedź B</div>${C.DIMENSIONS.map(d => `<div class="criterion"><b>${d.label}</b><small>${d.hint}</small></div>${radioGroup('A', d, draft, skip)}${radioGroup('B', d, draft, skip)}`).join('')}</div>
    <p class="scale-note">1 — poważne problemy &nbsp;·&nbsp; 3 — częściowo poprawna &nbsp;·&nbsp; 5 — w pełni spełnia kryterium</p>
    <details class="flag-details" ${draft.issues.A.length + draft.issues.B.length ? 'open' : ''}><summary>Istotne błędy <span class="muted">— zaznacz, jeśli występują</span></summary><div class="flag-grid">${['A','B'].map(side => `<fieldset class="flag-group"><legend>Odpowiedź ${side}</legend>${C.ISSUES.map(issue => `<label class="check-label"><input type="checkbox" data-issue-side="${side}" value="${issue.key}" ${draft.issues[side].includes(issue.key) ? 'checked' : ''} ${skip ? 'disabled' : ''}>${issue.label}</label>`).join('')}</fieldset>`).join('')}</div></details>
    <div class="decision-section"><label id="preference-label">Która odpowiedź lepiej realizuje polecenie?</label><div class="preference-options" role="radiogroup" aria-labelledby="preference-label">${Object.entries(C.PREFERENCE_LABELS).map(([key,label]) => `<label><input type="radio" name="preference" value="${key}" ${draft.preference === key ? 'checked' : ''}><span>${label}</span></label>`).join('')}</div>
    <div class="reason-row"><label for="reason">Uzasadnienie ${skip ? 'pominięcia' : 'wyboru'}</label><small id="reason-count">${draft.reason.trim().length} / min. 30 znaków</small></div><textarea id="reason" name="reason" maxlength="4000" placeholder="Wskaż konkretną różnicę. Który fragment odpowiedzi i które kryterium przesądziły o Twoim wyborze?">${h(draft.reason)}</textarea>
    <div id="form-errors" class="form-error" role="alert" tabindex="-1" hidden></div><div class="form-bottom"><label class="confidence" for="confidence">Pewność oceny<select id="confidence" name="confidence" ${skip ? 'disabled' : ''}><option value="">Wybierz poziom</option>${Object.entries(C.CONFIDENCE_LABELS).map(([key,label]) => `<option value="${key}" ${draft.confidence === key ? 'selected' : ''}>${label}</option>`).join('')}</select></label><div class="save-actions"><button type="submit" class="btn primary">${icon('save')} Zapisz ocenę</button><button type="button" class="btn" data-action="save-next">Zapisz i dalej ${icon('arrow')}</button></div></div></div></form>
    <section class="reference-box" aria-label="Przykładowe omówienie">${seen ? `<h3>Przykładowe omówienie · ${C.PREFERENCE_LABELS[c.reference.preferred]}</h3><p>${h(c.reference.reason)}</p><small>Omówienie przygotowane z pomocą AI. Nie jest oficjalnym kluczem ani jedyną dopuszczalną oceną. Liczy się uzasadnienie.</small>` : `<button class="btn small" type="button" data-action="reference" ${r ? '' : 'disabled'}>${icon('book')} Pokaż przykładowe omówienie</button><p>${r ? 'Masz już zapisany własny wybór. Możesz teraz porównać tok rozumowania.' : 'Najpierw zapisz własną ocenę. Omówienie pomoże Ci później przeanalizować różnice.'}</p>`}</section>
    <div class="bottom-nav"><button class="btn subtle" type="button" data-action="previous" ${index === 0 ? 'disabled' : ''}>${icon('back')} Poprzedni</button><span>Robocze zmiany zapisują się lokalnie.</span><button class="btn subtle" type="button" data-action="next" ${index === cases.length-1 ? 'disabled' : ''}>Następny ${icon('arrow')}</button></div>`;
  }
  const levels = {
    accuracy: ['Poważny błąd lub wymyślone dane zmieniają wynik.', 'Istotne nieścisłości; duża część wymaga poprawy.', 'Główna myśl częściowo poprawna, ale są zauważalne braki.', 'Poprawna treść z drobną, nieistotną niedokładnością.', 'Wszystkie twierdzenia zgadzają się z podanym kontekstem.'],
    instructions: ['Nie wykonuje głównego polecenia.', 'Pomija kluczowy wymóg lub wyraźne ograniczenie.', 'Realizuje część zadania, ale wymaga uzupełnienia.', 'Spełnia zadanie z niewielkim odstępstwem.', 'Dokładnie realizuje cel, format i ograniczenia.'],
    language: ['Treść trudna do zrozumienia; błędy zmieniają sens.', 'Liczne błędy wyraźnie utrudniają lekturę.', 'Sens czytelny, ale są błędy i niezręczne sformułowania.', 'Naturalny język z pojedynczą drobną usterką.', 'Poprawna, naturalna i jednoznaczna polszczyzna.'],
    usefulness: ['Odpowiedź nie pomaga wykonać zadania.', 'Potrzebne są znaczne poprawki lub dodatkowa praca.', 'Częściowo przydatna, lecz brakuje ważnych elementów.', 'Przydatna; drobna poprawka zwiększyłaby klarowność.', 'Kompletna, konkretna i gotowa do zastosowania.']
  };
  function rubric() {
    return `${header('Jasne kryteria. Spójne decyzje.', 'Stosuj tę samą skalę do obu odpowiedzi. Wybór A/B wynika z polecenia i Twojego uzasadnienia, nie z automatycznej sumy punktów.', 'Przewodnik oceniającej')}
    <div class="rubric-grid">${C.DIMENSIONS.map(d => `<section class="rubric-card"><div class="eyebrow">${h(d.key)}</div><h2>${d.label}</h2><p>${d.hint}</p><div class="rubric-levels">${levels[d.key].map((text,index) => `<div class="rubric-level"><b>${index+1}</b><span>${text}</span></div>`).join('')}</div></section>`).join('')}</div>
    <section class="info-section"><h2>Jak oceniać</h2><ol><li>Przeczytaj polecenie i ustal, jakie są wymagania.</li><li>Przeczytaj obie odpowiedzi. Sprawdź liczby i fakty w dostarczonym kontekście.</li><li>Oceń cztery kryteria, zaznacz istotne błędy i wybierz A, B albo remis.</li><li>Gdy brakuje podstaw do decyzji, wybierz pominięcie i napisz dlaczego. Pominięcie nie liczy się jako ocena porównawcza.</li><li>Napisz własne uzasadnienie. Przytocz konkretny fragment lub opisz wpływ błędu.</li><li>Zapisz ocenę. Dopiero potem przeczytaj przykładowe omówienie. Możesz się z nim nie zgodzić.</li></ol></section>
    <section class="rubric-card"><h2>Co pokazuje ten projekt?</h2><p>Twoją umiejętność pracy z instrukcją, porównywania treści i uzasadniania decyzji. To zestaw ćwiczeniowy, a nie test rekrutacyjny ani pomiar skuteczności prawdziwych modeli. Kod, przykłady i omówienia przygotowano z pomocą AI. Własną pracę dokumentujesz przez zapisane oceny i komentarze.</p><div class="footer-actions"><button class="btn primary" type="button" data-view="workspace">Przejdź do oceny ${icon('arrow')}</button></div></section>`;
  }
  function report() {
    const s = C.summarize(state.reviews,cases);
    const pending = cases.filter(c => dirty(c.id)).length;
    return `${header('Twoje decyzje, zebrane w jednym miejscu.', 'Eksportuj własne oceny i uzasadnienia. JSON służy do przenoszenia zapisanych wyników, CSV do analizy, a Markdown do portfolio.', 'Raport z pracy')}${statsBar()}
    <section class="report-toolbar"><div><label for="reviewer-name">Podpis raportu (opcjonalnie)</label><input id="reviewer-name" maxlength="80" value="${h(state.reviewerName)}" placeholder="Imię lub pseudonim" autocomplete="off"></div><div class="export-buttons"><button class="btn" type="button" data-export="json">${icon('download')} Kopia JSON</button><button class="btn" type="button" data-export="csv" ${s.saved ? '' : 'disabled'}>CSV</button><button class="btn primary" type="button" data-export="md" ${s.saved ? '' : 'disabled'}>Raport Markdown ${icon('arrow')}</button></div></section>
    <p class="report-notice">Eksport zawiera wyłącznie wyniki zatwierdzone przyciskiem „Zapisz ocenę”. ${pending ? `<strong>${pending} przykładów ma robocze zmiany nieuwzględnione w eksporcie.</strong>` : 'Wersje robocze pozostają w tej przeglądarce.'}</p>
    ${s.saved ? `<div class="report-table-wrap"><table class="report-table"><thead><tr><th>PRZYKŁAD</th><th>WYBÓR</th><th>PEWNOŚĆ</th><th>OMÓWIENIE PRZED ZAPISEM</th><th><span class="sr-only">Działanie</span></th></tr></thead><tbody>${cases.filter(c => state.reviews[c.id]).map(c => { const r = state.reviews[c.id]; return `<tr><td><span class="table-title">${h(c.title)}</span><small>${h(c.id)} · ${h(c.category)}</small></td><td><span class="badge ${r.preference === 'skip' ? 'amber' : 'green'}">${C.PREFERENCE_LABELS[r.preference]}</span></td><td>${C.CONFIDENCE_LABELS[r.confidence] || '—'}</td><td>${r.referenceSeenBeforeSave ? 'Tak' : 'Nie'}<small>${r.referenceViewedAt && !r.referenceSeenBeforeSave ? 'Wyświetlone po zapisaniu' : ''}</small></td><td><button class="table-link" type="button" data-case="${h(c.id)}">Otwórz</button></td></tr>`; }).join('')}</tbody></table></div>` : `<div class="empty">${icon('chart')}<h2>Tu pojawi się Twoja praca</h2><p>Nie ma jeszcze zapisanych ocen. Zacznij od jednego przykładu i własnego uzasadnienia.</p><button class="btn primary" type="button" data-view="workspace">Oceń pierwszy przykład ${icon('arrow')}</button></div>`}
    <div class="report-summary"><p>Remisy: <strong>${s.ties}</strong> · Niska pewność: <strong>${s.lowConfidence}</strong> · Oceny po omówieniu: <strong>${s.referenceAssisted}</strong><br>Te liczby opisują przebieg pracy. Nie są oceną kwalifikacji ani wynikiem rekrutacji.</p><div class="footer-actions"><button class="btn small" type="button" data-action="import">${icon('upload')} Wczytaj JSON</button><button class="btn small danger" type="button" data-action="reset">Wyczyść zapis</button></div></div>`;
  }
  function render(focusMain = false) {
    const label = { workspace: 'Pracownia', rubric: 'Kryteria', report: 'Raport' }[state.view];
    root.innerHTML = `<div class="shell">${sidebar()}<div class="content"><header class="topbar"><div class="crumb"><span>Portfolio /</span><b>${label}</b></div><div class="top-actions"><span class="status-local" id="storage-status">${storageOK ? 'Zapis lokalny' : 'Tylko w tej karcie'}</span><button class="btn small" type="button" data-view="report">${icon('download')} Eksportuj wyniki</button></div></header><main class="main" id="main" tabindex="-1"><div id="storage-warning" class="storage-warning" ${storageMessage ? '' : 'hidden'}>${h(storageMessage)}</div>${state.view === 'workspace' ? workspace() : state.view === 'rubric' ? rubric() : report()}<footer class="provenance">Polish Eval Lab · Projekt portfolio Natalii Michalik. Syntetyczne przykłady i kod przygotowane z pomocą AI; oceny wprowadza użytkowniczka. Niezależny projekt, niezwiązany z Alignerr ani Labelbox. Dane pozostają w przeglądarce, dopóki ich nie wyeksportujesz.</footer></main></div></div>`;
    bind();
    if (focusMain) document.getElementById('main').focus({ preventScroll: true });
  }
  function navigate(id) {
    persist(); state.activeId = id; state.view = 'workspace'; persist(); render(true); window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function setView(view) { persist(); state.view = view; render(true); window.scrollTo({ top: 0, behavior: 'instant' }); }
  function saveReview(next) {
    const c = activeCase(), d = draftFor(c.id), errors = C.validateReview(d);
    if (errors.length) {
      const box = document.getElementById('form-errors'); box.hidden = false; box.innerHTML = `<ul>${errors.map(error => `<li>${h(error)}</li>`).join('')}</ul>`; box.focus(); return;
    }
    state.reviews[c.id] = C.normalizeReview(d, c.id, new Date().toISOString(), Boolean(state.reviews[c.id]?.referenceViewedAt), state.reviews[c.id]);
    state.drafts[c.id] = cleanDraft(state.reviews[c.id]);
    persist();
    if (next) {
      const currentIndex = cases.indexOf(c);
      const target = cases.slice(currentIndex+1).find(x => !state.reviews[x.id]) || cases.find(x => !state.reviews[x.id]);
      if (target) navigate(target.id); else setView('report');
    } else render();
    toast(d.preference === 'skip' ? 'Zapisano pominięcie z uzasadnieniem.' : 'Ocena i uzasadnienie zostały zapisane.');
  }
  function markDraft() {
    const tag = document.getElementById('draft-status');
    if (tag) { tag.textContent = dirty(state.activeId) ? 'Wersja robocza' : state.reviews[state.activeId] ? 'Zapisano' : 'Do oceny'; tag.className = 'badge'; }
    queuePersist();
  }
  function download(format) {
    persist();
    let text, mime, name;
    const date = new Date().toISOString().slice(0,10);
    if (format === 'json') { text = JSON.stringify(C.exportObject(state.reviews,cases,state.reviewerName),null,2); mime = 'application/json;charset=utf-8'; name = `polish-eval-backup-${date}.json`; }
    if (format === 'csv') { text = C.toCSV(state.reviews,cases); mime = 'text/csv;charset=utf-8'; name = `polish-eval-results-${date}.csv`; }
    if (format === 'md') { text = C.toMarkdown(state.reviews,cases,state.reviewerName); mime = 'text/markdown;charset=utf-8'; name = `polish-eval-report-${date}.md`; }
    if (!text) return;
    const url = URL.createObjectURL(new Blob([text],{ type:mime }));
    const link = document.createElement('a'); link.href = url; link.download = name; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Przygotowano plik. Eksport obejmuje zapisane wyniki.');
  }
  function bind() {
    root.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click',() => setView(button.dataset.view)));
    root.querySelectorAll('[data-case]').forEach(button => button.addEventListener('click',() => navigate(button.dataset.case)));
    root.querySelectorAll('[data-export]').forEach(button => button.addEventListener('click',() => download(button.dataset.export)));
    document.getElementById('case-filter')?.addEventListener('change',event => { state.filter = event.target.value; render(); });
    document.getElementById('evaluation-form')?.addEventListener('submit',event => { event.preventDefault(); saveReview(false); });
    root.querySelectorAll('[data-score-side]').forEach(input => input.addEventListener('change',() => { draftFor(state.activeId).ratings[input.dataset.scoreSide][input.dataset.dimension] = Number(input.value); markDraft(); }));
    root.querySelectorAll('[data-issue-side]').forEach(input => input.addEventListener('change',() => { const list = draftFor(state.activeId).issues[input.dataset.issueSide]; if (input.checked && !list.includes(input.value)) list.push(input.value); else if (!input.checked) draftFor(state.activeId).issues[input.dataset.issueSide] = list.filter(x => x !== input.value); markDraft(); }));
    root.querySelectorAll('[name="preference"]').forEach(input => input.addEventListener('change',() => {
      const wasSkip = draftFor(state.activeId).preference === 'skip'; draftFor(state.activeId).preference = input.value; markDraft();
      if (wasSkip || input.value === 'skip') { const y = window.scrollY; render(); window.scrollTo(0,y); }
    }));
    document.getElementById('reason')?.addEventListener('input',event => { draftFor(state.activeId).reason = event.target.value; document.getElementById('reason-count').textContent = `${event.target.value.trim().length} / min. 30 znaków`; markDraft(); });
    document.getElementById('confidence')?.addEventListener('change',event => { draftFor(state.activeId).confidence = event.target.value; markDraft(); });
    document.getElementById('reviewer-name')?.addEventListener('input',event => { state.reviewerName = event.target.value.slice(0,80); queuePersist(); });
    root.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click',() => {
      const action = button.dataset.action, index = cases.indexOf(activeCase());
      if (action === 'save-next') saveReview(true);
      if (action === 'next' && index < cases.length-1) navigate(cases[index+1].id);
      if (action === 'previous' && index > 0) navigate(cases[index-1].id);
      if (action === 'reference' && state.reviews[state.activeId]) {
        const record = state.reviews[state.activeId]; record.referenceViewedAt = record.referenceViewedAt || new Date().toISOString(); persist(); const y = window.scrollY; render(); window.scrollTo(0,y);
      }
      if (action === 'import') document.getElementById('backup-input').click();
      if (action === 'reset' && confirm('Usunąć wszystkie oceny i wersje robocze z tej przeglądarki? Najpierw pobierz kopię JSON, jeśli chcesz zachować zapisane wyniki.')) {
        state = initialState(); storageMessage = ''; persist(); render(); toast('Lokalny zapis został wyczyszczony.');
      }
    }));
  }
  document.getElementById('backup-input').addEventListener('change',async event => {
    const file = event.target.files[0]; event.target.value = ''; if (!file) return;
    try {
      if (file.size > 2000000) throw new Error('Plik jest zbyt duży. Maksymalny rozmiar to 2 MB.');
      const imported = C.parseBackup(await file.text(),cases);
      if ((Object.keys(state.reviews).length || cases.some(c => hasDraft(c.id))) && !confirm('Wczytanie zastąpi obecne oceny i wersje robocze. Kontynuować?')) return;
      state.reviews = imported.reviews; state.reviewerName = imported.reviewerName; state.drafts = {}; state.view = 'report'; storageMessage = ''; persist(); render(true); toast(`Wczytano ${Object.keys(imported.reviews).length} zapisanych wyników.`);
    } catch(error) { toast(error.message || 'Nie udało się wczytać pliku. Obecne dane pozostały bez zmian.'); }
  });
  window.addEventListener('pagehide',persist);
  render();
  persist();
})();
