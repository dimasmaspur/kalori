'use strict';

/* ============ storage ============ */
const store = {
  get(k, d) {
    try { const v = localStorage.getItem('kal_' + k); return v ? JSON.parse(v) : d; } catch { return d; }
  },
  set(k, v) {
    try { localStorage.setItem('kal_' + k, JSON.stringify(v)); }
    catch (e) { toast('Penyimpanan penuh. Export & hapus data lama.'); }
  },
};

/* ============ icons (hand-tuned 24px line set) ============ */
const ICONS = {
  plate: '<circle cx="13.5" cy="12" r="7.5"/><circle cx="13.5" cy="12" r="3.8"/><path d="M3 4v4.5a1.5 1.5 0 0 0 3 0V4M4.5 9v11"/>',
  chart: '<path d="M3 20.5h18"/><path d="M5.5 20.5v-6h3.5v6M10.5 20.5V8H14v12.5M15.5 20.5V12H19v8.5"/>',
  sliders: '<path d="M4 7h9M19 7h1M4 17h3M13 17h7"/><circle cx="16" cy="7" r="2.6"/><circle cx="10" cy="17" r="2.6"/>',
  plus: '<path d="M12 4.5v15M4.5 12h15"/>',
  camera: '<path d="M3.5 8.5A1.5 1.5 0 0 1 5 7h2.2l1.6-2.5h6.4L16.8 7H19a1.5 1.5 0 0 1 1.5 1.5V18A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18z"/><circle cx="12" cy="13" r="3.6"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 15.5 15.5 11 6 19.5"/>',
  pencil: '<path d="M4.5 19.5 5.5 15 15.8 4.7a1.8 1.8 0 0 1 2.5 0l1 1a1.8 1.8 0 0 1 0 2.5L9 18.5z"/><path d="M14 6.5l3.5 3.5"/>',
  sparkle: '<path d="M11 3.5 12.7 8.3 17.5 10l-4.8 1.7L11 16.5l-1.7-4.8L4.5 10l4.8-1.7z"/><path d="M18.5 15v5M16 17.5h5"/>',
  scale: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M7.8 10.5a4.2 4.2 0 0 1 8.4 0z"/><path d="M12 10.5l1.6-2.2"/>',
  chevL: '<path d="M14.5 5.5 8 12l6.5 6.5"/>',
  chevR: '<path d="M9.5 5.5 16 12l-6.5 6.5"/>',
  x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5"/>',
  flame: '<path d="M12 3c.8 3.6 5.5 5.6 5.5 10.6a5.5 5.5 0 0 1-11 0c0-2.6 1.4-4 2.4-5.4.4 1.6 1.2 2.6 2.1 3.1C11.6 9 11.2 6 12 3z"/>',
  sunrise: '<path d="M3 18.5h18M6.8 18.5a5.2 5.2 0 0 1 10.4 0M12 4.5v3.5M4.6 10.4l1.8 1.3M19.4 10.4l-1.8 1.3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>',
  moon: '<path d="M19.5 14.6A7.8 7.8 0 0 1 9.4 4.5a7.8 7.8 0 1 0 10.1 10.1z"/>',
  cookie: '<path d="M20.4 12.6A8.5 8.5 0 1 1 11.4 3.6a3 3 0 0 0 3.4 3.6 3 3 0 0 0 3.6 3.4 2.6 2.6 0 0 0 2 2z"/><path d="M8.5 9.5h.01M8 14.5h.01M12.5 16.5h.01M12 12h.01" stroke-width="3"/>',
  trend: '<path d="M3.5 17 9.5 11l4 4L20.5 8"/><path d="M15 8h5.5v5.5"/>',
  trendDown: '<path d="M3.5 7 9.5 13l4-4 7 7"/><path d="M15 16h5.5v-5.5"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  key: '<circle cx="8" cy="15.5" r="4.2"/><path d="M11 12.5 19.5 4M16 7.5l2.8 2.8M14 9.5l1.8 1.8"/>',
  down: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
  up: '<path d="M12 15.5V4.5M7 9l5-5 5 5M5 20h14"/>',
  check: '<path d="M5 12.5 10 17.5 19.5 7"/>',
  bulb: '<path d="M9 17.5h6M10 20.5h4M12 3.5a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V17h5v-.6c0-.8.4-1.5 1-2A6 6 0 0 0 12 3.5z"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  user: '<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
};
const ic = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;

const MEALS = [
  { id: 'pagi', label: 'Sarapan', icon: 'sunrise', color: 'var(--yellow)' },
  { id: 'siang', label: 'Makan siang', icon: 'sun', color: 'var(--blue)' },
  { id: 'malam', label: 'Makan malam', icon: 'moon', color: 'var(--pink)' },
  { id: 'snack', label: 'Camilan', icon: 'cookie', color: 'var(--green)' },
];
const ACTIVITY = [
  { v: 1.2, label: 'Jarang gerak (kerja duduk)' },
  { v: 1.375, label: 'Ringan (olahraga 1–3x/minggu)' },
  { v: 1.55, label: 'Sedang (3–5x/minggu)' },
  { v: 1.725, label: 'Berat (6–7x/minggu)' },
];
const GOALS = [
  { id: 'lose', label: 'Turun BB', delta: -500 },
  { id: 'keep', label: 'Jaga BB', delta: 0 },
  { id: 'gain', label: 'Naik BB', delta: 300 },
];
const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const KCAL_PER_KG = 7700;
const MIN_FULL_DAY = 800; // days under this are treated as "lupa catat", ignored by adaptive TDEE

const state = {
  profile: store.get('profile', null),
  settings: store.get('settings', { apiKey: '', model: '' }),
  entries: store.get('entries', []),
  weights: store.get('weights', []), // [{date, kg}]
  review: store.get('review', null), // {date, data}
  date: today(),
  tab: 'today',
  draft: null,
  models: null,
  reviewing: false,
};

/* ============ utils ============ */
function today() { return new Date().toLocaleDateString('sv-SE'); }
function shiftDate(d, n) {
  const x = new Date(d + 'T12:00:00'); x.setDate(x.getDate() + n); return x.toLocaleDateString('sv-SE');
}
const dayNum = (d) => Math.round(Date.parse(d + 'T12:00:00') / 864e5);
const dow = (d) => new Date(d + 'T12:00:00').getDay();
function fmtDate(d, long = true) {
  if (d === today()) return 'Hari ini';
  if (d === shiftDate(today(), -1)) return 'Kemarin';
  return new Date(d + 'T12:00:00').toLocaleDateString('id-ID', long ? { weekday: 'long', day: 'numeric', month: 'short' } : { day: 'numeric', month: 'short' });
}
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const r0 = (n) => Math.round(Number(n) || 0);
const r1 = (n) => Math.round((Number(n) || 0) * 10) / 10;
const fmt1 = (n) => r1(n).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const fmtInt = (n) => r0(n).toLocaleString('id-ID');
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const $ = (s, el = document) => el.querySelector(s);

