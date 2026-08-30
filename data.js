/* =========================================================
   SITIN — Static Game Data
   All equipment is fictional; no real-world military data.
   ========================================================= */

// ---- Equipment categories -> which power stat they feed ----
const EQUIPMENT_CATEGORIES = [
  { id: "defense",    name: "Defense Units",            icon: "🛡️", tag: "tag-defense",   power: "defense" },
  { id: "support",    name: "Support Units",             icon: "🚑", tag: "tag-support",   power: "support" },
  { id: "logistics",  name: "Logistics Units",           icon: "🚛", tag: "tag-logistics", power: "logistics" },
  { id: "intel",      name: "Intelligence Units",        icon: "📡", tag: "tag-intel",     power: "intelligence" },
  { id: "cyber",      name: "Cyber Units",                icon: "💻", tag: "tag-cyber",     power: "cyber" },
  { id: "infra",      name: "Strategic Infrastructure",  icon: "🏗️", tag: "tag-infra",     power: "infrastructure" },
  { id: "industry",   name: "Industrial Equipment",      icon: "🏭", tag: "tag-industry",  power: "industrial" },
  { id: "air",        name: "Fictional Air Units",       icon: "✈️", tag: "tag-air",       power: "defense" },
  { id: "naval",      name: "Fictional Naval Units",     icon: "🚢", tag: "tag-naval",     power: "defense" },
  { id: "ground",     name: "Fictional Ground Units",    icon: "🪖", tag: "tag-ground",    power: "defense" },
];

// ---- Equipment catalog (all prices/power editable in Settings) ----
const EQUIPMENT_DATA = [
  // Defense Units
  { id:"def_alpha",  category:"defense",  name:"Defense Unit Alpha",  price:500000,   power:100, maintenance:10000,  description:"واحد دفاعی سبک برای حفاظت از مرزهای SITIN." },
  { id:"def_beta",   category:"defense",  name:"Defense Unit Beta",   price:1000000,  power:220, maintenance:20000,  description:"واحد دفاعی میانی با پوشش گسترده‌تر." },
  { id:"def_gamma",  category:"defense",  name:"Defense Unit Gamma",  price:2500000,  power:600, maintenance:45000,  description:"واحد دفاعی سنگین برای مقابله با تهدیدات بزرگ." },

  // Support Units
  { id:"sup_medical",   category:"support", name:"Medical Support Unit",   price:250000,  power:40,  maintenance:5000,  description:"پشتیبانی پزشکی برای نیروهای SITIN." },
  { id:"sup_emergency", category:"support", name:"Emergency Support Unit", price:400000,  power:70,  maintenance:8000,  description:"واکنش سریع در بحران‌های داخلی." },
  { id:"sup_rescue",    category:"support", name:"Rescue Network",         price:750000,  power:140, maintenance:15000, description:"شبکه امداد و نجات سراسری." },

  // Logistics Units
  { id:"log_unit",   category:"logistics", name:"Logistics Unit",           price:300000,  power:50,  maintenance:6000,  description:"واحد پایه حمل‌ونقل و تدارکات." },
  { id:"log_supply", category:"logistics", name:"Supply Network",           price:750000,  power:130, maintenance:14000, description:"شبکه تأمین منابع بین شهرها." },
  { id:"log_hub",    category:"logistics", name:"Advanced Logistics Hub",   price:1500000, power:280, maintenance:28000, description:"مرکز پیشرفته توزیع و تدارکات ملی." },

  // Intelligence Units
  { id:"int_center",   category:"intel", name:"Intel Center",                    price:1000000, power:180, maintenance:20000, description:"مرکز جمع‌آوری اطلاعات راهبردی." },
  { id:"int_advanced", category:"intel", name:"Advanced Intel Center",           price:2000000, power:380, maintenance:40000, description:"تحلیل پیشرفته داده‌های اطلاعاتی." },
  { id:"int_national", category:"intel", name:"National Intelligence Network",   price:4000000, power:800, maintenance:80000, description:"شبکه سراسری اطلاعات کشور SITIN." },

  // Cyber Units
  { id:"cyb_unit",     category:"cyber", name:"Cyber Unit",                 price:500000,  power:90,  maintenance:10000, description:"واحد دفاع سایبری پایه." },
  { id:"cyb_center",   category:"cyber", name:"Cyber Center",               price:1500000, power:280, maintenance:30000, description:"مرکز عملیات سایبری پیشرفته." },
  { id:"cyb_national", category:"cyber", name:"National Cyber Network",     price:3000000, power:600, maintenance:60000, description:"شبکه ملی امنیت سایبری." },

  // Strategic Infrastructure
  { id:"inf_facility", category:"infra", name:"Strategic Facility",           price:1000000, power:150, maintenance:20000,  description:"تأسیسات راهبردی چندمنظوره." },
  { id:"inf_advanced", category:"infra", name:"Advanced Facility",            price:2500000, power:400, maintenance:50000,  description:"تأسیسات پیشرفته با ظرفیت بالا." },
  { id:"inf_national", category:"infra", name:"National Infrastructure Hub",  price:5000000, power:850, maintenance:100000, description:"مرکز زیرساخت ملی SITIN." },

  // Industrial Equipment
  { id:"ind_factory",  category:"industry", name:"Equipment Factory",   price:1500000, power:220,  maintenance:30000,  description:"کارخانه تولید تجهیزات پایه." },
  { id:"ind_advanced", category:"industry", name:"Advanced Factory",    price:3000000, power:480,  maintenance:60000,  description:"کارخانه پیشرفته با اتوماسیون بالا." },
  { id:"ind_complex",  category:"industry", name:"Industrial Complex",  price:6000000, power:1000, maintenance:120000, description:"مجتمع صنعتی بزرگ‌مقیاس." },

  // Fictional Air Units
  { id:"air_falcon",  category:"air", name:"Falcon Wing Squadron",       price:1800000, power:260, maintenance:35000, description:"اسکادران هوایی خیالی برای پوشش آسمان SITIN." },
  { id:"air_specter", category:"air", name:"Specter Interceptor Wing",   price:3200000, power:480, maintenance:60000, description:"بال رهگیر پیشرفته و خیالی." },

  // Fictional Naval Units
  { id:"navy_corvette", category:"naval", name:"Coastal Corvette Fleet",   price:2000000, power:300,  maintenance:40000,  description:"ناوگان ساحلی خیالی SITIN." },
  { id:"navy_carrier",  category:"naval", name:"Strategic Carrier Group",  price:7000000, power:1100, maintenance:140000, description:"گروه ناو هواپیمابر راهبردی خیالی." },

  // Fictional Ground Units
  { id:"ground_armor", category:"ground", name:"Armored Division",     price:1200000, power:200, maintenance:22000, description:"لشکر زرهی خیالی." },
  { id:"ground_elite",  category:"ground", name:"Elite Strike Corps",   price:2800000, power:500, maintenance:50000, description:"نیروی نخبه ضربتی خیالی." },
];

