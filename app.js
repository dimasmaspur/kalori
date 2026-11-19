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

const MEALS = [
  { id: 'pagi', label: 'Sarapan', icon: '🌅' },
  { id: 'siang', label: 'Makan siang', icon: '☀️' },
  { id: 'malam', label: 'Makan malam', icon: '🌙' },
  { id: 'snack', label: 'Camilan', icon: '🍪' },
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

const state = {
  profile: store.get('profile', null),
  settings: store.get('settings', { apiKey: '', model: '' }),
  entries: store.get('entries', []),
  date: today(),
  tab: 'today',
  draft: null, // entry being reviewed in sheet
  models: null,
};

/* ============ utils ============ */
function today() { return new Date().toLocaleDateString('sv-SE'); }
function shiftDate(d, n) {
  const x = new Date(d + 'T12:00:00'); x.setDate(x.getDate() + n); return x.toLocaleDateString('sv-SE');
}
function fmtDate(d) {
  if (d === today()) return 'Hari ini';
  if (d === shiftDate(today(), -1)) return 'Kemarin';
  return new Date(d + 'T12:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });
}
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const r0 = (n) => Math.round(Number(n) || 0);
const r1 = (n) => Math.round((Number(n) || 0) * 10) / 10;
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

/* ============ targets ============ */
function targets(p = state.profile) {
  if (!p) return null;
  const bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age + (p.sex === 'm' ? 5 : -161);
  const tdee = bmr * p.activity;
  const goal = GOALS.find((g) => g.id === p.goal) || GOALS[1];
  const kcal = p.customKcal ? +p.customKcal : Math.round((tdee + goal.delta) / 10) * 10;
  const protein = Math.round(p.weight * (p.goal === 'lose' ? 2 : 1.6));
  const fat = Math.round((kcal * 0.25) / 9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { bmr: Math.round(bmr), tdee: Math.round(tdee), kcal, protein, carbs, fat };
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
          name: { type: 'STRING' },
          portion: { type: 'STRING' },
          grams: { type: 'NUMBER' },
          kcal: { type: 'NUMBER' },
          protein: { type: 'NUMBER' },
          carbs: { type: 'NUMBER' },
          fat: { type: 'NUMBER' },
        },
        required: ['name', 'portion', 'grams', 'kcal', 'protein', 'carbs', 'fat'],
      },
    },
    note: { type: 'STRING' },
  },
  required: ['items', 'note'],
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
  const pool = flash.length ? flash : names.filter((n) => /flash/.test(n) && !/lite/.test(n)).length
    ? names.filter((n) => /flash/.test(n) && !/lite/.test(n)) : names;
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
// (newest first), then flash-lite (usually the most generous free tier).
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

