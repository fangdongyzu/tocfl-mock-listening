/* global TOCFL_CATALOG */
'use strict';
function parseQuery(value) {
  const match = String(value).normalize('NFKC').trim().match(/^([1-5])(?:\s+|\s*[-,，、:：/]\s*)(\d{1,2})$/u);
  if (!match || Number(match[2]) < 1 || Number(match[2]) > 50) return null;
  return { mock: Number(match[1]), question: Number(match[2]) };
}
window.parseTOCFLQuery = parseQuery;
const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2, '0');
let current = null;
let browsingMock = 1;
let transcriptVisible = true;

function browse(mock) {
  browsingMock = mock;
  $('mock-buttons').replaceChildren(...[1, 2, 3, 4, 5].map(n => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `模擬考 ${n}`;
    button.setAttribute('aria-pressed', String(n === mock));
    button.addEventListener('click', () => browse(n));
    return button;
  }));
  $('question-buttons').replaceChildren(...TOCFL_CATALOG[mock].map(row => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = pad(row.id);
    button.setAttribute('aria-label', `模擬考 ${mock} 第 ${row.id} 題`);
    button.setAttribute('aria-pressed', String(current?.mock === mock && current?.question === row.id));
    button.addEventListener('click', () => showQuestion(mock, row.id, true, true));
    return button;
  }));
}

function showQuestion(mock, question, updateHistory = true, scroll = false) {
  const row = TOCFL_CATALOG[mock]?.find(item => item.id === question);
  if (!row) return false;
  current = { mock, question };
  $('query').value = `${mock} ${pad(question)}`;
  $('query').removeAttribute('aria-invalid');
  $('search-error').hidden = true;
  $('result').hidden = false;
  $('result-title').textContent = `模擬考 ${mock} · 第 ${pad(question)} 題`;
  $('part-label').textContent = `PART ${row.part}`;
  $('art-mock').textContent = `MOCK ${pad(mock)}`;
  $('art-number').textContent = pad(question);
  $('audio').pause();
  $('audio-error').hidden = true;
  $('audio').src = row.audio;
  $('audio').load();
  $('audio').playbackRate = Number($('speed').value);
  $('audio-link').href = row.audio;
  $('transcript').textContent = row.transcript;
  $('transcript').hidden = !transcriptVisible;
  $('transcript-hidden').hidden = transcriptVisible;
  $('source-link').href = `https://github.com/fangdongyzu/tocfl-mock${mock}-listening/blob/main/data.js`;
  $('position').textContent = `${pad(question)} / 50`;
  $('previous').disabled = question === 1;
  $('next').disabled = question === 50;
  document.title = `${mock} ${pad(question)} · TOCFL 聽力查詢`;
  $('announcement').textContent = `已載入模擬考 ${mock} 第 ${question} 題的音檔與逐字稿。`;
  if (updateHistory) {
    const hash = `#${mock}-${pad(question)}`;
    if (location.hash !== hash) history.pushState(null, '', hash);
  }
  browse(mock);
  if (scroll) $('result').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  return true;
}

$('lookup-form').addEventListener('submit', event => {
  event.preventDefault();
  const parsed = parseQuery($('query').value);
  if (!parsed) {
    $('search-error').textContent = '請輸入模擬考 1–5 和題號 01–50，例如：1 05 或 3 07。';
    $('search-error').hidden = false;
    $('query').setAttribute('aria-invalid', 'true');
    $('query').focus();
    return;
  }
  showQuestion(parsed.mock, parsed.question);
});
document.querySelectorAll('[data-query]').forEach(button => button.addEventListener('click', () => {
  const parsed = parseQuery(button.dataset.query);
  showQuestion(parsed.mock, parsed.question);
}));
$('previous').addEventListener('click', () => current && showQuestion(current.mock, current.question - 1));
$('next').addEventListener('click', () => current && showQuestion(current.mock, current.question + 1));
$('speed').addEventListener('change', () => { $('audio').playbackRate = Number($('speed').value); });
$('loop').addEventListener('change', () => { $('audio').loop = $('loop').checked; });
$('replay').addEventListener('click', async () => {
  $('audio').currentTime = 0;
  try { await $('audio').play(); } catch { $('audio-error').hidden = false; }
});
$('audio').addEventListener('error', () => { $('audio-error').hidden = false; });
$('toggle-transcript').addEventListener('click', () => {
  transcriptVisible = !transcriptVisible;
  $('transcript').hidden = !transcriptVisible;
  $('transcript-hidden').hidden = transcriptVisible;
  $('toggle-transcript').textContent = transcriptVisible ? '隱藏逐字稿' : '顯示逐字稿';
  $('toggle-transcript').setAttribute('aria-expanded', String(transcriptVisible));
});
function restoreLocation() {
  const parsed = parseQuery(location.hash.slice(1));
  if (parsed) { showQuestion(parsed.mock, parsed.question, false); return; }
  $('audio').pause();
  $('audio').removeAttribute('src');
  $('audio').load();
  $('result').hidden = true;
  $('query').value = '';
  current = null;
  document.title = 'TOCFL 聽力查詢 · Listening Library';
  browse(browsingMock);
}
window.addEventListener('popstate', restoreLocation);
window.addEventListener('hashchange', restoreLocation);
restoreLocation();