function toast(msg, ms = 2600) {
  const t = $('#toast'); t.textContent = msg; t.classList.remove('hidden');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.add('hidden'), ms);
}
function guessMeal() {
  const h = new Date().getHours();
  if (h < 10) return 'pagi';
  if (h < 15) return 'siang';
  if (h < 18) return 'snack';
  return 'malam';
}
function sumItems(items) {
  return items.reduce((a, i) => ({
    kcal: a.kcal + (+i.kcal || 0), protein: a.protein + (+i.protein || 0),
    carbs: a.carbs + (+i.carbs || 0), fat: a.fat + (+i.fat || 0),
  }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
}
function dayEntries(d) { return state.entries.filter((e) => e.date === d); }
function dayTotals(d) { return sumItems(dayEntries(d).flatMap((e) => e.items)); }
function save() { store.set('entries', state.entries); }
function saveWeights() {
  state.weights.sort((a, b) => a.date.localeCompare(b.date));
  store.set('weights', state.weights);
}
function streak() {
  const has = new Set(state.entries.map((e) => e.date));
  let d = has.has(today()) ? today() : shiftDate(today(), -1);
  let n = 0;
  while (has.has(d)) { n++; d = shiftDate(d, -1); }
  return n;
}

/* ============ targets ============ */
function targets(p = state.profile) {
  if (!p) return null;
  const bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age + (p.sex === 'm' ? 5 : -161);
  const tdee = bmr * p.activity;
  const goal = GOALS.find((g) => g.id === p.goal) || GOALS[1];
  const auto = Math.round((tdee + goal.delta) / 10) * 10;
  const kcal = p.customKcal ? +p.customKcal : auto;
  const protein = Math.round(p.weight * (p.goal === 'lose' ? 2 : 1.6));
  const fat = Math.round((kcal * 0.25) / 9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { bmr: Math.round(bmr), tdee: Math.round(tdee), auto, kcal, protein, carbs, fat };
}

/* ============ weight analytics ============ */
function linreg(pts) {
  const n = pts.length;
  if (n < 2) return null;
  const mx = pts.reduce((a, p) => a + p.x, 0) / n;
  const my = pts.reduce((a, p) => a + p.y, 0) / n;
  let num = 0, den = 0;
  for (const p of pts) { num += (p.x - mx) * (p.y - my); den += (p.x - mx) ** 2; }
  if (!den) return null;
  const slope = num / den;
  return { slope, at: (x) => my + slope * (x - mx) };
}
// 7-day trailing average for each weigh-in (smooths water-weight noise)
function smoothedWeights() {
  return state.weights.map((w) => {
    const win = state.weights.filter((v) => dayNum(v.date) <= dayNum(w.date) && dayNum(v.date) > dayNum(w.date) - 7);
    return { ...w, avg: win.reduce((a, v) => a + v.kg, 0) / win.length };
  });
}
function weightTrend(days = 28) {
  const from = dayNum(today()) - days;
  const pts = state.weights.filter((w) => dayNum(w.date) >= from).map((w) => ({ x: dayNum(w.date), y: w.kg }));
  if (pts.length < 3 || pts.at(-1).x - pts[0].x < 7) return null;
  const lr = linreg(pts);
  return lr ? { perWeek: lr.slope * 7, perDay: lr.slope, span: pts.at(-1).x - pts[0].x, n: pts.length } : null;
}

// Real TDEE from what you ate vs how your weight moved.
function adaptiveTdee() {
  const NEED_DAYS = 10, NEED_WEIGHTS = 3, NEED_SPAN = 10;
  const from = dayNum(today()) - 28;
  const ws = state.weights.filter((w) => dayNum(w.date) >= from);
  const span = ws.length ? dayNum(ws.at(-1).date) - dayNum(ws[0].date) : 0;
  const startD = ws[0]?.date, endD = ws.at(-1)?.date;
  const fullDays = [];
  if (startD) {
    for (let d = startD; d <= endD; d = shiftDate(d, 1)) {
      const k = dayTotals(d).kcal;
      if (k >= MIN_FULL_DAY) fullDays.push(k);
    }
  }
  const progress = {
    days: Math.min(fullDays.length, NEED_DAYS), needDays: NEED_DAYS,
    weights: Math.min(ws.length, NEED_WEIGHTS), needWeights: NEED_WEIGHTS,
    span: Math.min(span, NEED_SPAN), needSpan: NEED_SPAN,
  };
  if (fullDays.length < NEED_DAYS || ws.length < NEED_WEIGHTS || span < NEED_SPAN) return { ready: false, progress };
  const lr = linreg(ws.map((w) => ({ x: dayNum(w.date), y: w.kg })));
  const avgIntake = fullDays.reduce((a, b) => a + b, 0) / fullDays.length;
  const tdee = Math.round((avgIntake - lr.slope * KCAL_PER_KG) / 10) * 10;
  return { ready: true, tdee, avgIntake: r0(avgIntake), perWeek: lr.slope * 7, days: fullDays.length, progress };
}

/* ============ Gemini ============ */
const API = 'https://generativelanguage.googleapis.com/v1beta';

const PROMPT = `Kamu ahli gizi Indonesia. Analisis makanan/minuman pada input.
Aturan:
- Pisahkan tiap komponen (mis. nasi, rendang, sayur, sambal, kerupuk, minuman) jadi item sendiri.
- Perkirakan berat porsi dalam gram memakai patokan porsi rumah tangga Indonesia (1 centong nasi ≈ 100 g, 1 potong ayam goreng paha ≈ 90 g, 1 butir telur ≈ 55 g, 1 potong tempe goreng ≈ 25 g, 1 gelas ≈ 240 ml) dan ukuran piring/sendok di foto.
- Gunakan nilai gizi dari TKPI (Tabel Komposisi Pangan Indonesia) atau USDA bila tidak ada.
- Nilai kcal, protein, carbs, fat adalah untuk PORSI TERSEBUT (bukan per 100 g). Protein/carbs/fat dalam gram.
- Perhitungkan minyak goreng, santan, gula, dan kuah bila tampak.
- name dalam Bahasa Indonesia, singkat. portion = deskripsi porsi rumah tangga (mis. "1 centong", "2 potong sedang").
- note: 1 kalimat singkat (tingkat keyakinan atau hal yang perlu dicek user). Jika bukan makanan, items kosong dan jelaskan di note.`;

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    items: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' }, portion: { type: 'STRING' }, grams: { type: 'NUMBER' },
          kcal: { type: 'NUMBER' }, protein: { type: 'NUMBER' }, carbs: { type: 'NUMBER' }, fat: { type: 'NUMBER' },
        },
        required: ['name', 'portion', 'grams', 'kcal', 'protein', 'carbs', 'fat'],
      },
    },
    note: { type: 'STRING' },
  },
  required: ['items', 'note'],
};

const REVIEW_SCHEMA = {
  type: 'OBJECT',
  properties: {
    ringkasan: { type: 'STRING' },
    bagus: { type: 'ARRAY', items: { type: 'STRING' } },
    perbaiki: {
      type: 'ARRAY',
      items: { type: 'OBJECT', properties: { masalah: { type: 'STRING' }, saran: { type: 'STRING' } }, required: ['masalah', 'saran'] },
    },
    fokus: { type: 'STRING' },
  },
  required: ['ringkasan', 'bagus', 'perbaiki', 'fokus'],
};

