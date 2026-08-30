/* =========================================================
   SITIN — UI Rendering
   ========================================================= */

const uiQty = {};        // transient per-item quantity selectors (not saved)
let activeEquipCategory = "all";

// ---------------- Notifications ----------------
function notify(type, icon, text, timeout=4200){
  const stack = document.getElementById("notifyStack");
  const el = document.createElement("div");
  el.className = `notify ${type}`;
  el.innerHTML = `<span>${icon}</span><span>${text}</span>`;
  stack.appendChild(el);
  setTimeout(() => { el.style.opacity="0"; el.style.transform="translateX(-16px)"; el.style.transition="all .2s ease"; setTimeout(()=>el.remove(), 200); }, timeout);
}

// ---------------- Modal ----------------
function openModal(html){
  const root = document.getElementById("modalRoot");
  root.innerHTML = `<div class="modal-overlay" id="modalOverlay"><div class="modal-box glass">${html}</div></div>`;
  document.getElementById("modalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "modalOverlay") closeModal();
  });
}
function closeModal(){ document.getElementById("modalRoot").innerHTML = ""; }

// ---------------- Topbar ----------------
function renderTopbar(state){
  const el = document.getElementById("topbarStats");
  el.innerHTML = `
    <div class="tstat">💰 <b>${formatCompact(state.economy.treasury)}</b></div>
    <div class="tstat">🛢️ <b>${formatCompact(state.economy.oil)}</b></div>
    <div class="tstat">🏭 <b>${formatCompact(state.economy.industryOutput)}</b></div>
    <div class="tstat">👥 <b>${formatCompact(state.population.total)}</b></div>
    <div class="tstat">📈 <b>${Math.round(state.approval)}%</b></div>
    <div class="tstat">⭐ <b>${formatCompact(state.power.total)}</b></div>
    <div class="tstat">⏱️ نوبت <b>${state.meta.turn}</b></div>
  `;
}

// ---------------- Power Emblem (signature element) ----------------
function powerEmblemSVG(state){
  const cats = POWER_CATEGORIES;
  const max = Math.max(1, ...cats.map(c => state.power[c.id]));
  const cx=75, cy=75, R=62;
  const pts = cats.map((c,i) => {
    const ang = (Math.PI*2*i/cats.length) - Math.PI/2;
    const r = 14 + (state.power[c.id]/ (max||1)) * (R-14);
    return [cx + r*Math.cos(ang), cy + r*Math.sin(ang)];
  });
  const outer = cats.map((c,i) => {
    const ang = (Math.PI*2*i/cats.length) - Math.PI/2;
    return [cx + R*Math.cos(ang), cy + R*Math.sin(ang)];
  });
  const poly = pts.map(p=>p.join(",")).join(" ");
  const outerPoly = outer.map(p=>p.join(",")).join(" ");
  return `
  <svg viewBox="0 0 150 150">
    <polygon points="${outerPoly}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    <polygon points="${cx-R*0.5},${cy-R*0.87} ${cx+R*0.5},${cy-R*0.87} ${cx+R},${cy} ${cx+R*0.5},${cy+R*0.87} ${cx-R*0.5},${cy+R*0.87} ${cx-R},${cy}" fill="none" stroke="rgba(255,255,255,0.04)"/>
    <polygon points="${poly}" fill="rgba(201,162,39,0.22)" stroke="var(--gold-bright)" stroke-width="1.6"/>
  </svg>`;
}

