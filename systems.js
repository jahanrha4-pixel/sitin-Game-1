/* =========================================================
   SITIN — Game Systems
   economySystem + diplomacySystem + newsSystem + aiSystem + turn engine
   ========================================================= */

// ---------------- Power System (section 8) ----------------
function recalcPower(state){
  const p = { defense:0, support:0, logistics:0, intelligence:0, cyber:0, industrial:0, infrastructure:0 };
  EQUIPMENT_DATA.forEach(item => {
    const qty = state.equipment[item.id] || 0;
    if (!qty) return;
    const cat = EQUIPMENT_CATEGORIES.find(c => c.id === item.category);
    const key = cat ? cat.power : "defense";
    p[key] += item.power * qty;
  });
  // industry buildings add a slice of infrastructure/industrial power too
  INDUSTRY_BUILDINGS.forEach(b => {
    const qty = state.buildings[b.id] || 0;
    if (!qty) return;
    p.industrial += Math.round(b.output * 0.6) * qty;
    p.infrastructure += Math.round(b.output * 0.2) * qty;
  });
  const total = Object.values(p).reduce((a,b) => a+b, 0);
  state.power = { ...p, total };
  return state.power;
}

function totalMaintenance(state){
  let m = 0;
  EQUIPMENT_DATA.forEach(item => { m += (state.equipment[item.id]||0) * item.maintenance; });
  INDUSTRY_BUILDINGS.forEach(b => { m += (state.buildings[b.id]||0) * b.maintenance; });
  return m;
}

function buildingIncome(state){
  let inc = 0;
  INDUSTRY_BUILDINGS.forEach(b => { inc += (state.buildings[b.id]||0) * b.income; });
  return inc;
}

// ---------------- Purchases ----------------
function buyEquipment(state, itemId, qty=1){
  const item = EQUIPMENT_DATA.find(e => e.id === itemId);
  if (!item) return { ok:false, reason:"not_found" };
  const cost = item.price * qty;
  if (state.economy.treasury < cost){
    return { ok:false, reason:"insufficient_funds" };
  }
  state.economy.treasury -= cost;
  state.equipment[itemId] = (state.equipment[itemId]||0) + qty;
  recalcPower(state);
  logPurchase(state, { itemId, name:item.name, qty, cost, remainingTreasury: state.economy.treasury, kind:"equipment" });
  addNews(state, "success", "🛒", `خرید جدید: ${item.name} ×${qty} — هزینه ${formatMoney(cost)}`);
  return { ok:true };
}

function buildBuilding(state, buildingId, qty=1){
  const b = INDUSTRY_BUILDINGS.find(x => x.id === buildingId);
  if (!b) return { ok:false, reason:"not_found" };
  const cost = b.cost * qty;
  if (state.economy.treasury < cost){
    return { ok:false, reason:"insufficient_funds" };
  }
  state.economy.treasury -= cost;
  state.buildings[buildingId] = (state.buildings[buildingId]||0) + qty;
  state.economy.industryOutput += b.output * qty;
  recalcPower(state);
  logPurchase(state, { itemId:buildingId, name:b.name, qty, cost, remainingTreasury: state.economy.treasury, kind:"building" });
  addNews(state, "success", "🏭", `ساخت جدید: ${b.name} ×${qty} در صنعت SITIN`);
  return { ok:true };
}

// ---------------- Diplomacy System ----------------
const DIPLOMACY_ACTIONS = {
  alliance: { label:"Alliance", icon:"🤝", delta:15, minRelation:40 },
  treaty:   { label:"Treaty",   icon:"📜", delta:8,  minRelation:-100 },
  trade:    { label:"Trade",    icon:"💱", delta:5,  minRelation:-100 },
  sanctions:{ label:"Sanctions",icon:"🚫", delta:-15,minRelation:-100 },
  peace:    { label:"Peace",    icon:"🕊️", delta:20, minRelation:-100 },
};

function applyDiplomacyAction(state, countryId, actionKey){
  const action = DIPLOMACY_ACTIONS[actionKey];
  const rec = state.diplomacy[countryId];
  const country = COUNTRIES.find(c => c.id === countryId);
  if (!action || !rec || !country) return { ok:false };

  if (actionKey === "alliance" && rec.relation < action.minRelation){
    return { ok:false, reason:"relation_too_low" };
  }

  rec.relation = clamp(rec.relation + action.delta, -100, 100);
  rec.status = getRelationBand(rec.relation).label;

  const verb = {
    alliance:"اتحاد با", treaty:"عقد پیمان با", trade:"توافق تجاری با",
    sanctions:"اعمال تحریم علیه", peace:"صلح با"
  }[actionKey];
  addNews(state, actionKey==="sanctions" ? "warning":"info", action.icon,
    `${verb} ${country.flag} ${country.name} — رابطه جدید: ${rec.relation}`);
  return { ok:true, relation: rec.relation };
}

function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