async function callModel(model, key, body) {
  const res = await fetch(`${API}/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body,
  });
  const j = await res.json().catch(() => ({}));
  return { res, j };
}

async function analyze({ b64, text }) {
  const key = state.settings.apiKey;
  if (!key) throw new Error('API key Gemini belum diisi (tab Pengaturan).');
  const model = await ensureModel();
  const parts = [{ text: PROMPT + (text ? `\n\nKeterangan dari user: ${text}` : '') }];
  if (b64) parts.push({ inline_data: { mime_type: 'image/jpeg', data: b64 } });
  const body = JSON.stringify({
    contents: [{ role: 'user', parts }],
    generationConfig: { responseMimeType: 'application/json', responseSchema: SCHEMA, temperature: 0.2 },
  });

  if (!state.models) { try { state.models = await listModels(key); } catch { state.models = []; } }
  const candidates = fallbackModels(model, state.models);
  let j, lastErr = null, minuteOnly = true;
  for (const m of candidates) {
    const r = await callModel(m, key, body);
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
    // only fall through to another model on quota / model-unavailable errors
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
  let out;
  try { out = JSON.parse(txt); } catch { throw new Error('Jawaban AI tidak valid, coba lagi.'); }
  return {
    note: out.note || '',
    items: (out.items || []).map((i) => ({
      name: i.name, portion: i.portion || '', grams: r0(i.grams),
      kcal: r0(i.kcal), protein: r1(i.protein), carbs: r1(i.carbs), fat: r1(i.fat),
    })),
  };
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
  const R = 54, C = 2 * Math.PI * R;
  const pct = target ? Math.min(1, value / target) : 0;
  const over = target && value > target;
  return `<div class="ring"><svg viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="${R}" fill="none" stroke="var(--line)" stroke-width="11"/>
    <circle cx="60" cy="60" r="${R}" fill="none" stroke="${over ? 'var(--danger)' : 'var(--accent)'}" stroke-width="11"
      stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}"/>
  </svg><div class="inner">
    <div class="big">${r0(target ? Math.abs(target - value) : value)}</div>
    <div class="small muted">${target ? (over ? 'kkal lebih' : 'kkal sisa') : 'kkal'}</div>
  </div></div>`;
}
function macroBar(label, v, t, color) {
  const pct = t ? Math.min(100, (v / t) * 100) : 0;
  return `<div class="macro"><div class="top-line"><span>${label}</span><span class="muted">${r0(v)}${t ? ' / ' + t : ''} g</span></div>
    <div class="bar"><i style="width:${pct}%;background:${color}"></i></div></div>`;
}

function renderToday() {
  const t = targets();
  const tot = dayTotals(state.date);
  const entries = dayEntries(state.date);
  let html = '';

  if (!state.settings.apiKey) {
    html += `<div class="banner">Isi <b>API key Gemini</b> dulu supaya bisa scan foto makanan.
      <br><button class="btn primary" data-tab-go="profile">Buka Pengaturan</button></div>`;
  }

  html += `<div class="datenav">
    <button data-action="prev-day" aria-label="Hari sebelumnya">‹</button>
    <div class="label">${esc(fmtDate(state.date))}<div class="small muted">${t ? `Target ${t.kcal} kkal` : ''}</div></div>
    <button data-action="next-day" aria-label="Hari berikutnya" ${state.date >= today() ? 'disabled' : ''}>›</button>
  </div>`;

  html += `<div class="card"><div class="summary">${ring(tot.kcal, t?.kcal)}
    <div class="macros">
      <div class="small muted">Masuk <b style="color:var(--text)">${r0(tot.kcal)}</b> kkal</div>
      ${macroBar('Protein', tot.protein, t?.protein, 'var(--p)')}
      ${macroBar('Karbo', tot.carbs, t?.carbs, 'var(--c)')}
      ${macroBar('Lemak', tot.fat, t?.fat, 'var(--f)')}
    </div></div></div>`;

  if (!entries.length) {
    html += `<div class="empty"><div style="font-size:40px">📸</div>Belum ada catatan.<br>Tekan <b>+</b> untuk foto makananmu.</div>`;
  }
  for (const m of MEALS) {
    const list = entries.filter((e) => e.meal === m.id);
    if (!list.length) continue;
    const k = sumItems(list.flatMap((e) => e.items)).kcal;
    html += `<div class="meal-head"><h3>${m.icon} ${m.label}</h3><span class="small muted">${r0(k)} kkal</span></div>`;
    for (const e of list) {
      const s = sumItems(e.items);
      html += `<button class="entry" data-action="edit-entry" data-id="${e.id}">
        ${e.thumb ? `<img src="${e.thumb}" alt="">` : `<div class="ph">🍽️</div>`}
        <div class="grow"><div class="name">${esc(e.items.map((i) => i.name).join(', ') || 'Makanan')}</div>
          <div class="small muted">${esc(e.time || '')} · P ${r0(s.protein)} · K ${r0(s.carbs)} · L ${r0(s.fat)}</div></div>
        <div class="kcal">${r0(s.kcal)}</div>
      </button>`;
    }
  }
  return html;
}

/* ============ render: history ============ */
function renderHistory() {
  const t = targets();
  const days = Array.from({ length: 14 }, (_, i) => shiftDate(today(), -13 + i));
  const vals = days.map((d) => dayTotals(d).kcal);
  const logged = days.filter((d, i) => vals[i] > 0);
  const avg = logged.length ? vals.filter((v) => v > 0).reduce((a, b) => a + b, 0) / logged.length : 0;
  const onTarget = t ? vals.filter((v) => v > 0 && Math.abs(v - t.kcal) <= t.kcal * 0.1).length : 0;

  const W = 340, H = 170, pad = 22, bw = (W - pad) / days.length;
  const max = Math.max(t?.kcal || 0, ...vals, 1000) * 1.1;
  const y = (v) => H - pad - (v / max) * (H - pad - 8);
  let bars = '';
  days.forEach((d, i) => {
    const v = vals[i];
    const over = t && v > t.kcal * 1.1;
    const x = pad + i * bw + bw * 0.18;
    if (v > 0) bars += `<rect x="${x}" y="${y(v)}" width="${bw * 0.64}" height="${H - pad - y(v)}" rx="3" fill="${over ? 'var(--warn)' : 'var(--accent)'}"/>`;
    if (i % 2 === 1 || i === 13) {
      bars += `<text x="${x + bw * 0.32}" y="${H - 6}" font-size="9" text-anchor="middle" fill="var(--muted)">${+d.slice(8)}</text>`;
    }
  });
  const tl = t ? `<line x1="${pad}" x2="${W}" y1="${y(t.kcal)}" y2="${y(t.kcal)}" stroke="var(--muted)" stroke-dasharray="4 4"/>
    <text x="${pad - 2}" y="${y(t.kcal) + 3}" font-size="9" text-anchor="end" fill="var(--muted)">${Math.round(t.kcal / 100) / 10}k</text>` : '';

  let html = `<div class="card"><h2>14 hari terakhir</h2>
    <div class="stat-grid">
      <div><b>${r0(avg)}</b><span class="small muted">rata-rata kkal</span></div>
      <div><b>${logged.length}</b><span class="small muted">hari tercatat</span></div>
      <div><b>${t ? onTarget : '–'}</b><span class="small muted">hari sesuai target</span></div>
    </div>
    <div class="chart" style="margin-top:12px"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik kalori 14 hari">${tl}${bars}</svg></div>
    <div class="small muted center">Garis putus-putus = target. Oranye = lebih dari 10% di atas target.</div>
  </div>`;

  const allDays = [...new Set(state.entries.map((e) => e.date))].sort().reverse().slice(0, 60);
  html += `<div class="card"><h2>Riwayat harian</h2>`;
  if (!allDays.length) html += `<div class="muted small">Belum ada data.</div>`;
  for (const d of allDays) {
    const s = dayTotals(d);
    html += `<button class="day-row" data-action="goto-day" data-date="${d}">
      <span>${esc(fmtDate(d))}<br><span class="small muted">${d}</span></span>
      <span class="center"><b>${r0(s.kcal)}</b> kkal<br><span class="small muted">P ${r0(s.protein)} · K ${r0(s.carbs)} · L ${r0(s.fat)}</span></span>
    </button>`;
  }
  html += `</div>`;
  return html;
}

/* ============ render: profile/settings ============ */
function renderProfile() {
  const p = state.profile || { sex: 'm', age: 28, height: 168, weight: 65, activity: 1.375, goal: 'keep', customKcal: '' };
  const t = targets(p);
  const s = state.settings;
  const modelOpts = (state.models || (s.model ? [s.model] : []))
    .map((m) => `<option ${m === s.model ? 'selected' : ''}>${esc(m)}</option>`).join('');

  return `
  ${!state.profile ? `<div class="banner">👋 Selamat datang! Isi data diri untuk menghitung target kalori harianmu.</div>` : ''}
  <form class="card" id="profile-form">
    <h2>Data diri</h2>
    <label class="field"><span>Jenis kelamin</span>
      <div class="seg" data-seg="sex">
        <button type="button" data-v="m" class="${p.sex === 'm' ? 'on' : ''}">Laki-laki</button>
        <button type="button" data-v="f" class="${p.sex === 'f' ? 'on' : ''}">Perempuan</button>
      </div></label>
    <div class="grid2">
      <label class="field"><span>Umur (th)</span><input type="number" name="age" inputmode="numeric" value="${p.age}" min="10" max="100"></label>
      <label class="field"><span>Tinggi (cm)</span><input type="number" name="height" inputmode="decimal" value="${p.height}" min="100" max="230"></label>
    </div>
    <label class="field"><span>Berat (kg)</span><input type="number" name="weight" inputmode="decimal" step="0.1" value="${p.weight}" min="25" max="300"></label>
    <label class="field"><span>Aktivitas</span><select name="activity">
      ${ACTIVITY.map((a) => `<option value="${a.v}" ${+p.activity === a.v ? 'selected' : ''}>${a.label}</option>`).join('')}
    </select></label>
    <label class="field"><span>Tujuan</span>
      <div class="seg" data-seg="goal">
        ${GOALS.map((g) => `<button type="button" data-v="${g.id}" class="${p.goal === g.id ? 'on' : ''}">${g.label}</button>`).join('')}
      </div></label>
    <label class="field"><span>Target kalori manual (opsional, kosongkan = otomatis)</span>
      <input type="number" name="customKcal" inputmode="numeric" value="${p.customKcal || ''}" placeholder="${t.kcal}"></label>
    <div class="note" id="target-preview">BMR ${t.bmr} · TDEE ${t.tdee} kkal<br>
      <b>Target: ${t.kcal} kkal</b> · Protein ${t.protein} g · Karbo ${t.carbs} g · Lemak ${t.fat} g</div>
    <button class="btn primary block" type="submit">Simpan profil</button>
  </form>

  <form class="card" id="ai-form">
    <h2>AI (Gemini)</h2>
    <p class="small muted" style="margin-top:0">Ambil API key gratis di <b>aistudio.google.com</b> → Get API key. Key hanya disimpan di HP ini.</p>
    <label class="field"><span>API key</span><input type="password" name="apiKey" value="${esc(s.apiKey)}" placeholder="AIza..." autocomplete="off"></label>
    <label class="field"><span>Model</span>
      <div class="row"><select name="model" class="grow">${modelOpts || '<option value="">(otomatis)</option>'}</select>
      <button type="button" class="btn" data-action="load-models">Muat</button></div></label>
    <button class="btn primary block" type="submit">Simpan</button>
  </form>

  <div class="card">
    <h2>Data</h2>
    <p class="small muted" style="margin-top:0">${state.entries.length} catatan tersimpan di HP ini. Export berkala supaya aman.</p>
    <div class="btn-grid">
      <button class="btn" data-action="export">⬇️ Export</button>
      <button class="btn" data-action="import">⬆️ Import</button>
    </div>
  </div>
  <p class="small muted center">Estimasi AI bisa meleset ±20%. Bukan saran medis.</p>`;
}

/* ============ sheets ============ */
function openSheet(html) {
  $('#sheet-body').innerHTML = html;
  $('#sheet').classList.remove('hidden');
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
    <div class="btn-grid" style="margin-bottom:10px">
      <button class="btn primary" data-action="camera">📷 Kamera</button>
      <button class="btn" data-action="gallery">🖼️ Galeri</button>
    </div>
    <label class="field"><span>…atau ketik apa yang dimakan</span>
      <textarea id="text-input" placeholder="mis. nasi padang rendang + sayur nangka, es teh manis"></textarea></label>
    <div class="btn-grid">
      <button class="btn" data-action="analyze-text">✨ Hitung pakai AI</button>
      <button class="btn" data-action="manual">✏️ Isi manual</button>
    </div>
    ${recent.length ? `<h2 style="margin-top:18px;font-size:15px">Sering dimakan</h2>
      <div class="chips">${recent.map((i, n) => `<button class="chip" data-action="quick-add" data-n="${n}">${esc(i.name)} · ${r0(i.kcal)}</button>`).join('')}</div>` : ''}
  `);
}