// ---- Industry buildings (national production, section 11) ----
const INDUSTRY_BUILDINGS = [
  { id:"steel_factory",   name:"Steel Factory",          icon:"🏭", cost:800000,  income:40000,  maintenance:8000,  output:30,  description:"تولید فولاد برای صنایع SITIN." },
  { id:"chip_factory",    name:"Chip Factory",           icon:"💻", cost:1500000, income:90000,  maintenance:15000, output:60,  description:"تولید تراشه برای صنایع فناوری." },
  { id:"pharma_factory",  name:"Pharmaceutical Factory",  icon:"💊", cost:1200000, income:70000,  maintenance:12000, output:45,  description:"تولید داروهای استراتژیک." },
  { id:"solar_plant",     name:"Solar Plant",            icon:"☀️", cost:900000,  income:35000,  maintenance:5000,  output:20,  description:"تولید انرژی پاک و کاهش مصرف نفت." },
  { id:"industrial_mega", name:"Industrial Complex",     icon:"🏗️", cost:4000000, income:250000, maintenance:40000, output:150, description:"مجتمع صنعتی بزرگ‌مقیاس ملی." },
];

// ---- World countries (section 13 & 15) ----
const COUNTRIES = [
  { id:"sitin",  name:"SITIN",   flag:"🇸🇮", self:true,  personality:"player",      baseEconomy:100, basePower:100 },
  { id:"usa",    name:"USA",     flag:"🇺🇸", self:false, personality:"economic",    baseEconomy:180, basePower:150, trait:"اقتصادی" },
  { id:"britain",name:"Britain", flag:"🇬🇧", self:false, personality:"diplomatic",  baseEconomy:140, basePower:120, trait:"دیپلماتیک" },
  { id:"germany",name:"Germany", flag:"🇩🇪", self:false, personality:"industrial",  baseEconomy:160, basePower:140, trait:"صنعتی" },
  { id:"aurora", name:"AURORA",  flag:"🌌", self:false, personality:"tech",        baseEconomy:150, basePower:130, trait:"فناوری" },
  { id:"vortex", name:"VORTEX",  flag:"⚡", self:false, personality:"aggressive",  baseEconomy:120, basePower:170, trait:"رقابتی" },
  { id:"orion",  name:"ORION",   flag:"🌍", self:false, personality:"balanced",    baseEconomy:130, basePower:110, trait:"متعادل" },
  { id:"terra",  name:"TERRA",   flag:"🌎", self:false, personality:"balanced",    baseEconomy:135, basePower:115, trait:"متعادل" },
];

// ---- Power category display metadata ----
const POWER_CATEGORIES = [
  { id:"defense",       name:"Defense Power",        icon:"🛡️", color:"var(--crimson-bright)" },
  { id:"support",       name:"Support Power",        icon:"🚑", color:"#6fd48e" },
  { id:"logistics",     name:"Logistics Power",      icon:"🚛", color:"#79aee8" },
  { id:"intelligence",  name:"Intelligence Power",   icon:"📡", color:"#b28cf0" },
  { id:"cyber",         name:"Cyber Power",          icon:"💻", color:"var(--teal-bright)" },
  { id:"industrial",    name:"Industrial Power",     icon:"🏭", color:"#f0a860" },
  { id:"infrastructure",name:"Infrastructure Power", icon:"🏗️", color:"var(--gold-bright)" },
];

// ---- Diplomacy relation bands ----
const RELATION_BANDS = [
  { min:75,  label:"متحد",   color:"var(--teal-bright)" },
  { min:35,  label:"دوست",   color:"#6fd48e" },
  { min:-15, label:"خنثی",   color:"var(--text-muted)" },
  { min:-60, label:"رقیب",   color:"var(--gold-bright)" },
  { min:-999,label:"دشمن",   color:"var(--crimson-bright)" },
];

function getRelationBand(value){
  return RELATION_BANDS.find(b => value >= b.min);
}