async function listModels(key) {
  const res = await fetch(`${API}/models?pageSize=1000`, { headers: { 'x-goog-api-key': key } });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error?.message || `HTTP ${res.status}`);
  return (j.models || [])
    .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
    .map((m) => m.name.replace(/^models\//, ''))
    .filter((n) => /^gemini-/.test(n) && !/(image|tts|live|audio|embedding|robotics|computer|thinking-exp)/.test(n));
}

function pickDefaultModel(names) {
  const ver = (n) => parseFloat((n.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || 0);
  // stable (non-preview) flash first: preview/newest models often have tiny free-tier quotas
  const flash = names.filter((n) => /-flash$/.test(n));
  const anyFlash = names.filter((n) => /flash/.test(n) && !/lite/.test(n));
  const pool = flash.length ? flash : anyFlash.length ? anyFlash : names;
  return pool.sort((a, b) => ver(b) - ver(a) || a.length - b.length)[0] || 'gemini-2.5-flash';
}

async function ensureModel() {
  if (state.settings.model) return state.settings.model;
  const names = await listModels(state.settings.apiKey);
  state.models = names;
  state.settings.model = pickDefaultModel(names);
  store.set('settings', state.settings);
  return state.settings.model;
}

// Order of models to try when the current one hits its quota: other flash models
// (stable before preview, newest first), then flash-lite (usually the most generous free tier).
function fallbackModels(current, names) {
  const ver = (n) => parseFloat((n.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || 0);
  const pre = (n) => (/preview/.test(n) ? 1 : 0);
  const byVer = (a, b) => pre(a) - pre(b) || ver(b) - ver(a) || a.length - b.length;
  const ok = (n) => !/(exp|pro)/.test(n);
  const flash = names.filter((n) => ok(n) && /flash/.test(n) && !/lite/.test(n)).sort(byVer);
  const lite = names.filter((n) => ok(n) && /flash-lite/.test(n)).sort(byVer);
  const extra = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];
  return [...new Set([current, ...flash, ...lite, ...extra])].filter(Boolean);
}

function quotaKind(err) {
  const s = JSON.stringify(err?.details || '') + (err?.message || '');
  if (/PerDay|per_day|daily/i.test(s)) return 'day';
  if (/PerMinute|per_minute/i.test(s)) return 'minute';
  return '';
}

// "Low thinking" per model family: Gemini 3+ takes thinkingLevel, 2.5 takes a token
// budget (thinkingLevel there is a 400). 2.5 Flash-Lite doesn't think by default.
function thinkingFor(model, level) {
  if (!level) return null;
  const v = parseFloat((model.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || 0);
  if (v >= 3) return { thinkingLevel: level };
  if (v >= 2.5 && !/lite/.test(model)) return { thinkingBudget: level === 'low' ? 512 : -1 };
  return null;
}

async function callModel(model, key, payload, thinking) {
  const send = async (withThinking) => {
    const tc = withThinking ? thinkingFor(model, thinking) : null;
    const body = { ...payload, generationConfig: { ...payload.generationConfig, ...(tc ? { thinkingConfig: tc } : {}) } };
    const res = await fetch(`${API}/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
    });
    const j = await res.json().catch(() => ({}));
    return { res, j, tc };
  };
  let r = await send(true);
  // model rejected our thinking setting → retry once with its default
  if (r.tc && r.res.status === 400 && /thinking/i.test(r.j.error?.message || '')) r = await send(false);
  return r;
}

// Generic structured call with automatic model fallback on quota errors.
// thinking: 'low' to save tokens on simple tasks, null = model default.
async function gemini(parts, schema, temperature = 0.2, thinking = null) {
  const key = state.settings.apiKey;
  if (!key) throw new Error('API key Gemini belum diisi (tab Pengaturan).');
  const model = await ensureModel();
  const payload = {
    contents: [{ role: 'user', parts }],
    generationConfig: { responseMimeType: 'application/json', responseSchema: schema, temperature },
  };
  if (!state.models) { try { state.models = await listModels(key); } catch { state.models = []; } }
  let j, lastErr = null, minuteOnly = true;
  for (const m of fallbackModels(model, state.models)) {
    const r = await callModel(m, key, payload, thinking);
    j = r.j;
    if (r.res.ok) {
      if (m !== state.settings.model) {
        state.settings.model = m; store.set('settings', state.settings);
        toast(`Kuota model lama habis → pindah ke ${m}`, 3500);
      }
      lastErr = null;
      break;
    }
    lastErr = { status: r.res.status, msg: j.error?.message || `HTTP ${r.res.status}`, kind: quotaKind(j.error) };
    if (![429, 404].includes(r.res.status) && !/not (found|supported)|free tier|quota/i.test(lastErr.msg)) break;
    if (lastErr.kind !== 'minute') minuteOnly = false;
  }
  if (lastErr) {
    if (lastErr.status === 429) {
      throw new Error(minuteOnly
        ? 'Terlalu cepat — batas per menit Gemini. Tunggu ±1 menit lalu coba lagi.'
        : 'Kuota harian free tier semua model habis. Coba lagi besok, atau aktifkan billing di AI Studio.');
    }
    throw new Error(lastErr.msg);
  }
  const txt = (j.candidates?.[0]?.content?.parts || []).filter((p) => !p.thought).map((p) => p.text || '').join('');
  if (!txt) throw new Error('AI tidak memberi jawaban' + (j.promptFeedback?.blockReason ? ` (${j.promptFeedback.blockReason})` : '.'));
  try { return JSON.parse(txt); } catch { throw new Error('Jawaban AI tidak valid, coba lagi.'); }
}

async function analyze({ b64, text }) {
  const parts = [{ text: PROMPT + (text ? `\n\nKeterangan dari user: ${text}` : '') }];
  if (b64) parts.push({ inline_data: { mime_type: 'image/jpeg', data: b64 } });
  const out = await gemini(parts, SCHEMA, 0.2, 'low');
  return {
    note: out.note || '',
    items: (out.items || []).map((i) => ({
      name: i.name, portion: i.portion || '', grams: r0(i.grams),
      kcal: r0(i.kcal), protein: r1(i.protein), carbs: r1(i.carbs), fat: r1(i.fat),
    })),
  };
}

function weekSummaryText() {
  const t = targets();
  const p = state.profile;
  const lines = [];
  for (let i = 6; i >= 0; i--) {
    const d = shiftDate(today(), -i);
    const ents = dayEntries(d);
    const s = dayTotals(d);
    if (!ents.length) { lines.push(`${d} (${DAYS[dow(d)]}): tidak dicatat`); continue; }
    const meals = MEALS.map((m) => {
      const its = ents.filter((e) => e.meal === m.id).flatMap((e) => e.items);
      if (!its.length) return null;
      return `${m.label}: ${its.map((i) => `${i.name} ${r0(i.grams)}g/${r0(i.kcal)}kkal`).join(', ')}`;
    }).filter(Boolean).join(' | ');
    lines.push(`${d} (${DAYS[dow(d)]}): ${r0(s.kcal)} kkal, P${r0(s.protein)} K${r0(s.carbs)} L${r0(s.fat)} — ${meals}`);
  }
  const tr = weightTrend();
  const goal = GOALS.find((g) => g.id === p.goal)?.label;
  return `Profil: ${p.sex === 'm' ? 'pria' : 'wanita'}, ${p.age} th, ${p.height} cm, ${p.weight} kg, tujuan ${goal}.
Target harian: ${t.kcal} kkal, protein ${t.protein} g, karbo ${t.carbs} g, lemak ${t.fat} g.
Tren berat: ${tr ? `${fmt1(tr.perWeek)} kg/minggu` : 'belum cukup data'}.
Log 7 hari terakhir:
${lines.join('\n')}`;
}

async function runReview() {
  if (!state.profile) return toast('Isi profil dulu.');
  const logged = Array.from({ length: 7 }, (_, i) => shiftDate(today(), -i)).filter((d) => dayEntries(d).length).length;
  if (logged < 3) return toast('Catat minimal 3 hari dalam seminggu dulu.');
  state.reviewing = true; render();
  try {
    const prompt = `Kamu coach diet & ahli gizi Indonesia yang to the point dan suportif. Review log makan 7 hari user di bawah.
Aturan:
- Pakai data nyata dari log (sebut makanan/hari/angka spesifik), jangan saran generik.
- "bagus": 1-3 hal yang sudah baik.
- "perbaiki": 2-3 pola masalah terbesar terhadap target. Saran harus konkret, realistis untuk makanan Indonesia sehari-hari (warteg, padang, nasi uduk, dll), sebut tukar makanan + estimasi kkal yang dihemat/protein yang didapat.
- "fokus": SATU kebiasaan untuk minggu depan, kalimat pendek.
- "ringkasan": 1-2 kalimat.
- Bahasa Indonesia santai, singkat.

${weekSummaryText()}`;
    const data = await gemini([{ text: prompt }], REVIEW_SCHEMA, 0.5);
    state.review = { date: today(), data };
    store.set('review', state.review);
  } catch (e) {
    toast(e.message, 4500);
  } finally {
    state.reviewing = false; render();
  }
}

/* ============ image ============ */
function loadImage(file) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => rej(new Error('Gambar tidak bisa dibaca.'));
    img.src = URL.createObjectURL(file);
  });
}
function drawScaled(img, max, q) {
  const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement('canvas');
  c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', q);
}
async function prepImage(file) {
  const img = await loadImage(file);
  const full = drawScaled(img, 1024, 0.85);
  const thumb = drawScaled(img, 140, 0.7);
  URL.revokeObjectURL(img.src);
  return { b64: full.split(',')[1], preview: full, thumb };
}

/* ============ render: today ============ */
function ring(value, target) {
  const R = 52, C = 2 * Math.PI * R;
  const pct = target ? Math.min(1, value / target) : 0;
  const over = target && value > target;
  return `<div class="ring"><svg viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="${R + 9}" fill="var(--paper)" stroke="var(--ink)" stroke-width="2.5"/>
    <circle cx="60" cy="60" r="${R - 9}" fill="none" stroke="var(--ink)" stroke-width="2.5"/>
    <circle cx="60" cy="60" r="${R}" fill="none" stroke="${over ? 'var(--red)' : 'var(--yellow)'}" stroke-width="15.5"
      stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}"/>
    ${pct > 0 && pct < 1 ? `<line x1="${60 + (R - 9)}" y1="60" x2="${60 + R + 9}" y2="60" stroke="var(--ink)" stroke-width="2.5"
      transform="rotate(${pct * 360} 60 60)"/>` : ''}
  </svg><div class="inner">
    <div class="big">${fmtInt(target ? Math.abs(target - value) : value)}</div>
    <div class="tiny" style="font-weight:600">${target ? (over ? 'KKAL LEBIH' : 'KKAL SISA') : 'KKAL'}</div>
  </div></div>`;
}
function macroBar(label, v, t, color) {
  const pct = t ? Math.min(100, (v / t) * 100) : 0;
  return `<div class="macro"><div class="top-line"><span>${label}</span><span>${r0(v)}${t ? `<span class="muted">/${t}g</span>` : 'g'}</span></div>
    <div class="bar"><i style="width:${r0(pct)}%;background:${color}"></i></div></div>`;
}

function weekStrip() {
  const d = state.date;
  const offset = (dow(d) + 6) % 7; // Monday-first
  const mon = shiftDate(d, -offset);
  const days = Array.from({ length: 7 }, (_, i) => shiftDate(mon, i));
  const has = new Set(state.entries.map((e) => e.date));
  const t = today();
  return `<div class="card week"><div class="week-grid">
    <button class="nav" data-action="prev-week" aria-label="Minggu sebelumnya">${ic('chevL', 'sm')}</button>
    ${days.map((x) => `<button class="day ${x === d ? 'sel' : ''} ${x === t ? 'today' : ''}" data-action="pick-day" data-date="${x}" ${x > t ? 'disabled' : ''}>
      <span class="dn">${DAYS[dow(x)]}</span><span class="num">${+x.slice(8)}</span><span class="dot ${has.has(x) ? '' : 'none'}"></span>
    </button>`).join('')}
    <button class="nav" data-action="next-week" aria-label="Minggu berikutnya" ${shiftDate(mon, 7) > t ? 'disabled' : ''}>${ic('chevR', 'sm')}</button>
  </div><div class="week-label">${esc(fmtDate(d))}</div></div>`;
}

const EMPTY_ART = `<svg viewBox="0 0 220 150" aria-hidden="true">
  <rect x="18" y="22" width="58" height="42" fill="var(--yellow)" stroke="var(--ink)" stroke-width="2.5"/>
  <path d="M18 36h58M18 50h58M33 22v42M48 22v42M62 22v42" stroke="var(--ink)" stroke-width="1.5"/>
  <rect x="150" y="18" width="12" height="70" fill="var(--red)"/>
  <path d="M170 104a22 22 0 0 0 0 44z" fill="var(--red)" transform="translate(-8 -14)"/>
  <rect x="34" y="100" width="64" height="34" fill="var(--blue)"/>
  <circle cx="112" cy="78" r="44" fill="var(--paper)" stroke="var(--ink)" stroke-width="2.5"/>
  <circle cx="112" cy="78" r="28" fill="none" stroke="var(--ink)" stroke-width="2.5"/>
  <path d="M100 74c4-8 20-8 24 0" fill="none" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M60 46v18a6 6 0 0 0 12 0V46M66 70v52" fill="none" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round" transform="translate(-30 0)"/>
  <path d="M176 46c10 0 12 14 12 24h-12zM176 46v76" fill="var(--paper)" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/>
  <g fill="var(--ink)"><circle cx="196" cy="112" r="2"/><circle cx="206" cy="112" r="2"/><circle cx="196" cy="122" r="2"/><circle cx="206" cy="122" r="2"/></g>
  <path d="M10 112h14M17 105v14" stroke="var(--ink)" stroke-width="2.5"/>
</svg>`;

function renderToday() {
  const t = targets();
  const tot = dayTotals(state.date);
  const entries = dayEntries(state.date);
  let html = '';

  if (!state.settings.apiKey) {
    html += `<div class="banner"><b>Satu langkah lagi!</b><br>Isi API key Gemini supaya bisa scan foto makanan.
      <br><button class="btn yellow" data-tab-go="profile">${ic('key', 'sm')} Buka Pengaturan</button></div>`;
  }

  html += weekStrip();

  html += `<div class="card"><div class="summary">${ring(tot.kcal, t?.kcal)}
    <div class="macros">
      <div class="small"><b style="font-size:17px">${fmtInt(tot.kcal)}</b> / ${t ? fmtInt(t.kcal) : '–'} kkal</div>
      ${macroBar('Protein', tot.protein, t?.protein, 'var(--blue)')}
      ${macroBar('Karbo', tot.carbs, t?.carbs, 'var(--yellow)')}
      ${macroBar('Lemak', tot.fat, t?.fat, 'var(--pink)')}
    </div></div></div>`;

  if (!entries.length) {
    html += `<div class="empty">${EMPTY_ART}
      <p class="big">Piringnya masih <span class="hl">kosong</span>!</p>
      <p class="muted small">Tekan tombol + untuk foto atau ketik makananmu.</p></div>`;
  }
  for (const m of MEALS) {
    const list = entries.filter((e) => e.meal === m.id);
    if (!list.length) continue;
    const k = sumItems(list.flatMap((e) => e.items)).kcal;
    html += `<div class="meal-head"><span class="ico-box" style="background:${m.color}">${ic(m.icon)}</span>
      <h3>${m.label}</h3><span class="k tag plain">${fmtInt(k)} kkal</span></div>`;
    for (const e of list) {
      const s = sumItems(e.items);
      html += `<button class="entry" data-action="edit-entry" data-id="${e.id}">
        ${e.thumb ? `<img src="${e.thumb}" alt="">` : `<div class="ph">${ic('plate')}</div>`}
        <div class="grow"><div class="name">${esc(e.items.map((i) => i.name).join(', ') || 'Makanan')}</div>
          <div class="small muted">${esc(e.time || '')} · P ${r0(s.protein)} · K ${r0(s.carbs)} · L ${r0(s.fat)}</div></div>
        <div class="kcal">${fmtInt(s.kcal)}</div>
      </button>`;
    }
  }
  return html;
}

/* ============ render: progress ============ */
function weightChart() {
  const sw = smoothedWeights().filter((w) => dayNum(w.date) > dayNum(today()) - 60);
  if (sw.length < 2) return '';
  const W = 340, H = 160, padL = 34, padB = 22, padT = 10;
  const x0 = dayNum(sw[0].date), x1 = Math.max(dayNum(sw.at(-1).date), x0 + 1);
  const ys = sw.flatMap((w) => [w.kg, w.avg]);
  const lo = Math.floor(Math.min(...ys) - 0.5), hi = Math.ceil(Math.max(...ys) + 0.5);
  const X = (d) => padL + ((dayNum(d) - x0) / (x1 - x0)) * (W - padL - 8);
  const Y = (v) => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB);
  const grid = [lo, (lo + hi) / 2, hi].map((v) => `<line x1="${padL}" x2="${W}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--ink)" stroke-opacity=".15" stroke-dasharray="3 4"/>
    <text x="${padL - 6}" y="${Y(v) + 4}" font-size="10" text-anchor="end" fill="var(--muted)">${fmt1(v)}</text>`).join('');
  const line = sw.map((w, i) => `${i ? 'L' : 'M'}${X(w.date).toFixed(1)} ${Y(w.avg).toFixed(1)}`).join(' ');
  const dots = sw.map((w) => `<circle cx="${X(w.date)}" cy="${Y(w.kg)}" r="4" fill="var(--paper)" stroke="var(--ink)" stroke-width="2"/>`).join('');
  const lab = [sw[0], sw.at(-1)].map((w, i) => `<text x="${X(w.date)}" y="${H - 4}" font-size="10" text-anchor="${i ? 'end' : 'start'}" fill="var(--muted)">${fmtDate(w.date, false)}</text>`).join('');
  return `<div class="chart" style="margin:14px 0 4px"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik berat badan">
    ${grid}<path d="${line}" fill="none" stroke="var(--red)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>${dots}${lab}
  </svg><div class="tiny muted center">Titik = timbangan harian · Garis merah = rata-rata 7 hari</div></div>`;
}

function renderWeightCard() {
  const last = state.weights.at(-1);
  const sw = smoothedWeights();
  const tr = weightTrend();
  const goal = state.profile?.goal;
  const good = tr && ((goal === 'lose' && tr.perWeek < 0) || (goal === 'gain' && tr.perWeek > 0) || (goal === 'keep' && Math.abs(tr.perWeek) < 0.2));
  let html = `<div class="card"><h2>${ic('scale')} Berat badan
    <button class="btn sm yellow tag" data-action="log-weight">${ic('plus', 'sm')} Timbang</button></h2>`;
  if (!last) {
    return html + `<p class="small muted" style="margin:0">Timbang 2–3x seminggu, pagi setelah bangun & ke toilet. Angka harian naik-turun karena air — yang penting <b>trennya</b>.</p></div>`;
  }
  html += `<div class="tiles">
    <div class="tile yellow"><b>${fmt1(last.kg)}</b><span>kg terakhir</span></div>
    <div class="tile"><b>${fmt1(sw.at(-1).avg)}</b><span>rata² 7 hari</span></div>
    <div class="tile ${tr ? (good ? 'blue' : '') : ''}"><b>${tr ? (tr.perWeek > 0 ? '+' : '') + fmt1(tr.perWeek) : '–'}</b><span>kg/minggu</span></div>
  </div>`;
  html += weightChart();
  if (!tr) html += `<p class="small muted" style="margin:10px 0 0">Tren muncul setelah ≥3 timbangan dalam rentang ≥7 hari.</p>`;
  else if (goal === 'lose' && tr.perWeek < -1) html += `<div class="note pink" style="margin:12px 0 0">${ic('bulb', 'sm')}<span>Turun lebih dari 1 kg/minggu — cukup cepat. Pastikan protein cukup supaya yang turun lemak, bukan otot.</span></div>`;
  const recent = state.weights.slice(-4).reverse();
  html += `<div style="margin-top:12px">${recent.map((w) => `<div class="w-row">
      <span class="grow small">${esc(fmtDate(w.date))}</span><b>${fmt1(w.kg)} kg</b>
      <button class="x" data-action="del-weight" data-date="${w.date}" aria-label="Hapus">${ic('x')}</button></div>`).join('')}</div>`;
  return html + `</div>`;
}

function renderTdeeCard() {
  const t = targets();
  if (!t) return '';
  const a = adaptiveTdee();
  let html = `<div class="card"><h2>${ic('target')} TDEE nyata <span class="tag ${a.ready ? 'green' : 'plain'}">${a.ready ? 'siap' : 'mengumpulkan data'}</span></h2>`;
  if (!a.ready) {
    const p = a.progress;
    const step = (label, v, need, color) => `<div class="step"><span style="width:118px">${label}</span>
      <div class="bar"><i style="width:${r0((v / need) * 100)}%;background:${color}"></i></div><b class="small" style="width:44px;text-align:right">${v}/${need}</b></div>`;
    html += `<p class="small" style="margin:0 0 8px">Rumus bilang TDEE kamu <b>${fmtInt(t.tdee)} kkal</b>, tapi itu cuma tebakan. Setelah data cukup, app menghitung TDEE asli dari <b>kalori yang kamu makan</b> vs <b>perubahan berat</b>.</p>
      <div class="progress-steps">
        ${step('Hari tercatat', p.days, p.needDays, 'var(--yellow)')}
        ${step('Timbangan', p.weights, p.needWeights, 'var(--blue)')}
        ${step('Rentang hari', p.span, p.needSpan, 'var(--pink)')}
      </div>
      <p class="tiny muted" style="margin:0">Hari dengan &lt;${MIN_FULL_DAY} kkal dianggap lupa catat & tidak dihitung.</p>`;
    return html + `</div>`;
  }
  const goal = GOALS.find((g) => g.id === state.profile.goal) || GOALS[1];
  const suggested = Math.round((a.tdee + goal.delta) / 10) * 10;
  const diff = a.tdee - t.tdee;
  html += `<div class="tiles">
      <div class="tile yellow"><b>${fmtInt(a.tdee)}</b><span>TDEE nyata</span></div>
      <div class="tile"><b>${fmtInt(t.tdee)}</b><span>rumus</span></div>
      <div class="tile blue"><b>${fmtInt(suggested)}</b><span>target baru</span></div>
    </div>
    <p class="small" style="margin:12px 0">Rata-rata kamu makan <b>${fmtInt(a.avgIntake)} kkal</b> (${a.days} hari) dan berat berubah <b>${a.perWeek > 0 ? '+' : ''}${fmt1(a.perWeek)} kg/minggu</b>.
      Artinya tubuhmu membakar sekitar <b>${fmtInt(a.tdee)} kkal/hari</b> — ${Math.abs(diff) < 100 ? 'hampir sama dengan rumus' : `${diff > 0 ? 'lebih tinggi' : 'lebih rendah'} ${fmtInt(Math.abs(diff))} kkal dari rumus`}.</p>
    ${t.kcal === suggested ? `<div class="note yellow" style="margin:0">${ic('check', 'sm')}<span>Target kamu sudah pakai angka ini.</span></div>`
      : `<button class="btn yellow block" data-action="apply-tdee" data-kcal="${suggested}">${ic('check', 'sm')} Pakai target ${fmtInt(suggested)} kkal</button>`}`;
  return html + `</div>`;
}

function renderReviewCard() {
  const rv = state.review;
  let html = `<div class="card review"><h2>${ic('sparkle')} Review mingguan</h2>`;
  if (state.reviewing) {
    return html + `<div class="spinner"></div><p class="center small muted">AI sedang membaca log 7 hari kamu…</p></div>`;
  }
  if (rv) {
    const d = rv.data;
    html += `<div class="row between" style="margin-top:-4px"><span class="tag plain">${esc(fmtDate(rv.date))}</span></div>
      <p style="margin:10px 0 0">${esc(d.ringkasan)}</p>
      ${d.bagus?.length ? `<h3>${ic('check', 'sm')} Sudah bagus</h3><ul>${d.bagus.map((b) => `<li style="background:var(--green)">${esc(b)}</li>`).join('')}</ul>` : ''}
      ${d.perbaiki?.length ? `<h3>${ic('bulb', 'sm')} Bisa diperbaiki</h3><ul>${d.perbaiki.map((p) => `<li><b>${esc(p.masalah)}</b>${esc(p.saran)}</li>`).join('')}</ul>` : ''}
      ${d.fokus ? `<div class="focus">${ic('target', 'sm')} Fokus minggu ini: ${esc(d.fokus)}</div>` : ''}`;
  } else {
    html += `<p class="small" style="margin:0 0 4px">AI membaca log 7 hari terakhirmu lalu memberi 2–3 saran konkret — mis. camilan malam, protein sarapan, gorengan. Cukup 1x seminggu (hemat kuota).</p>`;
  }
  const fresh = rv && dayNum(today()) - dayNum(rv.date) < 6;
  html += `<button class="btn ${rv ? '' : 'pink'} block" style="margin-top:14px" data-action="run-review">
    ${ic('sparkle', 'sm')} ${rv ? (fresh ? 'Review ulang' : 'Review minggu ini') : 'Buat review'}</button>`;
  return html + `</div>`;
}

function renderCalChart() {
  const t = targets();
  const days = Array.from({ length: 14 }, (_, i) => shiftDate(today(), -13 + i));
  const vals = days.map((d) => dayTotals(d).kcal);
  const logged = vals.filter((v) => v > 0);
  const avg = logged.length ? logged.reduce((a, b) => a + b, 0) / logged.length : 0;
  const onTarget = t ? vals.filter((v) => v > 0 && Math.abs(v - t.kcal) <= t.kcal * 0.1).length : 0;

  const W = 340, H = 170, pad = 24, bw = (W - pad) / days.length;
  const max = Math.max(t?.kcal || 0, ...vals, 1000) * 1.12;
  const y = (v) => H - pad - (v / max) * (H - pad - 8);
  let bars = '';
  days.forEach((d, i) => {
    const v = vals[i];
    const over = t && v > t.kcal * 1.1;
    const x = pad + i * bw + bw * 0.16;
    if (v > 0) bars += `<rect x="${x}" y="${y(v)}" width="${bw * 0.68}" height="${H - pad - y(v)}" rx="2" fill="${over ? 'var(--red)' : 'var(--yellow)'}" stroke="var(--ink)" stroke-width="2"/>`;
    if (i % 2 === 1) bars += `<text x="${x + bw * 0.34}" y="${H - 6}" font-size="10" text-anchor="middle" fill="var(--muted)">${+d.slice(8)}</text>`;
  });
  const tl = t ? `<line x1="${pad}" x2="${W}" y1="${y(t.kcal)}" y2="${y(t.kcal)}" stroke="var(--ink)" stroke-width="2" stroke-dasharray="5 4"/>
    <text x="${pad - 3}" y="${y(t.kcal) + 4}" font-size="10" text-anchor="end" fill="var(--ink)">${Math.round(t.kcal / 100) / 10}k</text>` : '';
  return `<div class="card"><h2>${ic('chart')} Kalori 14 hari</h2>
    <div class="tiles">
      <div class="tile"><b>${fmtInt(avg)}</b><span>rata² kkal</span></div>
      <div class="tile"><b>${logged.length}</b><span>hari dicatat</span></div>
      <div class="tile yellow"><b>${t ? onTarget : '–'}</b><span>pas target</span></div>
    </div>
    <div class="chart" style="margin-top:14px"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik kalori 14 hari">${tl}${bars}</svg></div>
    <div class="tiny muted center">Garis putus-putus = target · Merah = &gt;10% di atas target</div></div>`;
}

function renderHistoryList() {
  const allDays = [...new Set(state.entries.map((e) => e.date))].sort().reverse().slice(0, 45);
  let html = `<div class="card"><h2>${ic('calendar')} Riwayat harian</h2>`;
  if (!allDays.length) html += `<div class="muted small">Belum ada data.</div>`;
  for (const d of allDays) {
    const s = dayTotals(d);
    html += `<button class="day-row" data-action="goto-day" data-date="${d}">
      <span>${esc(fmtDate(d))}<br><span class="small muted">P ${r0(s.protein)} · K ${r0(s.carbs)} · L ${r0(s.fat)}</span></span>
      <span class="tag">${fmtInt(s.kcal)} kkal</span>
    </button>`;
  }
  return html + `</div>`;
}

function renderProgress() {
  if (!state.profile) return `<div class="banner">Isi profil dulu di Pengaturan.</div>`;
  return renderWeightCard() + renderTdeeCard() + renderReviewCard() + renderCalChart() + renderHistoryList();
}

/* ============ render: settings ============ */
function renderProfile() {
  const p = state.profile || { sex: 'm', age: 28, height: 168, weight: 65, activity: 1.375, goal: 'keep', customKcal: '' };
  const t = targets(p);
  const s = state.settings;
  const modelOpts = (state.models || (s.model ? [s.model] : []))
    .map((m) => `<option ${m === s.model ? 'selected' : ''}>${esc(m)}</option>`).join('');

  return `
  ${!state.profile ? `<div class="banner"><b>Halo!</b> Isi data diri untuk menghitung target kalori harianmu.</div>` : ''}
  <form class="card" id="profile-form">
    <h2>${ic('user')} Data diri</h2>
    <label class="field"><span>Jenis kelamin</span>
      <div class="seg" data-seg="sex">
        <button type="button" data-v="m" class="${p.sex === 'm' ? 'on' : ''}">Laki-laki</button>
        <button type="button" data-v="f" class="${p.sex === 'f' ? 'on' : ''}">Perempuan</button>
      </div></label>
    <div class="grid2">
      <label class="field"><span>Umur (th)</span><input type="number" name="age" inputmode="numeric" value="${p.age}" min="10" max="100"></label>
      <label class="field"><span>Tinggi (cm)</span><input type="number" name="height" inputmode="decimal" value="${p.height}" min="100" max="230"></label>
    </div>
    <label class="field"><span>Berat (kg) — ikut terupdate saat kamu timbang</span><input type="number" name="weight" inputmode="decimal" step="0.1" value="${p.weight}" min="25" max="300"></label>
    <label class="field"><span>Aktivitas</span><select name="activity">
      ${ACTIVITY.map((a) => `<option value="${a.v}" ${+p.activity === a.v ? 'selected' : ''}>${a.label}</option>`).join('')}
    </select></label>
    <label class="field"><span>Tujuan</span>
      <div class="seg" data-seg="goal">
        ${GOALS.map((g) => `<button type="button" data-v="${g.id}" class="${p.goal === g.id ? 'on' : ''}">${g.label}</button>`).join('')}
      </div></label>
    <label class="field"><span>Target kalori manual (kosongkan = otomatis)</span>
      <input type="number" name="customKcal" inputmode="numeric" value="${p.customKcal || ''}" placeholder="${t.auto}"></label>
    <div class="note yellow" id="target-preview">${targetPreview(t)}</div>
    <button class="btn yellow block" type="submit">${ic('check', 'sm')} Simpan profil</button>
  </form>

  <form class="card" id="ai-form">
    <h2>${ic('key')} AI (Gemini)</h2>
    <p class="small muted" style="margin-top:0">Ambil API key gratis di <b>aistudio.google.com</b> → Get API key. Key hanya disimpan di HP ini.</p>
    <label class="field"><span>API key</span><input type="password" name="apiKey" value="${esc(s.apiKey)}" placeholder="AIza..." autocomplete="off"></label>
    <label class="field"><span>Model</span>
      <div class="row"><select name="model" class="grow">${modelOpts || '<option value="">(otomatis)</option>'}</select>
      <button type="button" class="btn sm blue" data-action="load-models">Muat</button></div></label>
    <button class="btn yellow block" type="submit">${ic('check', 'sm')} Simpan</button>
  </form>

  <div class="card">
    <h2>${ic('down')} Data</h2>
    <p class="small muted" style="margin-top:0">${state.entries.length} catatan makan · ${state.weights.length} timbangan, tersimpan di HP ini. Export berkala supaya aman.</p>
    <div class="btn-grid">
      <button class="btn" data-action="export">${ic('down', 'sm')} Export</button>
      <button class="btn" data-action="import">${ic('up', 'sm')} Import</button>
    </div>
  </div>
  <p class="small muted center">Estimasi AI bisa meleset ±20%. Bukan saran medis.</p>`;
}
function targetPreview(t) {
  return `<span>BMR ${fmtInt(t.bmr)} · TDEE ${fmtInt(t.tdee)} kkal<br><b>Target: ${fmtInt(t.kcal)} kkal</b> · P ${t.protein} g · K ${t.carbs} g · L ${t.fat} g</span>`;
}

/* ============ sheets ============ */
function openSheet(html) {
  $('#sheet-body').innerHTML = html;
  $('#sheet').classList.remove('hidden');
  $('#sheet-body').scrollTop = 0;
  document.body.style.overflow = 'hidden';
}
function closeSheet() {
  $('#sheet').classList.add('hidden');
  document.body.style.overflow = '';
  state.draft = null;
}

function recentFoods() {
  const seen = new Map();
  for (const e of [...state.entries].reverse()) {
    for (const i of e.items) {
      const k = i.name.toLowerCase();
      if (!seen.has(k)) seen.set(k, i);
      if (seen.size >= 12) break;
    }
    if (seen.size >= 12) break;
  }
  return [...seen.values()];
}

function openAddSheet() {
  const recent = recentFoods();
  openSheet(`<h2>Tambah makanan</h2>
    <div class="btn-grid" style="margin-bottom:16px">
      <button class="btn yellow big-btn" data-action="camera">${ic('camera')} Kamera</button>
      <button class="btn blue big-btn" data-action="gallery">${ic('image')} Galeri</button>
    </div>
    <label class="field"><span>…atau ketik apa yang dimakan</span>
      <textarea id="text-input" placeholder="mis. nasi padang rendang + sayur nangka, es teh manis"></textarea></label>
    <div class="btn-grid">
      <button class="btn pink" data-action="analyze-text">${ic('sparkle', 'sm')} Hitung AI</button>
      <button class="btn" data-action="manual">${ic('pencil', 'sm')} Manual</button>
    </div>
    ${recent.length ? `<h2 style="margin-top:22px;font-size:16px">Sering dimakan</h2>
      <div class="chips">${recent.map((i, n) => `<button class="chip" data-action="quick-add" data-n="${n}">${esc(i.name)} · <b>${r0(i.kcal)}</b></button>`).join('')}</div>` : ''}
  `);
}

function openWeightSheet() {
  const last = state.weights.at(-1)?.kg || state.profile?.weight || '';
  openSheet(`<h2>Timbang badan</h2>
    <div class="note yellow">${ic('bulb', 'sm')}<span>Paling akurat: pagi, setelah ke toilet, sebelum makan/minum.</span></div>
    <div class="grid2">
      <label class="field"><span>Berat (kg)</span><input type="text" id="w-kg" inputmode="decimal" value="${last ? fmt1(last) : ''}" placeholder="mis. 72,4" autocomplete="off"></label>
      <label class="field"><span>Tanggal</span><input type="date" id="w-date" value="${today()}" max="${today()}"></label>
    </div>
    <button class="btn yellow block" data-action="save-weight">${ic('check', 'sm')} Simpan</button>`);
  setTimeout(() => { const i = $('#w-kg'); i?.focus(); i?.select(); }, 50);
}

function loadingSheet(preview, msg) {
  openSheet(`${preview ? `<img class="preview" src="${preview}" alt="">` : ''}
    <div class="spinner"></div><p class="center" style="font-weight:600">${esc(msg)}</p>`);
}

function newDraft(items, extra = {}) {
  const now = new Date();
  return {
    id: uid(), date: state.date, meal: state.date === today() ? guessMeal() : 'siang',
    time: now.toTimeString().slice(0, 5), items, thumb: null, note: '', isNew: true, ...extra,
  };
}

function itemHtml(it, idx) {
  return `<div class="item" data-idx="${idx}">
    <div class="row"><input type="text" class="grow" data-f="name" value="${esc(it.name)}" placeholder="Nama makanan">
      <button class="x" data-action="del-item" data-idx="${idx}" aria-label="Hapus item">${ic('x')}</button></div>
    ${it.portion ? `<div class="portion">${esc(it.portion)}</div>` : ''}
    <div class="nums">
      <label>gram<input type="number" inputmode="decimal" data-f="grams" value="${it.grams}"></label>
      <label>kkal<input type="number" inputmode="decimal" data-f="kcal" value="${it.kcal}"></label>
      <label>prot<input type="number" inputmode="decimal" data-f="protein" value="${it.protein}"></label>
      <label>karbo<input type="number" inputmode="decimal" data-f="carbs" value="${it.carbs}"></label>
      <label>lemak<input type="number" inputmode="decimal" data-f="fat" value="${it.fat}"></label>
    </div></div>`;
}

function totalLineHtml() {
  const s = sumItems(state.draft.items);
  return `<span>Total</span><span>${fmtInt(s.kcal)} kkal · P ${r0(s.protein)} · K ${r0(s.carbs)} · L ${r0(s.fat)}</span>`;
}

function renderReview() {
  const d = state.draft;
  openSheet(`<h2>${d.isNew ? 'Cek hasilnya' : 'Edit catatan'}</h2>
    ${d.preview || d.thumb ? `<img class="preview" src="${d.preview || d.thumb}" alt="">` : ''}
    ${d.note ? `<div class="note">${ic('bulb', 'sm')}<span>${esc(d.note)}</span></div>` : ''}
    <div class="grid2">
      <label class="field"><span>Waktu makan</span><select id="meal-select">
        ${MEALS.map((m) => `<option value="${m.id}" ${d.meal === m.id ? 'selected' : ''}>${m.label}</option>`).join('')}
      </select></label>
      <label class="field"><span>Jam</span><input type="text" id="time-input" value="${esc(d.time)}" inputmode="numeric"></label>
    </div>
    <p class="small" style="margin:0 0 10px">Ubah <b>gram</b> → kalori &amp; makro ikut menyesuaikan.</p>
    <div id="items">${d.items.map(itemHtml).join('')}</div>
    <button class="btn block" data-action="add-item" style="margin-bottom:8px">${ic('plus', 'sm')} Tambah item</button>
    <div class="total-line" id="total-line">${totalLineHtml()}</div>
    <button class="btn yellow block" data-action="save-draft">${ic('check', 'sm')} Simpan</button>
    <div class="btn-grid" style="margin-top:12px">
      <button class="btn" data-action="close-sheet">Batal</button>
      ${d.isNew ? `<button class="btn" data-action="open-add">Ulangi</button>` : `<button class="btn red" data-action="delete-entry">${ic('trash', 'sm')} Hapus</button>`}
    </div>`);
}

function updateTotalLine() {
  const el = $('#total-line');
  if (el) el.innerHTML = totalLineHtml();
}

async function runAnalysis(input, preview, thumb) {
  loadingSheet(preview, 'Menganalisis makanan…');
  try {
    const out = await analyze(input);
    if (!out.items.length) {
      openSheet(`<h2>Tidak terdeteksi</h2><div class="note">${ic('bulb', 'sm')}<span>${esc(out.note || 'Tidak ada makanan yang dikenali.')}</span></div>
        <button class="btn yellow block" data-action="open-add">Coba lagi</button>`);
      return;
    }
    state.draft = newDraft(out.items, { note: out.note, thumb, preview });
    renderReview();
  } catch (e) {
    openSheet(`<h2>Gagal</h2><div class="note pink">${ic('bulb', 'sm')}<span>${esc(e.message)}</span></div>
      <div class="btn-grid"><button class="btn" data-action="close-sheet">Tutup</button>
      <button class="btn yellow" data-action="open-add">Coba lagi</button></div>`);
  }
}

async function handlePhoto(file) {
  if (!file) return;
  try {
    const img = await prepImage(file);
    await runAnalysis({ b64: img.b64, text: '' }, img.preview, img.thumb);
  } catch (e) { toast(e.message); }
}

/* ============ main render ============ */
const TABS = [
  { id: 'today', label: 'Hari ini', icon: 'plate', title: 'Kalori' },
  { id: 'progress', label: 'Progres', icon: 'chart', title: 'Progres' },
  { id: 'profile', label: 'Atur', icon: 'sliders', title: 'Pengaturan' },
];

function render() {
  const tab = TABS.find((t) => t.id === state.tab);
  $('#title').textContent = tab.title;
  $('#tabs').innerHTML = TABS.map((t) => `<button data-tab="${t.id}" class="${t.id === state.tab ? 'active' : ''}">${ic(t.icon, 'sm')}${t.label}</button>`).join('');
  const st = streak();
  $('#top-right').innerHTML = state.tab === 'today' && st ? `<span class="pill">${ic('flame', 'sm')} ${st} hari</span>`
    : state.tab === 'progress' && state.weights.length ? `<span class="pill yellow">${ic('scale', 'sm')} ${fmt1(state.weights.at(-1).kg)} kg</span>` : '';
  $('#fab').innerHTML = ic('plus');
  $('#fab').classList.toggle('hidden', state.tab !== 'today');
  const view = $('#view');
  view.innerHTML = state.tab === 'today' ? renderToday() : state.tab === 'progress' ? renderProgress() : renderProfile();
  if (state.tab === 'profile') bindProfile();
}

function readProfileForm() {
  const f = $('#profile-form');
  const seg = (k) => f.querySelector(`[data-seg="${k}"] .on`)?.dataset.v;
  return {
    sex: seg('sex') || 'm', goal: seg('goal') || 'keep',
    age: +f.age.value || 0, height: +f.height.value || 0, weight: +f.weight.value || 0,
    activity: +f.activity.value, customKcal: f.customKcal.value ? +f.customKcal.value : '',
  };
}

function bindProfile() {
  const f = $('#profile-form');
  const refresh = () => {
    const p = readProfileForm();
    if (!p.age || !p.height || !p.weight) return;
    const t = targets(p);
    $('#target-preview').innerHTML = targetPreview(t);
    f.customKcal.placeholder = t.auto;
  };
  f.addEventListener('input', refresh);
  f.addEventListener('click', (e) => {
    const b = e.target.closest('.seg button');
    if (!b) return;
    b.parentElement.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
    refresh();
  });
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const p = readProfileForm();
    if (p.age < 10 || p.height < 100 || p.weight < 25) return toast('Cek lagi umur/tinggi/berat.');
    state.profile = p; store.set('profile', p);
    toast('Profil disimpan ✓');
    state.tab = state.settings.apiKey ? 'today' : 'profile';
    render();
  });

  const a = $('#ai-form');
  a.addEventListener('submit', (e) => {
    e.preventDefault();
    const key = a.apiKey.value.trim();
    if (key !== state.settings.apiKey) { state.models = null; state.settings.model = ''; }
    state.settings.apiKey = key;
    if (a.model.value) state.settings.model = a.model.value;
    store.set('settings', state.settings);
    toast('Pengaturan AI disimpan ✓');
    render();
  });
}

/* ============ events ============ */
document.addEventListener('click', async (e) => {
  const tabBtn = e.target.closest('[data-tab],[data-tab-go]');
  if (tabBtn) {
    state.tab = tabBtn.dataset.tab || tabBtn.dataset.tabGo;
    window.scrollTo(0, 0);
    return render();
  }
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const act = el.dataset.action;
  if (['add-item', 'del-item', 'save-draft', 'delete-entry'].includes(act) && !state.draft) return;

  switch (act) {
    case 'prev-week': state.date = shiftDate(state.date, -7); return render();
    case 'next-week': {
      const n = shiftDate(state.date, 7);
      state.date = n > today() ? today() : n; return render();
    }
    case 'pick-day': state.date = el.dataset.date; return render();
    case 'goto-day': state.date = el.dataset.date; state.tab = 'today'; window.scrollTo(0, 0); return render();
    case 'open-add': return openAddSheet();
    case 'close-sheet': return closeSheet();
    case 'camera': return $('#photo-input').click();
    case 'gallery': return $('#gallery-input').click();
    case 'analyze-text': {
      const text = $('#text-input').value.trim();
      if (!text) return toast('Tulis dulu makanannya.');
      return runAnalysis({ text }, null, null);
    }
    case 'manual':
      state.draft = newDraft([{ name: $('#text-input')?.value.trim() || '', portion: '', grams: 100, kcal: 0, protein: 0, carbs: 0, fat: 0 }]);
      return renderReview();
    case 'quick-add': {
      const it = recentFoods()[+el.dataset.n];
      state.draft = newDraft([{ ...it }]);
      return renderReview();
    }
    case 'edit-entry': {
      const ent = state.entries.find((x) => x.id === el.dataset.id);
      if (!ent) return;
      state.draft = { ...JSON.parse(JSON.stringify(ent)), isNew: false };
      return renderReview();
    }
    case 'add-item':
      state.draft.items.push({ name: '', portion: '', grams: 100, kcal: 0, protein: 0, carbs: 0, fat: 0 });
      return renderReview();
    case 'del-item':
      state.draft.items.splice(+el.dataset.idx, 1);
      return renderReview();
    case 'save-draft': {
      const d = state.draft;
      d.meal = $('#meal-select').value;
      d.time = $('#time-input').value.trim();
      d.items = d.items.filter((i) => i.name.trim() || i.kcal > 0).map((i) => ({ ...i, name: i.name.trim() || 'Makanan' }));
      if (!d.items.length) return toast('Minimal 1 item.');
      const { isNew, preview, ...entry } = d;
      if (isNew) state.entries.push(entry);
      else state.entries = state.entries.map((x) => (x.id === entry.id ? entry : x));
      save(); closeSheet(); render();
      return toast(isNew ? `Tersimpan · ${fmtInt(sumItems(entry.items).kcal)} kkal` : 'Diperbarui ✓');
    }
    case 'delete-entry':
      if (!confirm('Hapus catatan ini?')) return;
      state.entries = state.entries.filter((x) => x.id !== state.draft.id);
      save(); closeSheet(); render();
      return toast('Dihapus');
    case 'log-weight': return openWeightSheet();
    case 'save-weight': {
      const kg = parseFloat(String($('#w-kg').value).replace(',', '.'));
      const date = $('#w-date').value || today();
      if (!(kg >= 25 && kg <= 300)) return toast('Berat tidak valid.');
      state.weights = state.weights.filter((w) => w.date !== date).concat({ date, kg: r1(kg) });
      saveWeights();
      const latest = state.weights.at(-1);
      if (state.profile && latest.date === date) { state.profile.weight = latest.kg; store.set('profile', state.profile); }
      closeSheet(); render();
      return toast(`Tercatat ${fmt1(kg)} kg ✓`);
    }
    case 'del-weight':
      if (!confirm('Hapus timbangan ini?')) return;
      state.weights = state.weights.filter((w) => w.date !== el.dataset.date);
      saveWeights(); return render();
    case 'apply-tdee':
      state.profile.customKcal = +el.dataset.kcal;
      store.set('profile', state.profile); render();
      return toast(`Target baru: ${fmtInt(+el.dataset.kcal)} kkal ✓`);
    case 'run-review': return runReview();
    case 'load-models': {
      const key = $('#ai-form').apiKey.value.trim();
      if (!key) return toast('Isi API key dulu.');
      el.disabled = true; el.textContent = '…';
      try {
        state.models = await listModels(key);
        if (!state.models.includes(state.settings.model)) state.settings.model = pickDefaultModel(state.models);
        state.settings.apiKey = key;
        store.set('settings', state.settings);
        render();
        toast(`${state.models.length} model ditemukan ✓`);
      } catch (err) {
        toast('Gagal: ' + err.message, 4000);
        el.disabled = false; el.textContent = 'Muat';
      }
      return;
    }
    case 'export': {
      const data = { v: 2, profile: state.profile, entries: state.entries, weights: state.weights, review: state.review };
      const blob = new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = `kalori-backup-${today()}.json`; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      return;
    }
    case 'import': return $('#import-input').click();
  }
});

// live edits in review sheet
document.addEventListener('input', (e) => {
  const inp = e.target.closest('.item [data-f]');
  if (!inp || !state.draft) return;
  const idx = +inp.closest('.item').dataset.idx;
  const it = state.draft.items[idx];
  const f = inp.dataset.f;
  if (f === 'name') { it.name = inp.value; return; }
  const v = parseFloat(inp.value);
  if (f === 'grams') {
    const old = +it.grams;
    if (old > 0 && v > 0) {
      const k = v / old;
      it.kcal = r0(it.kcal * k); it.protein = r1(it.protein * k); it.carbs = r1(it.carbs * k); it.fat = r1(it.fat * k);
      const box = inp.closest('.item');
      for (const key of ['kcal', 'protein', 'carbs', 'fat']) box.querySelector(`[data-f="${key}"]`).value = it[key];
    }
    if (v > 0) it.grams = v;
  } else {
    it[f] = isNaN(v) ? 0 : v;
  }
  updateTotalLine();
});

$('#photo-input').addEventListener('change', (e) => { handlePhoto(e.target.files[0]); e.target.value = ''; });
$('#gallery-input').addEventListener('change', (e) => { handlePhoto(e.target.files[0]); e.target.value = ''; });
$('#import-input').addEventListener('change', async (e) => {
  const file = e.target.files[0]; e.target.value = '';
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data.entries)) throw new Error('Format file salah');
    if (!confirm(`Import ${data.entries.length} catatan${data.weights?.length ? ` + ${data.weights.length} timbangan` : ''}? Data dengan ID/tanggal sama akan ditimpa.`)) return;
    const map = new Map(state.entries.map((x) => [x.id, x]));
    data.entries.forEach((x) => map.set(x.id, x));
    state.entries = [...map.values()].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    if (Array.isArray(data.weights)) {
      const wm = new Map(state.weights.map((w) => [w.date, w]));
      data.weights.forEach((w) => wm.set(w.date, w));
      state.weights = [...wm.values()]; saveWeights();
    }
    if (data.profile && !state.profile) { state.profile = data.profile; store.set('profile', data.profile); }
    save(); render(); toast('Import berhasil ✓');
  } catch (err) { toast('Gagal import: ' + err.message); }
});

document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#sheet').classList.contains('hidden')) closeSheet(); });

/* ============ boot ============ */
if (!state.profile) state.tab = 'profile';
render();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