function loadingSheet(preview, msg) {
  openSheet(`${preview ? `<img class="preview" src="${preview}" alt="">` : ''}
    <div class="spinner"></div><p class="center muted">${esc(msg)}</p>`);
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
      <button class="x" data-action="del-item" data-idx="${idx}" aria-label="Hapus item">✕</button></div>
    ${it.portion ? `<div class="portion">${esc(it.portion)}</div>` : ''}
    <div class="nums">
      <label>gram<input type="number" inputmode="decimal" data-f="grams" value="${it.grams}"></label>
      <label>kkal<input type="number" inputmode="decimal" data-f="kcal" value="${it.kcal}"></label>
      <label>prot<input type="number" inputmode="decimal" data-f="protein" value="${it.protein}"></label>
      <label>karbo<input type="number" inputmode="decimal" data-f="carbs" value="${it.carbs}"></label>
      <label>lemak<input type="number" inputmode="decimal" data-f="fat" value="${it.fat}"></label>
    </div></div>`;
}

function renderReview() {
  const d = state.draft;
  const s = sumItems(d.items);
  openSheet(`<h2>${d.isNew ? 'Cek hasil' : 'Edit catatan'}</h2>
    ${d.preview || d.thumb ? `<img class="preview" src="${d.preview || d.thumb}" alt="">` : ''}
    ${d.note ? `<div class="note">💡 ${esc(d.note)}</div>` : ''}
    <div class="grid2">
      <label class="field"><span>Waktu makan</span><select id="meal-select">
        ${MEALS.map((m) => `<option value="${m.id}" ${d.meal === m.id ? 'selected' : ''}>${m.icon} ${m.label}</option>`).join('')}
      </select></label>
      <label class="field"><span>Jam</span><input type="text" id="time-input" value="${esc(d.time)}" inputmode="numeric"></label>
    </div>
    <p class="small muted" style="margin:0 0 8px">Ubah <b>gram</b> → kalori & makro ikut menyesuaikan.</p>
    <div id="items">${d.items.map(itemHtml).join('')}</div>
    <button class="btn block" data-action="add-item" style="margin-bottom:6px">+ Tambah item</button>
    <div class="total-line" id="total-line"><span>Total</span><span>${r0(s.kcal)} kkal · P ${r0(s.protein)} · K ${r0(s.carbs)} · L ${r0(s.fat)}</span></div>
    <button class="btn primary block" data-action="save-draft">Simpan</button>
    <div class="btn-grid" style="margin-top:8px">
      <button class="btn" data-action="close-sheet">Batal</button>
      ${d.isNew ? `<button class="btn" data-action="open-add">Ulangi</button>` : `<button class="btn danger" data-action="delete-entry">Hapus</button>`}
    </div>`);
}

function updateTotalLine() {
  const s = sumItems(state.draft.items);
  const el = $('#total-line');
  if (el) el.innerHTML = `<span>Total</span><span>${r0(s.kcal)} kkal · P ${r0(s.protein)} · K ${r0(s.carbs)} · L ${r0(s.fat)}</span>`;
}

async function runAnalysis(input, preview, thumb) {
  loadingSheet(preview, 'Menganalisis makanan…');
  try {
    const out = await analyze(input);
    if (!out.items.length) {
      openSheet(`<h2>Tidak terdeteksi</h2><div class="note">${esc(out.note || 'Tidak ada makanan yang dikenali.')}</div>
        <button class="btn block" data-action="open-add">Coba lagi</button>`);
      return;
    }
    state.draft = newDraft(out.items, { note: out.note, thumb, preview });
    renderReview();
  } catch (e) {
    openSheet(`<h2>Gagal</h2><div class="note">${esc(e.message)}</div>
      <div class="btn-grid"><button class="btn" data-action="close-sheet">Tutup</button>
      <button class="btn primary" data-action="open-add">Coba lagi</button></div>`);
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
function render() {
  const view = $('#view');
  const titles = { today: 'Kalori', history: 'Riwayat', profile: 'Pengaturan' };
  $('#title').textContent = titles[state.tab];
  document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === state.tab));
  $('#fab').classList.toggle('hidden', state.tab !== 'today');
  view.innerHTML = state.tab === 'today' ? renderToday() : state.tab === 'history' ? renderHistory() : renderProfile();
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
    $('#target-preview').innerHTML = `BMR ${t.bmr} · TDEE ${t.tdee} kkal<br><b>Target: ${t.kcal} kkal</b> · Protein ${t.protein} g · Karbo ${t.carbs} g · Lemak ${t.fat} g`;
    f.customKcal.placeholder = Math.round((t.tdee + (GOALS.find((g) => g.id === p.goal)?.delta || 0)) / 10) * 10;
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
    case 'prev-day': state.date = shiftDate(state.date, -1); return render();
    case 'next-day': if (state.date < today()) state.date = shiftDate(state.date, 1); return render();
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
      return toast(isNew ? `Tersimpan · ${r0(sumItems(entry.items).kcal)} kkal` : 'Diperbarui ✓');
    }
    case 'delete-entry':
      if (!confirm('Hapus catatan ini?')) return;
      state.entries = state.entries.filter((x) => x.id !== state.draft.id);
      save(); closeSheet(); render();
      return toast('Dihapus');
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
      const blob = new Blob([JSON.stringify({ v: 1, profile: state.profile, entries: state.entries }, null, 1)], { type: 'application/json' });
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
    if (!confirm(`Import ${data.entries.length} catatan? Data dengan ID sama akan ditimpa.`)) return;
    const map = new Map(state.entries.map((x) => [x.id, x]));
    data.entries.forEach((x) => map.set(x.id, x));
    state.entries = [...map.values()].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
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
