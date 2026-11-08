(function (root) {
  'use strict';
  const KEY = 'laboratorio-vivo-progreso-v2';
  function shuffle(items, random = Math.random) { const a = [...items]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function createRun(total) { const wrong = new Set(), correct = new Set(); return { mark(id, ok) { if (!ok) wrong.add(id); else correct.add(id); }, result() { const n = Math.min(total, [...correct].filter(id => !wrong.has(id)).length); return { total, correct: n, percent: total ? Math.round(n / total * 100) : 0 }; } }; }
  function parseProgress(raw, ids) { try { const p = JSON.parse(raw); if (!p || typeof p !== 'object' || Array.isArray(p)) return {}; const clean = {}; for (const id of ids) { const v = p[id]; if (v && Number.isInteger(v.best) && v.best >= 0 && v.best <= 100 && Number.isInteger(v.plays) && v.plays > 0 && v.plays < 100000) clean[id] = { best: v.best, plays: v.plays, last: Number.isInteger(v.last) && v.last >= 0 && v.last <= 100 ? v.last : v.best, at: typeof v.at === 'string' ? v.at.slice(0, 40) : '' }; } return clean; } catch { return {}; } }
  function recordResult(p, id, percent, at = new Date().toISOString()) { if (!Number.isFinite(percent) || percent < 0 || percent > 100) return { ...p }; const old = p[id]; return { ...p, [id]: { best: Math.max(old?.best || 0, Math.round(percent)), last: Math.round(percent), plays: Math.min(99999, (old?.plays || 0) + 1), at } }; }
  function normalize(t) { return String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase(); }
  function inOrder(a, b) { return a.length === b.length && a.every((v, i) => v === b[i]); }
  function loadProgress(storage, ids) { try { return parseProgress(storage?.getItem(KEY), ids); } catch { return {}; } }
  function saveProgress(storage, p) { try { if (!storage) return false; storage.setItem(KEY, JSON.stringify(p)); return true; } catch { return false; } }
  const api = { KEY, shuffle, createRun, parseProgress, recordResult, normalize, inOrder, loadProgress, saveProgress };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LVCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