// ---------------- AI System (section 15) ----------------
function runAiTurn(state){
  const events = [];
  COUNTRIES.filter(c => !c.self).forEach(c => {
    const rec = state.diplomacy[c.id];
    if (!rec) return;
    // Personality-driven decision weighted random walk
    let drift = (Math.random() - 0.5) * 6; // baseline noise
    switch(c.personality){
      case "diplomatic": drift += 2; break;      // Britain trends warmer
      case "aggressive": drift -= 2.5; break;    // VORTEX trends cooler
      case "economic":   drift += (state.power.total > 3000 ? -1 : 1); break; // USA reacts to SITIN strength
      case "industrial":  drift += (state.economy.industryOutput > 300 ? 1.5 : 0); break; // Germany respects industry
      case "tech":        drift += (state.power.cyber > 500 ? 1.5 : -0.5); break; // AURORA respects cyber power
      default: break;
    }
    // approval/instability ripple: low SITIN approval slightly worsens relations
    if (state.approval < 35) drift -= 1;

    rec.relation = clamp(Math.round(rec.relation + drift), -100, 100);
    const newStatus = getRelationBand(rec.relation).label;
    if (newStatus !== rec.status){
      events.push({ country:c, from:rec.status, to:newStatus });
    }
    rec.status = newStatus;
  });
  return events;
}

// ---------------- News System (section 16) ----------------
const RANDOM_EVENT_POOL = [
  { icon:"📈", text: s => `اقتصاد SITIN در این نوبت رشد کرد.` , type:"success" },
  { icon:"🏭", text: s => `تولید صنعتی SITIN افزایش یافت.` , type:"success" },
  { icon:"🛢️", text: s => `ذخایر نفتی SITIN تغییر کرد.` , type:"info" },
  { icon:"👥", text: s => `جمعیت SITIN رشد کرد.` , type:"info" },
  { icon:"🌍", text: s => `یک رویداد جهانی توجه‌ها را به SITIN جلب کرد.` , type:"info" },
  { icon:"📉", text: s => `نگرانی‌های اقتصادی جزئی در بازار SITIN مشاهده شد.` , type:"warning" },
];

function generateTurnNews(state, ctx){
  addNews(state, "info", "📊",
    `نوبت ${state.meta.turn}: درآمد ${formatMoney(ctx.income)} — هزینه نگهداری ${formatMoney(ctx.maintenance)}`);

  if (ctx.income - ctx.maintenance > 0){
    addNews(state, "success", "💰", `خزانه SITIN در این نوبت رشد کرد.`);
  } else {
    addNews(state, "warning", "⚠️", `هزینه‌های نگهداری از درآمد این نوبت پیشی گرفت.`);
  }

  ctx.diploEvents.forEach(ev => {
    addNews(state, ev.to === "دشمن" ? "error" : "info", "🌍",
      `روابط SITIN و ${ev.country.flag} ${ev.country.name} از «${ev.from}» به «${ev.to}» تغییر کرد.`);
  });

  // one flavour random event per turn
  const pick = RANDOM_EVENT_POOL[Math.floor(Math.random()*RANDOM_EVENT_POOL.length)];
  addNews(state, pick.type, pick.icon, pick.text(state));
}

// ---------------- Turn Engine (section 17) ----------------
function endTurn(state){
  const eco = state.economy;

  // 1) Income: population tax base + building income + industrial power bonus
  const popTax = Math.round(state.population.total * 0.9 * (state.population.employment));
  const bIncome = buildingIncome(state);
  const powerBonus = Math.round(state.power.industrial * 40 + state.power.infrastructure * 20);
  const income = popTax + bIncome + powerBonus;

  // 2) Maintenance
  const maintenance = totalMaintenance(state);

  // 3) Oil: simple production/consumption model
  const oilProduction = Math.round(20000 + state.power.infrastructure * 5);
  const oilConsumption = Math.round(15000 + (Object.values(state.equipment).reduce((a,b)=>a+b,0)) * 120 + state.economy.industryOutput * 25);
  eco.oilRate = oilProduction - oilConsumption;
  eco.oil = Math.max(0, eco.oil + eco.oilRate);

  // 4) Apply treasury change
  const net = income - maintenance;
  eco.treasury = Math.max(0, eco.treasury + net);

  // 5) Economic growth -> industry output drift
  const growth = eco.growthRate * (1 + state.power.industrial/5000) * (state.approval/100);
  eco.industryOutput = Math.max(0, eco.industryOutput * (1 + growth));

  // 6) Population growth
  const pop = state.population;
  const popGrowth = pop.growthRate * (0.6 + state.approval/150) * (eco.oil > 0 ? 1 : 0.7);
  pop.total = Math.round(pop.total * (1 + popGrowth));
  pop.employment = clamp(pop.employment + (net > 0 ? 0.002 : -0.003), 0.4, 0.98);

  // 7) Approval shifts
  let approvalDelta = 0;
  approvalDelta += net > 0 ? 0.6 : -0.9;
  approvalDelta += (maintenance > income * 0.6) ? -0.8 : 0.2;
  approvalDelta += (eco.oil <= 0) ? -1.5 : 0;
  approvalDelta += (Math.random() - 0.5) * 1.4;
  state.approval = clamp(Math.round((state.approval + approvalDelta) * 10) / 10, 0, 100);

  // 8) Diplomacy AI
  const diploEvents = runAiTurn(state);

  // 9) Power recalculation (in case buildings changed output-linked power)
  recalcPower(state);

  // 10) News
  generateTurnNews(state, { income, maintenance, diploEvents });

  // 11) Advance turn + history
  state.meta.turn += 1;
  pushHistoryPoint(state);

  // 12) Autosave
  if (state.settings.autoSave) saveGame(state);

  return { income, maintenance, net, diploEvents };
}