function renderPowerPanel(state){
  const cats = POWER_CATEGORIES;
  const max = Math.max(1, ...cats.map(c => state.power[c.id]));
  return `
    <div class="power-emblem-wrap">
      <div class="power-hex">
        ${powerEmblemSVG(state)}
        <div class="power-total"><b>${formatCompact(state.power.total)}</b><small>TOTAL POWER</small></div>
      </div>
      <div class="power-breakdown">
        ${cats.map(c => `
          <div class="power-row">
            <span>${c.icon}</span>
            <div class="bar"><i style="width:${Math.min(100, (state.power[c.id]/max)*100)}%; background:${c.color}"></i></div>
            <b>${formatCompact(state.power[c.id])}</b>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

// ---------------- Dashboard ----------------
function renderDashboard(state){
  const el = document.getElementById("view-dashboard");
  const worldAvgPower = Math.round(COUNTRIES.filter(c=>!c.self).reduce((a,c)=>a+c.basePower,0)/ (COUNTRIES.length-1));
  el.innerHTML = `
    <div class="section-title">🏠 Dashboard</div>
    <div class="section-sub">وضعیت کلی کشور 🇸🇮 SITIN — نوبت ${state.meta.turn}</div>

    <div class="grid grid-4" style="margin-bottom:14px;">
      ${statCard("💰","خزانه", formatMoney(state.economy.treasury))}
      ${statCard("🛢️","نفت", formatCompact(state.economy.oil) + (state.economy.oilRate!==0 ? ` (${state.economy.oilRate>0?'+':''}${formatCompact(state.economy.oilRate)})` : ""))}
      ${statCard("🏭","صنعت", formatCompact(state.economy.industryOutput))}
      ${statCard("👥","جمعیت", formatCompact(state.population.total))}
    </div>
    <div class="grid grid-3" style="margin-bottom:14px;">
      ${statCard("📈","رضایت مردم", Math.round(state.approval)+"%")}
      ${statCard("🛡️","قدرت دفاعی", formatCompact(state.power.defense))}
      ${statCard("⭐","امتیاز کلی کشور", formatCompact(state.power.total))}
    </div>

    <div class="card card-glass glass" style="margin-bottom:14px;">
      <div class="panel-header"><h3>⭐ National Power</h3></div>
      ${renderPowerPanel(state)}
    </div>

    <div class="grid grid-2">
      <div class="card card-glass glass">
        <div class="panel-header"><h3>🌍 وضعیت جهان</h3></div>
        <div style="font-size:12.5px; color:var(--text-muted); margin-bottom:10px;">میانگین قدرت جهانی: <b style="color:var(--text)">${formatCompact(worldAvgPower*10)}</b> — قدرت SITIN: <b style="color:var(--gold-bright)">${formatCompact(state.power.total)}</b></div>
        <div class="meter"><i style="width:${clamp((state.power.total/(worldAvgPower*10))*50,2,100)}%; background:linear-gradient(90deg, var(--teal), var(--gold))"></i></div>
      </div>
      <div class="card card-glass glass">
        <div class="panel-header"><h3>📰 آخرین اخبار</h3></div>
        ${state.news.slice(0,3).map(newsRow).join("") || emptyState("📰","هنوز خبری ثبت نشده")}
      </div>
    </div>
  `;
}

function statCard(icon,label,value,delta){
  return `<div class="card stat-card">
    <div class="stat-icon">${icon}</div>
    <div class="stat-label">${label}</div>
    <div class="stat-value">${value}</div>
    ${delta?`<div class="stat-delta ${delta>=0?'delta-up':'delta-down'}">${delta>=0?'▲':'▼'} ${Math.abs(delta)}</div>`:""}
  </div>`;
}

function emptyState(icon,text){
  return `<div class="empty-state"><div class="e-icon">${icon}</div><div>${text}</div></div>`;
}

function newsRow(n){
  return `<div class="news-item">
    <div class="news-icon">${n.icon}</div>
    <div>
      <div class="news-text">${n.text}</div>
      <div class="news-meta">نوبت ${n.turn}</div>
    </div>
  </div>`;
}

// ---------------- World Map ----------------
function renderWorldMap(state){
  const el = document.getElementById("view-worldmap");
  el.innerHTML = `
    <div class="section-title">🗺️ World Map</div>
    <div class="section-sub">روی هر کشور کلیک کنید تا جزئیات و وضعیت دیپلماتیک را ببینید.</div>
    <div class="world-grid">
      ${COUNTRIES.map(c => countryCard(state,c)).join("")}
    </div>
  `;
  el.querySelectorAll(".country-card[data-country]").forEach(card => {
    card.addEventListener("click", () => openCountryModal(state, card.dataset.country));
  });
}

function countryCard(state,c){
  if (c.self){
    return `<div class="card country-card self">
      <div class="flag">${c.flag}</div>
      <div style="font-weight:700; margin-top:6px;">${c.name}</div>
      <div style="font-size:11px; color:var(--gold-bright); margin-top:2px;">کشور شما</div>
      <div style="font-size:11px; color:var(--text-muted); margin-top:6px;">قدرت: <b style="color:var(--text)">${formatCompact(state.power.total)}</b></div>
    </div>`;
  }
  const rec = state.diplomacy[c.id];
  const band = getRelationBand(rec.relation);
  const pct = (rec.relation+100)/2;
  return `<div class="card country-card" data-country="${c.id}">
    <div class="flag">${c.flag}</div>
    <div style="font-weight:700; margin-top:6px;">${c.name}</div>
    <div style="font-size:11px; color:var(--text-muted);">${c.trait||""}</div>
    <div class="relation-bar"><i style="right:0; left:${pct}%; background:${band.color};"></i><i style="left:0; right:${100-pct}%; background:rgba(255,255,255,0.06);"></i></div>
    <div class="relation-label" style="color:${band.color}">${band.label} (${rec.relation})</div>
  </div>`;
}

function openCountryModal(state, countryId){
  const c = COUNTRIES.find(x=>x.id===countryId);
  const rec = state.diplomacy[countryId];
  const band = getRelationBand(rec.relation);
  openModal(`
    <h3>${c.flag} ${c.name}</h3>
    <div style="font-size:12.5px; color:var(--text-muted); margin-bottom:14px;">شخصیت: ${c.trait||"—"}</div>
    <div class="grid grid-2" style="margin-bottom:14px;">
      ${statCard("💰","اقتصاد", formatCompact(c.baseEconomy*1000000))}
      ${statCard("⭐","قدرت کلی", formatCompact(c.basePower*10))}
    </div>
    <div style="font-size:13px; margin-bottom:6px;">وضعیت دیپلماتیک: <b style="color:${band.color}">${band.label}</b> (${rec.relation})</div>
    <div class="relation-bar" style="margin-bottom:16px;"><i style="right:0; left:${(rec.relation+100)/2}%; background:${band.color};"></i></div>
    <div class="grid grid-3">
      ${Object.entries(DIPLOMACY_ACTIONS).map(([key,a])=>`
        <button class="btn btn-outline btn-sm" data-diplo="${key}" data-country="${countryId}">${a.icon} ${a.label}</button>
      `).join("")}
    </div>
    <div class="modal-actions"><button class="btn btn-outline btn-block" id="modalClose">بستن</button></div>
  `);
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.querySelectorAll("[data-diplo]").forEach(btn => {
    btn.addEventListener("click", () => {
      const res = applyDiplomacyAction(state, btn.dataset.country, btn.dataset.diplo);
      if (res.ok){
        notify("info", DIPLOMACY_ACTIONS[btn.dataset.diplo].icon, `اقدام دیپلماتیک با ${c.name} انجام شد.`);
        saveGame(state);
        closeModal();
        renderAll(state);
      } else {
        notify("warning","⚠️","این اقدام در حال حاضر ممکن نیست (رابطه کافی نیست).");
      }
    });
  });
}

// ---------------- Economy ----------------
function renderEconomy(state){
  const el = document.getElementById("view-economy");
  const income = Math.round(state.population.total * 0.9 * state.population.employment) + buildingIncome(state) + Math.round(state.power.industrial*40 + state.power.infrastructure*20);
  const maintenance = totalMaintenance(state);
  const plan = state.economy.allocationPlan;
  el.innerHTML = `
    <div class="section-title">💰 Economy</div>
    <div class="section-sub">وضعیت مالی و اقتصاد کلان SITIN</div>

    <div class="grid grid-4" style="margin-bottom:14px;">
      ${statCard("💰","خزانه فعلی", formatMoney(state.economy.treasury))}
      ${statCard("📥","درآمد تخمینی/نوبت", formatMoney(income))}
      ${statCard("📤","هزینه نگهداری/نوبت", formatMoney(maintenance))}
      ${statCard("📈","رشد اقتصادی", (state.economy.growthRate*100).toFixed(2)+"%")}
    </div>

    <div class="card card-glass glass" style="margin-bottom:14px;">
      <div class="panel-header"><h3>🏗️ برنامه تخصیص بودجه اولیه</h3></div>
      <div class="grid grid-4">
        ${statCard("💰","خزانه آزاد", formatMoney(plan.free))}
        ${statCard("🏭","توسعه اقتصادی", formatMoney(plan.economicDev))}
        ${statCard("🛡️","دفاع و امنیت", formatMoney(plan.defense))}
        ${statCard("🏗️","زیرساخت", formatMoney(plan.infrastructure))}
      </div>
    </div>

    <div class="card card-glass glass">
      <div class="panel-header"><h3>🛢️ منابع</h3></div>
      <div class="grid grid-3">
        ${statCard("🛢️","ذخیره نفت", formatCompact(state.economy.oil))}
        ${statCard("📊","نرخ نفت/نوبت", (state.economy.oilRate>=0?"+":"")+formatCompact(state.economy.oilRate))}
        ${statCard("🏭","تولید صنعتی", formatCompact(state.economy.industryOutput))}
      </div>
    </div>
  `;
}

// ---------------- Industry ----------------
function renderIndustry(state){
  const el = document.getElementById("view-industry");
  el.innerHTML = `
    <div class="section-title">🏭 Industry</div>
    <div class="section-sub">کارخانه‌ها و صنایع ملی — هر واحد درآمد و تولید تولید می‌کند.</div>
    <div class="grid grid-3">
      ${INDUSTRY_BUILDINGS.map(b => buildingCard(state,b)).join("")}
    </div>
  `;
  wireBuildingButtons(el, state);
}

function buildingCard(state,b){
  const owned = state.buildings[b.id]||0;
  const qKey = "b_"+b.id;
  const qty = uiQty[qKey] || 1;
  return `<div class="card item-card">
    <div class="item-title">
      <span class="item-name">${b.icon} ${b.name}</span>
      <span class="item-owned">Owned: ${owned}</span>
    </div>
    <div class="item-desc">${b.description}</div>
    <div class="item-stats">
      <span>درآمد/نوبت: <b>${formatMoney(b.income)}</b></span>
      <span>نگهداری: <b>${formatMoney(b.maintenance)}</b></span>
      <span>تولید: <b>+${b.output}</b></span>
    </div>
    <div class="item-footer">
      <span class="item-price">${formatMoney(b.cost)}</span>
      <div style="display:flex; align-items:center; gap:6px;">
        <button class="btn btn-sm btn-outline" data-qtyminus="${qKey}">-</button>
        <b style="font-family:var(--font-mono); min-width:16px; text-align:center; display:inline-block;">${qty}</b>
        <button class="btn btn-sm btn-outline" data-qtyplus="${qKey}">+</button>
        <button class="btn btn-sm btn-teal" data-build="${b.id}">BUILD</button>
      </div>
    </div>
  </div>`;
}

function wireBuildingButtons(el, state){
  el.querySelectorAll("[data-qtyminus]").forEach(btn => btn.addEventListener("click", () => {
    const k = btn.dataset.qtyminus; uiQty[k] = Math.max(1,(uiQty[k]||1)-1); renderIndustry(state);
  }));
  el.querySelectorAll("[data-qtyplus]").forEach(btn => btn.addEventListener("click", () => {
    const k = btn.dataset.qtyplus; uiQty[k] = Math.min(50,(uiQty[k]||1)+1); renderIndustry(state);
  }));
  el.querySelectorAll("[data-build]").forEach(btn => btn.addEventListener("click", () => {
    const id = btn.dataset.build; const qKey="b_"+id; const qty = uiQty[qKey]||1;
    const res = buildBuilding(state, id, qty);
    if (res.ok){ notify("success","🏭","ساخت‌وساز با موفقیت انجام شد."); saveGame(state); renderAll(state); }
    else notify("error","⚠️","بودجه کافی نیست"); 
  }));
}

// ---------------- Defense overview ----------------
function renderDefense(state){
  const el = document.getElementById("view-defense");
  const defenseItems = EQUIPMENT_DATA.filter(e => ["defense","air","naval","ground"].includes(e.category));
  el.innerHTML = `
    <div class="section-title">🛡️ Defense</div>
    <div class="section-sub">نمای کلی توان دفاعی SITIN</div>
    <div class="grid grid-4" style="margin-bottom:14px;">
      ${statCard("🛡️","Defense Power", formatCompact(state.power.defense))}
      ${statCard("📡","Intelligence Power", formatCompact(state.power.intelligence))}
      ${statCard("💻","Cyber Power", formatCompact(state.power.cyber))}
      ${statCard("🚛","Logistics Power", formatCompact(state.power.logistics))}
    </div>
    <div class="card card-glass glass" style="margin-bottom:14px;">
      <div class="panel-header"><h3>⭐ National Power</h3></div>
      ${renderPowerPanel(state)}
    </div>
    <div class="panel-header"><h3 class="section-title" style="font-size:16px;">🪖 واحدهای دفاعی/هوایی/دریایی/زمینی متعلق به SITIN</h3></div>
    <div class="grid grid-3">
      ${defenseItems.map(item => {
        const owned = state.equipment[item.id]||0;
        if (!owned) return "";
        const cat = EQUIPMENT_CATEGORIES.find(c=>c.id===item.category);
        return `<div class="card item-card">
          <div class="item-title"><span class="item-name">${cat.icon} ${item.name}</span><span class="tag ${cat.tag}">${cat.name}</span></div>
          <div class="item-stats"><span>Owned: <b>${owned}</b></span><span>Power: <b>${item.power*owned}</b></span><span>نگهداری: <b>${formatMoney(item.maintenance*owned)}</b></span></div>
        </div>`;
      }).join("") || emptyState("🛡️","هنوز هیچ واحد دفاعی خریداری نشده — به فروشگاه تجهیزات بروید.")}
    </div>
  `;
}

// ---------------- Equipment Shop ----------------
function renderEquipment(state){
  const el = document.getElementById("view-equipment");
  const cats = [{id:"all",name:"همه",icon:"🛒"}, ...EQUIPMENT_CATEGORIES];
  const items = activeEquipCategory==="all" ? EQUIPMENT_DATA : EQUIPMENT_DATA.filter(e=>e.category===activeEquipCategory);
  el.innerHTML = `
    <div class="section-title">🛒 Equipment Shop</div>
    <div class="section-sub">تمام تجهیزات کاملاً خیالی و مخصوص دنیای SITIN هستند.</div>
    <div class="category-nav">
      ${cats.map(c=>`<button class="chip ${activeEquipCategory===c.id?'active':''}" data-cat="${c.id}">${c.icon} ${c.name}</button>`).join("")}
    </div>
    <div class="grid grid-3">
      ${items.map(item => equipmentCard(state,item)).join("")}
    </div>
  `;
  el.querySelectorAll("[data-cat]").forEach(btn => btn.addEventListener("click", () => {
    activeEquipCategory = btn.dataset.cat; renderEquipment(state);
  }));
  wireEquipmentButtons(el, state);
}

function equipmentCard(state,item){
  const cat = EQUIPMENT_CATEGORIES.find(c=>c.id===item.category);
  const owned = state.equipment[item.id]||0;
  const qKey = "e_"+item.id;
  const qty = uiQty[qKey]||1;
  const affordable = state.economy.treasury >= item.price*qty;
  return `<div class="card item-card">
    <div class="item-title">
      <span class="item-name">${cat.icon} ${item.name}</span>
      <span class="tag ${cat.tag}">${cat.name}</span>
    </div>
    <div class="item-desc">${item.description}</div>
    <div class="item-stats">
      <span>Power: <b>${item.power}</b></span>
      <span>Maintenance: <b>${formatMoney(item.maintenance)}</b></span>
      <span>Owned: <b>${owned}</b></span>
    </div>
    <div class="item-footer">
      <span class="item-price">${formatMoney(item.price)}</span>
      <div style="display:flex; align-items:center; gap:6px;">
        <button class="btn btn-sm btn-outline" data-qtyminus="${qKey}">-</button>
        <b style="font-family:var(--font-mono); min-width:16px; text-align:center; display:inline-block;">${qty}</b>
        <button class="btn btn-sm btn-outline" data-qtyplus="${qKey}">+</button>
      </div>
    </div>
    <button class="btn btn-block ${affordable?'btn-gold':'btn-outline'}" data-buy="${item.id}" ${affordable?'':'disabled'}>BUY ${!affordable?'(بودجه کافی نیست)':''}</button>
  </div>`;
}

function wireEquipmentButtons(el, state){
  el.querySelectorAll("[data-qtyminus]").forEach(btn => btn.addEventListener("click", () => {
    const k = btn.dataset.qtyminus; uiQty[k] = Math.max(1,(uiQty[k]||1)-1); renderEquipment(state);
  }));
  el.querySelectorAll("[data-qtyplus]").forEach(btn => btn.addEventListener("click", () => {
    const k = btn.dataset.qtyplus; uiQty[k] = Math.min(50,(uiQty[k]||1)+1); renderEquipment(state);
  }));
  el.querySelectorAll("[data-buy]").forEach(btn => btn.addEventListener("click", () => {
    const id = btn.dataset.buy; const qKey="e_"+id; const qty = uiQty[qKey]||1;
    const res = buyEquipment(state, id, qty);
    if (res.ok){ notify("success","🛒","خرید با موفقیت انجام شد."); saveGame(state); renderAll(state); }
    else notify("error","⚠️","بودجه کافی نیست");
  }));
}

// ---------------- Diplomacy page ----------------
function renderDiplomacy(state){
  const el = document.getElementById("view-diplomacy");
  el.innerHTML = `
    <div class="section-title">🤝 Diplomacy</div>
    <div class="section-sub">مدیریت روابط بین‌المللی SITIN با سایر کشورها.</div>
    <div class="world-grid">
      ${COUNTRIES.filter(c=>!c.self).map(c=>countryCard(state,c)).join("")}
    </div>
  `;
  el.querySelectorAll(".country-card[data-country]").forEach(card => {
    card.addEventListener("click", () => openCountryModal(state, card.dataset.country));
  });
}

// ---------------- News page ----------------
function renderNews(state){
  const el = document.getElementById("view-news");
  el.innerHTML = `
    <div class="section-title">📰 News</div>
    <div class="section-sub">اخبار خودکار تولید‌شده بر اساس رویدادهای کشور SITIN</div>
    <div class="card card-glass glass">
      ${state.news.length ? state.news.map(newsRow).join("") : emptyState("📰","هنوز خبری ثبت نشده")}
    </div>
  `;
}

// ---------------- Statistics page ----------------
function sparkline(canvas, points, color){
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  canvas.width = w*dpr; canvas.height = h*dpr;
  ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,w,h);
  if (points.length < 2){
    ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font="12px Inter"; ctx.fillText("داده کافی نیست", 10, h/2);
    return;
  }
  const vals = points.map(p=>p.value);
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = (max-min) || 1;
  const stepX = w/(points.length-1);
  ctx.beginPath();
  points.forEach((p,i) => {
    const x = i*stepX;
    const y = h - ((p.value-min)/range)*(h-16) - 8;
    if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
  // fill
  ctx.lineTo(w,h); ctx.lineTo(0,h); ctx.closePath();
  const grad = ctx.createLinearGradient(0,0,0,h);
  grad.addColorStop(0, color.replace(")", ",0.28)").replace("rgb","rgba"));
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = color.startsWith("#") ? hexToRgba(color,0.18) : "rgba(255,255,255,0.05)";
  ctx.fill();
}
function hexToRgba(hex,a){
  const v = hex.replace("#","");
  const r = parseInt(v.substring(0,2),16), g=parseInt(v.substring(2,4),16), b=parseInt(v.substring(4,6),16);
  return `rgba(${r},${g},${b},${a})`;
}

function renderStatistics(state){
  const el = document.getElementById("view-statistics");
  el.innerHTML = `
    <div class="section-title">📊 Statistics</div>
    <div class="section-sub">روند تاریخی شاخص‌های کلیدی کشور SITIN</div>
    <div class="grid grid-2">
      ${chartCard("💰 Treasury History","chartTreasury")}
      ${chartCard("⭐ National Power","chartPower")}
      ${chartCard("👥 Population","chartPopulation")}
      ${chartCard("📈 Approval","chartApproval")}
      ${chartCard("🏭 Industrial Growth","chartIndustry")}
      ${chartCard("🛢️ Oil Reserve","chartOil")}
    </div>
    <div class="card card-glass glass" style="margin-top:14px;">
      <div class="panel-header"><h3>🤝 Diplomatic Relations</h3></div>
      ${COUNTRIES.filter(c=>!c.self).map(c => {
        const rec = state.diplomacy[c.id]; const band = getRelationBand(rec.relation);
        return `<div class="history-row"><span class="h-name">${c.flag} ${c.name}</span><span style="color:${band.color}; font-family:var(--font-mono);">${band.label} (${rec.relation})</span></div>`;
      }).join("")}
    </div>
  `;
  requestAnimationFrame(() => {
    sparkline(document.getElementById("chartTreasury"), state.history.treasury, "#C9A227");
    sparkline(document.getElementById("chartPower"), state.history.power, "#E8C158");
    sparkline(document.getElementById("chartPopulation"), state.history.population, "#3E7FBF");
    sparkline(document.getElementById("chartApproval"), state.history.approval, "#3E9F5C");
    sparkline(document.getElementById("chartIndustry"), state.history.industry, "#f0a860");
    sparkline(document.getElementById("chartOil"), state.history.oil, "#2FA6A6");
  });
}
function chartCard(title,canvasId){
  return `<div class="card card-glass glass chart-card">
    <div class="panel-header"><h3>${title}</h3></div>
    <canvas id="${canvasId}"></canvas>
  </div>`;
}

// ---------------- Save / Load page ----------------
function renderSave(state){
  const el = document.getElementById("view-save");
  el.innerHTML = `
    <div class="section-title">💾 Save / Load</div>
    <div class="section-sub">پیشرفت شما به‌صورت خودکار در مرورگر ذخیره می‌شود. برای پشتیبان‌گیری می‌توانید فایل خروجی بگیرید.</div>
    <div class="grid grid-2" style="margin-bottom:14px;">
      <button class="btn btn-gold btn-block" id="btnManualSave">💾 ذخیره دستی</button>
      <button class="btn btn-outline btn-block" id="btnExport">⬇️ دانلود فایل ذخیره (JSON)</button>
    </div>
    <div class="card card-glass glass" style="margin-bottom:14px;">
      <div class="panel-header"><h3>🧾 آخرین خریدها</h3></div>
      ${state.purchaseHistory.slice(0,10).map(p => `
        <div class="history-row">
          <div><div class="h-name">${p.name} ×${p.qty}</div><div class="h-meta">نوبت ${p.turn} — باقیمانده خزانه: ${formatMoney(p.remainingTreasury)}</div></div>
          <div class="h-cost">-${formatMoney(p.cost)}</div>
        </div>
      `).join("") || emptyState("🧾","هنوز خریدی ثبت نشده")}
    </div>
    <div class="card card-glass glass">
      <div class="panel-header"><h3>⚠️ منطقه خطر</h3></div>
      <button class="btn btn-crimson btn-block" id="btnResetGame">شروع بازی جدید (حذف پیشرفت فعلی)</button>
    </div>
  `;
  document.getElementById("btnManualSave").addEventListener("click", () => {
    saveGame(state); notify("success","💾","بازی با موفقیت ذخیره شد.");
  });
  document.getElementById("btnExport").addEventListener("click", () => exportSaveAsFile(state));
  document.getElementById("btnResetGame").addEventListener("click", () => {
    openModal(`
      <h3>⚠️ شروع بازی جدید</h3>
      <p style="font-size:13px; color:var(--text-muted);">پیشرفت فعلی برای همیشه حذف خواهد شد. آیا مطمئن هستید؟</p>
      <div class="modal-actions">
        <button class="btn btn-outline btn-block" id="cancelReset">انصراف</button>
        <button class="btn btn-crimson btn-block" id="confirmReset">حذف و شروع مجدد</button>
      </div>
    `);
    document.getElementById("cancelReset").addEventListener("click", closeModal);
    document.getElementById("confirmReset").addEventListener("click", () => {
      deleteSave();
      GAME = createNewGame();
      saveGame(GAME);
      closeModal();
      notify("success","🌍","بازی جدید آغاز شد.");
      renderAll(GAME);
    });
  });
}

// ---------------- Settings page ----------------
function renderSettings(state){
  const el = document.getElementById("view-settings");
  el.innerHTML = `
    <div class="section-title">⚙️ Settings</div>
    <div class="section-sub">تنظیمات بازی و قیمت تجهیزات (قابل ویرایش)</div>
    <div class="card card-glass glass" style="margin-bottom:14px;">
      <div class="settings-row">
        <div><div class="label">ذخیره خودکار پس از هر نوبت</div><div class="desc">بازی به‌صورت خودکار در localStorage ذخیره شود.</div></div>
        <button class="btn btn-sm ${state.settings.autoSave?'btn-teal':'btn-outline'}" id="toggleAutosave">${state.settings.autoSave?'فعال':'غیرفعال'}</button>
      </div>
    </div>
    <div class="card card-glass glass">
      <div class="panel-header"><h3>💵 ویرایش قیمت تجهیزات</h3></div>
      <div style="max-height:360px; overflow:auto;">
        ${EQUIPMENT_DATA.map(item => `
          <div class="settings-row">
            <div><div class="label">${item.name}</div><div class="desc">${EQUIPMENT_CATEGORIES.find(c=>c.id===item.category).name}</div></div>
            <input type="number" step="1000" data-price="${item.id}" value="${item.price}">
          </div>
        `).join("")}
      </div>
    </div>
  `;
  document.getElementById("toggleAutosave").addEventListener("click", () => {
    state.settings.autoSave = !state.settings.autoSave; saveGame(state); renderSettings(state);
  });
  el.querySelectorAll("[data-price]").forEach(inp => {
    inp.addEventListener("change", () => {
      const item = EQUIPMENT_DATA.find(e=>e.id===inp.dataset.price);
      const val = parseInt(inp.value,10);
      if (!isNaN(val) && val >= 0){ item.price = val; notify("info","💵",`قیمت ${item.name} به‌روزرسانی شد.`); }
    });
  });
}

// ---------------- Master render ----------------
function renderAll(state){
  renderTopbar(state);
  renderDashboard(state);
  renderWorldMap(state);
  renderEconomy(state);
  renderIndustry(state);
  renderDefense(state);
  renderEquipment(state);
  renderDiplomacy(state);
  renderNews(state);
  renderStatistics(state);
  renderSave(state);
  renderSettings(state);
}
