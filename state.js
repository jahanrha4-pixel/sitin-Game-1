/* =========================================================
   SITIN — State & Save System
   ========================================================= */

const SAVE_KEY = "sitin.save.v1";
const SAVE_VERSION = 1;
const HISTORY_CAP = 60;
const NEWS_CAP = 80;
const PURCHASE_LOG_CAP = 100;

let GAME = null; // active game state (in-memory, mutated during play)

function createNewGame(){
  const equipment = {};
  EQUIPMENT_DATA.forEach(e => equipment[e.id] = 0);

  const buildings = {};
  INDUSTRY_BUILDINGS.forEach(b => buildings[b.id] = 0);

  const diplomacy = {};
  COUNTRIES.forEach(c => {
    if (c.self) return;
    // slight starting variance per personality, all start near-neutral
    let base = 0;
    if (c.personality === "diplomatic") base = 10;
    if (c.personality === "aggressive") base = -10;
    diplomacy[c.id] = { relation: base, status: getRelationBand(base).label };
  });

  const state = {
    version: SAVE_VERSION,
    meta: {
      turn: 1,
      createdAt: Date.now(),
      lastSaved: null,
    },
    economy: {
      treasury: 100000000,
      allocationPlan: { free:50000000, economicDev:20000000, defense:20000000, infrastructure:10000000 },
      oil: 500000,
      oilRate: 0,
      industryOutput: 100,
      growthRate: 0.018,
    },
    population: {
      total: 5000000,
      growthRate: 0.004,
      employment: 0.72,
    },
    approval: 62,
    power: { defense:0, support:0, logistics:0, intelligence:0, cyber:0, industrial:0, infrastructure:0, total:0 },
    equipment,
    buildings,
    diplomacy,
    history: {
      treasury: [], power: [], population: [], approval: [], industry: [], oil: [],
    },
    purchaseHistory: [],
    news: [],
    settings: {
      autoSave: true,
    },
  };

  recalcPower(state);
  pushHistoryPoint(state);
  addNews(state, "info", "📰", `بازی جدید SITIN آغاز شد. بودجه اولیه: ${formatMoney(state.economy.treasury)}`);
  return state;
}

function pushHistoryPoint(state){
  const t = state.meta.turn;
  const push = (arr, val) => {
    arr.push({ turn:t, value: val });
    if (arr.length > HISTORY_CAP) arr.shift();
  };
  push(state.history.treasury, state.economy.treasury);
  push(state.history.power, state.power.total);
  push(state.history.population, state.population.total);
  push(state.history.approval, state.approval);
  push(state.history.industry, state.economy.industryOutput);
  push(state.history.oil, state.economy.oil);
}

function addNews(state, type, icon, text){
  state.news.unshift({ id: cryptoId(), type, icon, text, turn: state.meta.turn, ts: Date.now() });
  if (state.news.length > NEWS_CAP) state.news.length = NEWS_CAP;
}

function logPurchase(state, entry){
  state.purchaseHistory.unshift({ ...entry, turn: state.meta.turn, ts: Date.now() });
  if (state.purchaseHistory.length > PURCHASE_LOG_CAP) state.purchaseHistory.length = PURCHASE_LOG_CAP;
}

function cryptoId(){
  return 'id-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// ---------------- Save / Load ----------------
function saveGame(state){
  try{
    state.meta.lastSaved = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  }catch(e){
    console.error("Save failed", e);
    return false;
  }
}

function hasSavedGame(){
  return !!localStorage.getItem(SAVE_KEY);
}

function loadGame(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return migrateSave(parsed);
  }catch(e){
    console.error("Load failed", e);
    return null;
  }
}

function migrateSave(state){
  // Preserve existing save keys; backfill any newly-added fields without wiping data.
  const fresh = createNewGame();
  state.version = state.version || 1;

  if (!state.equipment) state.equipment = {};
  EQUIPMENT_DATA.forEach(e => { if (!(e.id in state.equipment)) state.equipment[e.id] = 0; });

  if (!state.buildings) state.buildings = {};
  INDUSTRY_BUILDINGS.forEach(b => { if (!(b.id in state.buildings)) state.buildings[b.id] = 0; });

  if (!state.diplomacy) state.diplomacy = fresh.diplomacy;
  COUNTRIES.forEach(c => {
    if (c.self) return;
    if (!state.diplomacy[c.id]) state.diplomacy[c.id] = fresh.diplomacy[c.id];
  });

  if (!state.history) state.history = fresh.history;
  ["treasury","power","population","approval","industry","oil"].forEach(k => {
    if (!state.history[k]) state.history[k] = [];
  });

  if (!state.purchaseHistory) state.purchaseHistory = [];
  if (!state.news) state.news = [];
  if (!state.settings) state.settings = { autoSave: true };
  if (!state.economy.allocationPlan) state.economy.allocationPlan = fresh.economy.allocationPlan;
  if (state.economy.oil === undefined) state.economy.oil = fresh.economy.oil;
  if (state.economy.oilRate === undefined) state.economy.oilRate = 0;
  if (!state.power) state.power = fresh.power;

  return state;
}

function deleteSave(){
  localStorage.removeItem(SAVE_KEY);
}

function exportSaveAsFile(state){
  const blob = new Blob([JSON.stringify(state, null, 2)], { type:"application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sitin-save-turn${state.meta.turn}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importSaveFromFile(file, cb){
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const parsed = JSON.parse(reader.result);
      cb(migrateSave(parsed), null);
    }catch(e){
      cb(null, e);
    }
  };
  reader.onerror = () => cb(null, reader.error);
  reader.readAsText(file);
}

// ---------------- Formatting helpers ----------------
function formatMoney(v){
  const sign = v < 0 ? "-" : "";
  v = Math.abs(Math.round(v));
  return sign + "$" + v.toLocaleString("en-US");
}
function formatCompact(v){
  const sign = v < 0 ? "-" : "";
  v = Math.abs(v);
  if (v >= 1e9) return sign + (v/1e9).toFixed(2) + "B";
  if (v >= 1e6) return sign + (v/1e6).toFixed(2) + "M";
  if (v >= 1e3) return sign + (v/1e3).toFixed(1) + "K";
  return sign + Math.round(v);
}
function formatNumber(v){
  return Math.round(v).toLocaleString("en-US");
}
