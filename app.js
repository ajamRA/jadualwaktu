/* ============================================================
   Jadual Guru Pro v3.0 — Build 2026-05-15
   Complete rewrite with improvements:
   - XSS protection (no raw innerHTML with user data)
   - Auto-assign relief (greedy + smart/optimum)
   - Dynamic bertugas week
   - Search/filter guru
   - Toast notifications
   - Relief statistics dashboard
   - Export/import data
   - Better accessibility
   - Audit fixes (2026-06-08): drag-drop validation, score sync,
     day-filtered exports, smart-assign refresh, absent ranges
   ============================================================ */

const BUILD_ID = "Build 2026-06-08 ReliefFix";
const GROQ_PROXY = "/.netlify/functions/groq-bertugas";
const BERTUGAS_CLOUD_GET = "/.netlify/functions/get-bertugas-live";
const BERTUGAS_CLOUD_PUBLISH = "/.netlify/functions/publish-bertugas-live";
const RELIEF_CLOUD_GET = "/.netlify/functions/get-relief-live";
const RELIEF_CLOUD_PUBLISH = "/.netlify/functions/publish-relief-live";
function renderBuildBadge() {
  document.title = `Jadual Guru Pro | ${BUILD_ID}`;
  const badge = document.getElementById("buildBadge");
  if (badge) badge.textContent = BUILD_ID;
}
renderBuildBadge();

// ─── Constants ───────────────────────────────────────────────
const DAYS = ["ISNIN", "SELASA", "RABU", "KHAMIS", "JUMAAT"];
const TIMES = [
  "1:00-1:30", "1:30-2:00", "2:00-2:30", "2:30-3:00", "3:00-3:30",
  "3:30-4:00", "4:00-4:30", "4:30-5:00", "5:00-5:30", "5:30-6:00", "6:00-6:30"
];
const BERTUGAS_ROWS = [
  "PAGAR WAKTU DATANG (MURID)",
  "PAGAR (12.20 TENGAH HARI)",
  "KETUA BERTUGAS DI DEWAN (12.30 TENGAH HARI)",
  "WAKTU REHAT (3.00-3.30)",
  "WAKTU REHAT (3.30-4.00)",
  "WAKTU BALIK (6.30 PETANG)",
  "KAWALAN MURID (6.00 PETANG)",
  "TUGAS KHAS"
];
const BERTUGAS_FOOTER_ROWS = [
  "BUKU LAPORAN BERTUGAS",
  "LAPORAN BERTUGAS&NILAI MURNI",
  "RMT/KANTIN"
];

const BERTUGAS_B_ROWS = [
  "WAKTU DATANG",
  "KAWALAN DI DEWAN TERBUKA",
  "KANTIN (3.00-3.30)",
  "KANTIN (3.30-4.00)",
  "KANTIN (4.00-4.30)",
  "PONDOK PENGAWAL 1",
  "PONDOK PENGAWAL 2"
];
const BERTUGAS_B_FOOTER = [
  "BUKU LAPORAN BERTUGAS",
  "LAPORAN BERTUGAS",
  "RMT/KANTIN/SUSU"
];
const BERTUGAS_B_DUTY_MAP = {
  "WAKTU DATANG": ["1:00-1:30", "1:30-2:00"],
  "KAWALAN DI DEWAN TERBUKA": ["1:00-1:30", "1:30-2:00"],
  "KANTIN (3.00-3.30)": ["3:00-3:30"],
  "KANTIN (3.30-4.00)": ["3:30-4:00"],
  "KANTIN (4.00-4.30)": ["4:00-4:30"],
  "PONDOK PENGAWAL 1": ["5:30-6:00", "6:00-6:30"],
  "PONDOK PENGAWAL 2": ["5:30-6:00", "6:00-6:30"]
};

const DUTY_TIME_MAP = {
  "PAGAR WAKTU DATANG (MURID)": ["1:00-1:30", "1:30-2:00"],
  "PAGAR (12.20 TENGAH HARI)": ["1:00-1:30"],
  "KETUA BERTUGAS DI DEWAN (12.30 TENGAH HARI)": ["1:00-1:30", "1:30-2:00"],
  "WAKTU REHAT (3.00-3.30)": ["3:00-3:30"],
  "WAKTU REHAT (3.30-4.00)": ["3:30-4:00"],
  "WAKTU BALIK (6.30 PETANG)": ["6:00-6:30"],
  "KAWALAN MURID (6.00 PETANG)": ["5:30-6:00", "6:00-6:30"],
  "TUGAS KHAS": []
};


const DEFAULT_BERTUGAS = {
  "ISNIN|PAGAR WAKTU DATANG (MURID)": "ADIBAH",
  "SELASA|PAGAR WAKTU DATANG (MURID)": "SARINAH",
  "RABU|PAGAR WAKTU DATANG (MURID)": "NURAZAM",
  "KHAMIS|PAGAR WAKTU DATANG (MURID)": "NOR ISAH",
  "JUMAAT|PAGAR WAKTU DATANG (MURID)": "SITI NURAINI",
  "ISNIN|PAGAR (12.20 TENGAH HARI)": "ADIBAH",
  "SELASA|PAGAR (12.20 TENGAH HARI)": "SARINAH",
  "RABU|PAGAR (12.20 TENGAH HARI)": "NURAZAM",
  "KHAMIS|PAGAR (12.20 TENGAH HARI)": "NOR ISAH",
  "JUMAAT|PAGAR (12.20 TENGAH HARI)": "SITI NURAINI",
  "ISNIN|KETUA BERTUGAS DI DEWAN (12.30 TENGAH HARI)": "FAEZA",
  "SELASA|KETUA BERTUGAS DI DEWAN (12.30 TENGAH HARI)": "ABDULLAH",
  "RABU|KETUA BERTUGAS DI DEWAN (12.30 TENGAH HARI)": "SARINAH",
  "KHAMIS|KETUA BERTUGAS DI DEWAN (12.30 TENGAH HARI)": "ADIBAH",
  "JUMAAT|KETUA BERTUGAS DI DEWAN (12.30 TENGAH HARI)": "RAFIDAH",
  "ISNIN|WAKTU REHAT (3.00-3.30)": "NURAZAM",
  "SELASA|WAKTU REHAT (3.00-3.30)": "FAEZA",
  "RABU|WAKTU REHAT (3.00-3.30)": "FAEZA",
  "KHAMIS|WAKTU REHAT (3.00-3.30)": "SITI NURAINI",
  "JUMAAT|WAKTU REHAT (3.00-3.30)": "ADIBAH",
  "ISNIN|WAKTU REHAT (3.30-4.00)": "SARINAH",
  "SELASA|WAKTU REHAT (3.30-4.00)": "SITI NURAINI",
  "RABU|WAKTU REHAT (3.30-4.00)": "RAFIDAH",
  "KHAMIS|WAKTU REHAT (3.30-4.00)": "ABDULLAH",
  "JUMAAT|WAKTU REHAT (3.30-4.00)": "NOR ISAH",
  "ISNIN|KAWALAN MURID (6.00 PETANG)": "SARINAH / ABDULLAH",
  "SELASA|KAWALAN MURID (6.00 PETANG)": "NURAZAM / ABDULLAH",
  "RABU|KAWALAN MURID (6.00 PETANG)": "ADIBAH / NURAZAM",
  "KHAMIS|KAWALAN MURID (6.00 PETANG)": "NOR ISAH / FAEZA",
  "JUMAAT|KAWALAN MURID (6.00 PETANG)": "RAFIDAH / NOR ISAH",
  "RABU|TUGAS KHAS": "RAFIDAH",
  "KHAMIS|TUGAS KHAS": "FAEZA",
  "JUMAAT|TUGAS KHAS": "SITI NURAINI",
  "ALL|BUKU LAPORAN BERTUGAS": "RAFIDAH",
  "ALL|LAPORAN BERTUGAS&NILAI MURNI": "FAEZA",
  "ALL|RMT/KANTIN": "SITI NURAINI"
};

// ─── Storage Keys ────────────────────────────────────────────
const KEYS = {
  jadual: "jadual-v2-data",
  relief: "jadual-v2-relief",
  jadualFile: "jadual-v2-upload",
  bertugasFiles: "jadual-v2-bertugas-files",
  bertugasData: "jadual-v2-bertugas-data",
  guruSchedules: "jadual-v3-guru-schedules",
  guruSelected: "jadual-v2-guru-selected",
  reliefScore: "jadual-v2-relief-score",
  reliefRules: "jadual-v1-relief-rules",
  reliefPlans: "jadual-v1-relief-plans",
  absentReasons: "jadual-v1-absent-reasons",
  absentRanges: "jadual-v1-absent-ranges",
  bertugasWeek: "jadual-v1-bertugas-week",
  bertugasView: "jadual-v2-bertugas-view",
  groqApiKey: "jadual-v2-groq-api-key",
  autoParseBertugas: "jadual-v2-auto-parse-bertugas",
  bertugasCloudAt: "jadual-v2-bertugas-cloud-at",
  bertugasMeta: "jadual-v2-bertugas-meta",
  reliefCloudAt: "jadual-v2-relief-cloud-at"
};

// ─── Utility: Safe text (XSS protection) ────────────────────
function esc(str) {
  const d = document.createElement("div");
  d.textContent = str || "";
  return d.innerHTML;
}

function setText(el, text) {
  if (el) el.textContent = text || "";
}

function showToast(msg, duration = 2500) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.remove("hidden");
  t.classList.add("show");
  clearTimeout(t._tid);
  t._tid = setTimeout(() => {
    t.classList.remove("show");
    t.classList.add("hidden");
  }, duration);
}

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function getWeekDates(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diff);
  const fri = new Date(mon);
  fri.setDate(mon.getDate() + 4);
  const fmt = (dt) => `${dt.getDate()} ${["Jan","Feb","Mac","Apr","Mei","Jun","Jul","Ogo","Sep","Okt","Nov","Dis"][dt.getMonth()]} ${dt.getFullYear()}`;
  return { start: fmt(mon), end: fmt(fri), startDate: mon, endDate: fri };
}


// ─── State ───────────────────────────────────────────────────
const reliefSet = new Set(JSON.parse(localStorage.getItem(KEYS.relief) || "[]"));
let scheduleMap = loadScheduleMap();
let bertugasMap = loadBertugasMap();
let guruSchedules = loadGuruSchedules();
let selectedGuru = localStorage.getItem(KEYS.guruSelected) || "MANUAL";
const absentTeachers = new Set();
let focusAbsentTeacher = "";
let focusSlotKey = "";
let reliefAssignments = {};
let slotSubjectMap = {};
const reliefScore = loadReliefScore();
let reliefRules = loadReliefRules();
let classSchedules = {};
let selectedClass = "";
let reliefPlans = loadReliefPlans();
let currentReliefDate = "";
let isReliefPlanApproved = false;
let undoStack = [];
let redoStack = [];
let absentReasons = loadAbsentReasons();
let absentRanges = loadAbsentRanges();
let bertugasWeekDate = localStorage.getItem(KEYS.bertugasWeek) || todayIso();
let bertugasMeta = loadBertugasMeta();
let closedClasses = new Set(); // Format: "KELAS_NAME" — kelas yang ditutup hari ini
let autosaveTimer = null;
let pendingAiParse = null;
let bertugasEditMode = false;

const BERTUGAS_ROW_ALIASES = {
  "PAGAR WAKTU DATANG (MURID)": "PAGAR WAKTU DATANG (MURID)",
  "PAGAR WAKTU DATANG": "PAGAR WAKTU DATANG (MURID)",
  "PAGAR (12.20 TENGAH HARI)": "PAGAR (12.20 TENGAH HARI)",
  "PAGAR": "PAGAR (12.20 TENGAH HARI)",
  "KETUA BERTUGAS DI DEWAN (12.30 TENGAH HARI)": "KETUA BERTUGAS DI DEWAN (12.30 TENGAH HARI)",
  "KETUA BERTUGAS DI DEWAN": "KETUA BERTUGAS DI DEWAN (12.30 TENGAH HARI)",
  "WAKTU REHAT (3.00-3.30)": "WAKTU REHAT (3.00-3.30)",
  "3.00-3.30": "WAKTU REHAT (3.00-3.30)",
  "WAKTU REHAT (3.30-4.00)": "WAKTU REHAT (3.30-4.00)",
  "3.30-4.00": "WAKTU REHAT (3.30-4.00)",
  "WAKTU BALIK (6.30 PETANG)": "WAKTU BALIK (6.30 PETANG)",
  "KAWALAN MURID (6.00 PETANG)": "KAWALAN MURID (6.00 PETANG)",
  "KAWALAN MURID": "KAWALAN MURID (6.00 PETANG)",
  "TUGAS KHAS": "TUGAS KHAS",
  "BUKU LAPORAN BERTUGAS": "BUKU LAPORAN BERTUGAS",
  "LAPORAN BERTUGAS&NILAI MURNI": "LAPORAN BERTUGAS&NILAI MURNI",
  "LAPORAN BERTUGAS": "LAPORAN BERTUGAS&NILAI MURNI",
  "RMT/KANTIN": "RMT/KANTIN",
  "WAKTU DATANG": "WAKTU DATANG",
  "KAWALAN DI PINTU PAGAR B": "WAKTU DATANG",
  "KAWALAN DI DEWAN TERBUKA": "KAWALAN DI DEWAN TERBUKA",
  "KANTIN (3.00-3.30)": "KANTIN (3.00-3.30)",
  "KANTIN (3.30-4.00)": "KANTIN (3.30-4.00)",
  "KANTIN (4.00-4.30)": "KANTIN (4.00-4.30)",
  "PONDOK PENGAWAL 1": "PONDOK PENGAWAL 1",
  "PONDOK PENGAWAL 2": "PONDOK PENGAWAL 2",
  "RMT/KANTIN/SUSU": "RMT/KANTIN/SUSU"
};

// ─── Load/Save Functions ─────────────────────────────────────
function loadScheduleMap() {
  const raw = localStorage.getItem(KEYS.jadual);
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}
function loadBertugasMap() {
  const raw = localStorage.getItem(KEYS.bertugasData);
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}
function loadBertugasMeta() {
  const raw = localStorage.getItem(KEYS.bertugasMeta);
  if (!raw) return { kumpulan: "B", weekText: "" };
  try {
    const v = JSON.parse(raw);
    return { kumpulan: (v.kumpulan || "B").toUpperCase(), weekText: v.weekText || "" };
  } catch { return { kumpulan: "B", weekText: "" }; }
}
function saveBertugasMeta() { localStorage.setItem(KEYS.bertugasMeta, JSON.stringify(bertugasMeta)); }
function getBertugasConfig(kumpulan) {
  const k = (kumpulan || bertugasMeta.kumpulan || "B").toUpperCase();
  if (k === "B") {
    return { kumpulan: "B", rows: BERTUGAS_B_ROWS, footer: BERTUGAS_B_FOOTER, dutyMap: BERTUGAS_B_DUTY_MAP };
  }
  return { kumpulan: "D", rows: BERTUGAS_ROWS, footer: BERTUGAS_FOOTER_ROWS, dutyMap: DUTY_TIME_MAP };
}
function loadGuruSchedules() {
  const raw = localStorage.getItem(KEYS.guruSchedules);
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}
function loadReliefScore() {
  const raw = localStorage.getItem(KEYS.reliefScore);
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}
function loadReliefRules() {
  const raw = localStorage.getItem(KEYS.reliefRules);
  if (!raw) return { maxPerDay: 2, blocklist: [], includeDutyRule: true, strictBreakRule: true };
  try {
    const v = JSON.parse(raw);
    return {
      maxPerDay: Number(v.maxPerDay || 2),
      blocklist: Array.isArray(v.blocklist) ? v.blocklist : [],
      includeDutyRule: v.includeDutyRule !== false,
      strictBreakRule: v.strictBreakRule !== false
    };
  } catch { return { maxPerDay: 2, blocklist: [], includeDutyRule: true, strictBreakRule: true }; }
}
function loadReliefPlans() {
  const raw = localStorage.getItem(KEYS.reliefPlans);
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}
function loadAbsentReasons() {
  const raw = localStorage.getItem(KEYS.absentReasons);
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}
function loadAbsentRanges() {
  const raw = localStorage.getItem(KEYS.absentRanges);
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

function saveScheduleMap() { localStorage.setItem(KEYS.jadual, JSON.stringify(scheduleMap)); }
function saveRelief() { localStorage.setItem(KEYS.relief, JSON.stringify([...reliefSet])); }
function saveBertugasMap() { localStorage.setItem(KEYS.bertugasData, JSON.stringify(bertugasMap)); }
function saveGuruSchedules() { localStorage.setItem(KEYS.guruSchedules, JSON.stringify(guruSchedules)); }
function saveReliefScore() { localStorage.setItem(KEYS.reliefScore, JSON.stringify(reliefScore)); }
function saveReliefRules() { localStorage.setItem(KEYS.reliefRules, JSON.stringify(reliefRules)); }
function saveReliefPlans() { localStorage.setItem(KEYS.reliefPlans, JSON.stringify(reliefPlans)); }
function saveAbsentReasons() { localStorage.setItem(KEYS.absentReasons, JSON.stringify(absentReasons)); }
function saveAbsentRanges() { localStorage.setItem(KEYS.absentRanges, JSON.stringify(absentRanges)); }

// ─── Undo/Redo ───────────────────────────────────────────────
function snapshotReliefState() {
  return JSON.stringify({ assignments: reliefAssignments, scores: { ...reliefScore } });
}
function pushUndoState() {
  undoStack.push(snapshotReliefState());
  if (undoStack.length > 200) undoStack.shift();
  redoStack = [];
}
function restoreFromSnapshot(s) {
  try {
    const parsed = JSON.parse(s);
    if (parsed && typeof parsed === "object" && parsed.assignments) {
      reliefAssignments = parsed.assignments || {};
      Object.keys(reliefScore).forEach((k) => delete reliefScore[k]);
      Object.assign(reliefScore, parsed.scores || {});
      saveReliefScore();
      return;
    }
    reliefAssignments = parsed || {};
  } catch { reliefAssignments = {}; }
}
function undoRelief() {
  if (isReliefPlanApproved || !undoStack.length) return;
  redoStack.push(snapshotReliefState());
  restoreFromSnapshot(undoStack.pop());
  autosaveReliefPlan();
  renderReliefUi();
}
function redoRelief() {
  if (isReliefPlanApproved || !redoStack.length) return;
  undoStack.push(snapshotReliefState());
  restoreFromSnapshot(redoStack.pop());
  autosaveReliefPlan();
  renderReliefUi();
}


// ─── Relief Plan Management ──────────────────────────────────
function setReliefStatus(text) { setText(document.getElementById("reliefPlanStatus"), text); }

function getDefaultAbsentRange() {
  const date = currentReliefDate || todayIso();
  return { start: date, end: date };
}

function ensureAbsentRange(name, resetWhenOutside = false) {
  const fallback = getDefaultAbsentRange();
  const current = absentRanges[name] || {};
  let start = current.start || fallback.start;
  let end = current.end || start;
  if (resetWhenOutside && fallback.start && (fallback.start < start || fallback.start > end)) {
    start = fallback.start;
    end = fallback.start;
  }
  absentRanges[name] = { start, end };
  return absentRanges[name];
}

function getCurrentAbsentRanges() {
  const out = {};
  [...absentTeachers].forEach((name) => { out[name] = ensureAbsentRange(name); });
  return out;
}

function getCurrentPlanPayload() {
  return { assignments: reliefAssignments, absentTeachers: [...absentTeachers], absentRanges: getCurrentAbsentRanges(), approved: isReliefPlanApproved, rules: reliefRules, closedClasses: [...closedClasses] };
}
function applyPlanPayload(plan) {
  reliefAssignments = { ...(plan.assignments || {}) };
  absentTeachers.clear();
  (plan.absentTeachers || []).forEach((x) => absentTeachers.add(x));
  if (plan.absentRanges) absentRanges = { ...absentRanges, ...plan.absentRanges };
  [...absentTeachers].forEach((name) => ensureAbsentRange(name));
  saveAbsentRanges();
  closedClasses = new Set(plan.closedClasses || []);
  isReliefPlanApproved = !!plan.approved;
  if (plan.rules) reliefRules = plan.rules;
  renderReliefRulesForm();
  setReliefStatus(`Status: ${isReliefPlanApproved ? "Approved (Locked)" : "Draft"}`);
}
function loadPlanByDate(dateStr) {
  currentReliefDate = dateStr || todayIso();
  const input = document.getElementById("reliefDate");
  if (input) input.value = currentReliefDate;
  const found = reliefPlans[currentReliefDate];
  if (found) { applyPlanPayload(found); }
  else { reliefAssignments = {}; absentTeachers.clear(); closedClasses = new Set(); isReliefPlanApproved = false; setReliefStatus("Status: Draft (Plan baru)"); }
  renderClosedClassesUi();
  renderReliefUi();
}
function saveCurrentPlan() {
  if (!currentReliefDate) currentReliefDate = todayIso();
  reliefPlans[currentReliefDate] = getCurrentPlanPayload();
  saveAbsentRanges();
  saveReliefPlans();
  setReliefStatus(`Status: ${isReliefPlanApproved ? "Approved (Locked)" : "Draft"} | Saved ${currentReliefDate}`);
  showToast("Plan disimpan.");
}
function approveCurrentPlan() {
  if (!confirm("Approve & lock plan ini? Semua edit akan dibekukan sehingga Unlock.")) return;
  isReliefPlanApproved = true;
  saveCurrentPlan();
  renderReliefUi();
  showToast("Plan approved & locked.");
}
function unlockCurrentPlan() { isReliefPlanApproved = false; saveCurrentPlan(); setReliefStatus("Status: Draft (Unlocked)"); renderReliefUi(); showToast("Plan unlocked."); }

// ─── Helper: Get all teachers ────────────────────────────────
function getAllTeachers() { return Object.keys(guruSchedules).sort(); }

// ─── Helper: Get relief day from selected date ───────────────
function getReliefDay() {
  if (!currentReliefDate) return "";
  const d = new Date(currentReliefDate + "T00:00:00");
  const dayIdx = d.getDay(); // 0=Sun, 1=Mon...
  const map = { 1: "ISNIN", 2: "SELASA", 3: "RABU", 4: "KHAMIS", 5: "JUMAAT" };
  return map[dayIdx] || "";
}

function isTeacherAbsentOnDate(name, dateStr) {
  const date = dateStr || currentReliefDate || todayIso();
  const range = ensureAbsentRange(name);
  const start = range.start || date;
  const end = range.end || start;
  return date >= start && date <= end;
}

function getAbsentTeachersForCurrentDate() {
  return [...absentTeachers].filter((name) => isTeacherAbsentOnDate(name));
}

function getReliefAssignmentRows(filterByCurrentDay = true) {
  const reliefDay = filterByCurrentDay ? getReliefDay() : "";
  return Object.entries(reliefAssignments)
    .map(([k, assignee]) => {
      const parts = k.split("|");
      return { key: k, absent: parts[0], day: parts[1], time: parts[2], assignee };
    })
    .filter((r) => r.assignee && r.day && r.time)
    .filter((r) => !reliefDay || r.day === reliefDay)
    .sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || TIMES.indexOf(a.time) - TIMES.indexOf(b.time));
}

function adjustReliefScore(name, delta) {
  if (!name || !delta) return;
  const next = (Number(reliefScore[name]) || 0) + delta;
  if (next <= 0) delete reliefScore[name];
  else reliefScore[name] = next;
}

function autosaveReliefPlan() {
  if (isReliefPlanApproved || !currentReliefDate) return;
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    reliefPlans[currentReliefDate] = getCurrentPlanPayload();
    saveAbsentRanges();
    saveReliefPlans();
    setReliefStatus(`Status: Draft | Autosaved ${currentReliefDate}`);
  }, 400);
}

// ─── Helper: Get all classes from guru schedules ─────────────
function getAllClasses() {
  const classes = new Set();
  Object.values(guruSchedules).forEach((map) => {
    Object.values(map || {}).forEach((v) => {
      if (!v || !v.includes("|")) return;
      const cls = v.split("|")[1];
      if (cls) classes.add(cls);
    });
  });
  return [...classes].sort();
}

// ─── Tutup Kelas: get teachers freed by closing a class ──────
function getTeachersFreedByClosedClasses(day) {
  // Returns a Set of teachers who are freed because their class is closed on this day
  const freed = new Set();
  if (!closedClasses.size || !day) return freed;
  Object.entries(guruSchedules).forEach(([teacher, map]) => {
    Object.entries(map || {}).forEach(([key, val]) => {
      if (!val || !val.includes("|")) return;
      const [slotDay] = key.split("|");
      if (slotDay !== day) return;
      const cls = val.split("|")[1];
      if (cls && closedClasses.has(cls)) freed.add(teacher);
    });
  });
  return freed;
}

// ─── Tutup Kelas: get slots freed for a teacher ──────────────
function getFreedSlotsForTeacher(teacher, day) {
  // Returns time slots that are freed because the class is closed
  const freed = [];
  if (!closedClasses.size || !day) return freed;
  const map = guruSchedules[teacher] || {};
  Object.entries(map).forEach(([key, val]) => {
    if (!val || !val.includes("|")) return;
    const [slotDay, time] = key.split("|");
    if (slotDay !== day) return;
    const cls = val.split("|")[1];
    if (cls && closedClasses.has(cls)) freed.push(time);
  });
  return freed;
}

// ─── Relief Eligibility Logic ────────────────────────────────
function getAssignedCountByTeacherDay() {
  const counts = {};
  Object.entries(reliefAssignments).forEach(([k, assignee]) => {
    if (!assignee) return;
    const parts = k.split("|");
    if (parts.length < 3) return;
    const day = parts[1];
    counts[`${assignee}|${day}`] = (counts[`${assignee}|${day}`] || 0) + 1;
  });
  return counts;
}

function getTeachersAssignedAtSlot(day, time, excludeAssignKey = "") {
  const assigned = new Set();
  Object.entries(reliefAssignments).forEach(([k, assignee]) => {
    if (!assignee || k === excludeAssignKey) return;
    const parts = k.split("|");
    if (parts.length < 3) return;
    if (parts[1] === day && parts[2] === time) assigned.add(assignee);
  });
  return assigned;
}

function getReliefAbsentForTeacherAtSlot(teacher, day, time) {
  for (const [k, assignee] of Object.entries(reliefAssignments)) {
    if (assignee !== teacher) continue;
    const parts = k.split("|");
    if (parts.length >= 3 && parts[1] === day && parts[2] === time) return parts[0];
  }
  return "";
}

function isBlockedByRule(teacher, day, time) {
  const token = `${teacher}|${day}|${time}`.toUpperCase();
  return (reliefRules.blocklist || []).some((r) => r.toUpperCase() === token);
}

function isTeacherOnDutyAtSlot(teacher, day, time) {
  if (reliefRules.includeDutyRule === false) return false;
  const cfg = getBertugasConfig();
  for (const row of cfg.rows) {
    const cell = (bertugasMap[`${day}|${row}`] || "").toUpperCase();
    if (!cell.split("/").map((x) => x.trim()).includes(teacher.toUpperCase())) continue;
    if ((cfg.dutyMap[row] || []).includes(time)) return true;
  }
  return false;
}

function getTeacherSlotsOnDay(teacher, day) {
  const map = guruSchedules[teacher] || {};
  const slots = [];
  TIMES.forEach((t, idx) => { if (map[`${day}|${t}`]) slots.push(idx); });
  return slots;
}

function wouldLoseAllBreaks(teacher, day, newSlotTime) {
  const map = guruSchedules[teacher] || {};
  const occupied = new Set();
  TIMES.forEach((t, idx) => { if (map[`${day}|${t}`]) occupied.add(idx); });
  // Also count already-assigned relief slots for this teacher today
  Object.entries(reliefAssignments).forEach(([k, assignee]) => {
    if (assignee !== teacher) return;
    const parts = k.split("|");
    if (parts[1] !== day) return;
    const tIdx = TIMES.indexOf(parts[2]);
    if (tIdx >= 0) occupied.add(tIdx);
  });
  const newIdx = TIMES.indexOf(newSlotTime);
  if (newIdx >= 0) occupied.add(newIdx);
  if (occupied.size < 3) return false;
  const sorted = [...occupied].sort((a, b) => a - b);
  // Check if there's at least one gap
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] - sorted[i] > 1) return false;
  }
  return sorted.length >= TIMES.length - 1;
}

function getEligibleTeachers(day, time, excludeSet, excludeAssignKey = "") {
  const dailyCounts = getAssignedCountByTeacherDay();
  const maxPerDay = Number(reliefRules.maxPerDay || 2);
  const freedByClass = getTeachersFreedByClosedClasses(day);
  const busyAtSlot = getTeachersAssignedAtSlot(day, time, excludeAssignKey);
  return getAllTeachers()
    .filter((t) => !excludeSet.has(t))
    .filter((t) => !busyAtSlot.has(t))
    .filter((t) => {
      const hasClass = !!(guruSchedules[t] || {})[`${day}|${time}`];
      if (!hasClass) return true; // already free
      // If teacher has class but that class is closed, they're available
      if (hasClass && freedByClass.has(t)) {
        const val = (guruSchedules[t] || {})[`${day}|${time}`] || "";
        const cls = val.split("|")[1] || "";
        if (closedClasses.has(cls)) return true;
      }
      return false;
    })
    .filter((t) => !isTeacherOnDutyAtSlot(t, day, time))
    .filter((t) => !isBlockedByRule(t, day, time))
    .filter((t) => (dailyCounts[`${t}|${day}`] || 0) < maxPerDay)
    .filter((t) => reliefRules.strictBreakRule === false || !wouldLoseAllBreaks(t, day, time));
}

function getIneligibilityReason(teacher, day, time, excludeSet, excludeAssignKey = "") {
  if (excludeSet.has(teacher)) return `${teacher}: dalam senarai tak hadir.`;
  if (getTeachersAssignedAtSlot(day, time, excludeAssignKey).has(teacher)) {
    return `${teacher}: dah assign relief pada ${time} (slot lain).`;
  }
  const hasClass = !!(guruSchedules[teacher] || {})[`${day}|${time}`];
  if (hasClass) {
    const val = (guruSchedules[teacher] || {})[`${day}|${time}`] || "";
    const cls = val.split("|")[1] || "";
    const freedByClass = getTeachersFreedByClosedClasses(day);
    if (!(freedByClass.has(teacher) && closedClasses.has(cls))) {
      return `${teacher}: ada kelas${cls ? ` (${cls})` : ""} pada ${time}.`;
    }
  }
  if (isTeacherOnDutyAtSlot(teacher, day, time)) return `${teacher}: sedang bertugas pada ${time}.`;
  if (isBlockedByRule(teacher, day, time)) return `${teacher}: diblock oleh tetapan relief.`;
  const dailyCounts = getAssignedCountByTeacherDay();
  const maxPerDay = Number(reliefRules.maxPerDay || 2);
  if ((dailyCounts[`${teacher}|${day}`] || 0) >= maxPerDay) return `${teacher}: dah capai max ${maxPerDay} relief/hari.`;
  if (reliefRules.strictBreakRule !== false && wouldLoseAllBreaks(teacher, day, time)) {
    return `${teacher}: akan hilang semua rehat.`;
  }
  return `${teacher} tak available untuk slot ini.`;
}

function applyReliefAssignment(assignKey, teacherName, options = {}) {
  const { validate = true } = options;
  const parts = assignKey.split("|");
  if (parts.length < 3 || !teacherName) return false;
  const [, day, time] = parts;
  const excludeSet = new Set([...absentTeachers]);
  if (validate && !getEligibleTeachers(day, time, excludeSet, assignKey).includes(teacherName)) return false;
  const prev = reliefAssignments[assignKey];
  if (prev === teacherName) return true;
  if (prev) adjustReliefScore(prev, -1);
  reliefAssignments[assignKey] = teacherName;
  adjustReliefScore(teacherName, 1);
  return true;
}

function assignReliefSlot(assignKey, teacherName, options = {}) {
  const { skipUndo = false, silent = false } = options;
  const parts = assignKey.split("|");
  if (parts.length < 3 || !teacherName) return false;
  const [, day, time] = parts;
  const excludeSet = new Set([...absentTeachers]);
  if (!getEligibleTeachers(day, time, excludeSet, assignKey).includes(teacherName)) {
    if (!silent) showToast(getIneligibilityReason(teacherName, day, time, excludeSet, assignKey));
    return false;
  }
  if (!skipUndo) pushUndoState();
  applyReliefAssignment(assignKey, teacherName, { validate: false });
  saveReliefScore();
  autosaveReliefPlan();
  if (!silent) renderReliefUi();
  return true;
}

function clearReliefSlot(assignKey, options = {}) {
  const { skipUndo = false } = options;
  const prev = reliefAssignments[assignKey];
  if (!prev) return;
  if (!skipUndo) pushUndoState();
  delete reliefAssignments[assignKey];
  adjustReliefScore(prev, -1);
  saveReliefScore();
  autosaveReliefPlan();
}

function getSubjectTeachersMap() {
  const out = {};
  Object.entries(guruSchedules).forEach(([teacher, map]) => {
    Object.values(map || {}).forEach((v) => {
      if (!v || !v.includes("|")) return;
      const subject = v.split("|")[0].trim().toUpperCase();
      if (!subject) return;
      if (!out[subject]) out[subject] = new Set();
      out[subject].add(teacher);
    });
  });
  return out;
}

function rankByScore(teachers) {
  return teachers
    .map((name) => ({ name, score: Number(reliefScore[name] || 0) }))
    .sort((a, b) => a.score - b.score || a.name.localeCompare(b.name));
}


// ─── AUTO-ASSIGN Relief ──────────────────────────────────────
// Greedy: assign one by one, prioritize same-subject, lowest score
// Only assigns for the selected relief day
function autoAssignGreedy() {
  if (isReliefPlanApproved) return;
  const absent = getAbsentTeachersForCurrentDate();
  if (!absent.length) {
    showToast(absentTeachers.size ? "Tiada guru ditanda tak hadir pada tarikh ini." : "Pilih guru tak hadir dulu.");
    return;
  }
  const reliefDay = getReliefDay();
  if (!reliefDay) { showToast("Tarikh yang dipilih bukan hari sekolah."); return; }
  pushUndoState();
  const subjectMap = getSubjectTeachersMap();
  let assigned = 0;
  let skipped = 0;

  absent.forEach((absentName) => {
    const map = guruSchedules[absentName] || {};
    Object.entries(map).forEach(([key, val]) => {
      if (!val || !val.includes("|")) return;
      const [day, time] = key.split("|");
      if (day !== reliefDay) return; // Only process today's slots
      const assignKey = `${absentName}|${key}`;
      if (reliefAssignments[assignKey]) return; // already assigned
      const subject = val.split("|")[0].trim().toUpperCase();
      const excludeSet = new Set(absent);
      const eligible = getEligibleTeachers(day, time, excludeSet, assignKey);
      // Prioritize same subject
      const sameSubj = eligible.filter((t) => subjectMap[subject] && subjectMap[subject].has(t));
      const pool = sameSubj.length ? sameSubj : eligible;
      const ranked = rankByScore(pool);
      if (ranked.length) {
        applyReliefAssignment(assignKey, ranked[0].name, { validate: false });
        assigned++;
      } else {
        skipped++;
      }
    });
  });

  saveReliefScore();
  autosaveReliefPlan();
  renderReliefUi();
  const log = document.getElementById("autoAssignLog");
  if (log) log.textContent = `Auto-assign (${reliefDay}): ${assigned} slot diisi, ${skipped} slot tiada guru available.`;
  showToast(`Auto-assign: ${assigned} slot diisi.`);
}

// Smart: uses constraint-first to minimize max load on any single teacher
// Only assigns for the selected relief day
function autoAssignSmart() {
  if (isReliefPlanApproved) return;
  const absent = getAbsentTeachersForCurrentDate();
  if (!absent.length) {
    showToast(absentTeachers.size ? "Tiada guru ditanda tak hadir pada tarikh ini." : "Pilih guru tak hadir dulu.");
    return;
  }
  const reliefDay = getReliefDay();
  if (!reliefDay) { showToast("Tarikh yang dipilih bukan hari sekolah."); return; }
  pushUndoState();
  const subjectMap = getSubjectTeachersMap();

  // Collect all unassigned slots FOR TODAY ONLY
  const slots = [];
  absent.forEach((absentName) => {
    const map = guruSchedules[absentName] || {};
    Object.entries(map).forEach(([key, val]) => {
      if (!val || !val.includes("|")) return;
      const [day, time] = key.split("|");
      if (day !== reliefDay) return; // Only today
      const assignKey = `${absentName}|${key}`;
      if (reliefAssignments[assignKey]) return;
      const subject = val.split("|")[0].trim().toUpperCase();
      slots.push({ assignKey, day, time, subject, absentName });
    });
  });

  const excludeSet = new Set(absent);
  let assigned = 0;
  let skipped = 0;

  while (slots.length) {
    slots.forEach((s) => {
      s.eligible = getEligibleTeachers(s.day, s.time, excludeSet, s.assignKey);
      s.sameSubj = s.eligible.filter((t) => subjectMap[s.subject] && subjectMap[s.subject].has(t));
    });
    slots.sort((a, b) => a.eligible.length - b.eligible.length || a.assignKey.localeCompare(b.assignKey));

    const slot = slots.shift();
    const pool = slot.sameSubj.length ? slot.sameSubj : slot.eligible;
    const ranked = rankByScore(pool);
    if (ranked.length) {
      const chosen = ranked[0].name;
      applyReliefAssignment(slot.assignKey, chosen, { validate: false });
      assigned++;
    } else {
      skipped++;
    }
  }

  saveReliefScore();
  autosaveReliefPlan();
  renderReliefUi();
  const log = document.getElementById("autoAssignLog");
  if (log) log.textContent = `Smart assign (${reliefDay}): ${assigned} slot diisi, ${skipped} slot tiada guru available.`;
  showToast(`Smart assign: ${assigned} slot diisi.`);
}


// ─── Tab Navigation ──────────────────────────────────────────
function activateTab(name) {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    const active = btn.dataset.tab === name;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", String(active));
  });
  document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.toggle("active", panel.id === `tab-${name}`));
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.getElementById(`tab-${name}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

// ─── Table Builders ──────────────────────────────────────────
function buildTimeHeaderRow() {
  const tr = document.createElement("tr");
  const th0 = document.createElement("th");
  th0.textContent = "HARI";
  tr.appendChild(th0);
  TIMES.forEach((t) => { const th = document.createElement("th"); th.textContent = t; tr.appendChild(th); });
  return tr;
}

function buildBertugasHeaderRow() {
  const tr = document.createElement("tr");
  const th0 = document.createElement("th");
  th0.textContent = "TUGAS";
  tr.appendChild(th0);
  DAYS.forEach((d) => { const th = document.createElement("th"); th.textContent = d; tr.appendChild(th); });
  return tr;
}

// ─── Main Jadual Table ───────────────────────────────────────
function buildMainTable() {
  const table = document.getElementById("jadualTable");
  table.innerHTML = "";
  const thead = document.createElement("thead");
  thead.appendChild(buildTimeHeaderRow());
  table.appendChild(thead);
  const tbody = document.createElement("tbody");

  const viewMap = selectedGuru !== "MANUAL" && guruSchedules[selectedGuru] ? guruSchedules[selectedGuru] : scheduleMap;

  for (const day of DAYS) {
    const tr = document.createElement("tr");
    const dayCell = document.createElement("th");
    dayCell.className = "day-col";
    dayCell.textContent = day;
    tr.appendChild(dayCell);

    TIMES.forEach((time, idx) => {
      const key = `${day}|${time}`;
      const td = document.createElement("td");
      td.className = "slot-cell";
      td.setAttribute("tabindex", "0");
      td.setAttribute("role", "button");
      td.setAttribute("aria-label", `${day} ${time}`);

      const text = viewMap[key] || "";
      if (text.includes("|")) {
        const [subjek, kelas] = text.split("|");
        const s = document.createElement("div");
        s.className = "subjek";
        s.textContent = subjek;
        const k = document.createElement("div");
        k.className = "kelas";
        k.textContent = kelas;
        td.appendChild(s);
        td.appendChild(k);
      }

      const timeStr = TIMES[idx];
      const reliefKey = `${selectedGuru}::${day}|${idx}`;
      const legacyKey = `${day}|${idx}`;
      const reliefDay = getReliefDay();
      const eReliefAbsent = reliefDay === day && selectedGuru !== "MANUAL"
        ? getReliefAbsentForTeacherAtSlot(selectedGuru, day, timeStr)
        : "";
      const fromERelief = !!eReliefAbsent;
      if (reliefSet.has(reliefKey) || (selectedGuru === "MANUAL" && reliefSet.has(legacyKey)) || fromERelief) {
        td.classList.add("relief");
      }
      if (fromERelief) {
        const hint = document.createElement("div");
        hint.className = "hint";
        hint.textContent = `E-Relief: ${eReliefAbsent}`;
        td.appendChild(hint);
      }
      const toggle = () => {
        if (fromERelief) {
          showToast(`Slot e-relief untuk ${eReliefAbsent}. Edit dalam tab Relief.`);
          activateTab("relief");
          return;
        }
        td.classList.toggle("relief");
        if (td.classList.contains("relief")) reliefSet.add(reliefKey);
        else reliefSet.delete(reliefKey);
        saveRelief();
      };
      td.addEventListener("click", toggle);
      td.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
}

// ─── Guru Picker ─────────────────────────────────────────────
function getTeacherPillText() {
  if (selectedGuru && selectedGuru !== "MANUAL") return selectedGuru;
  return "MUHAMAD NURAZAM BIN RAHIM";
}
function updateTeacherPill() {
  const pill = document.getElementById("teacherNameBtn");
  if (pill) pill.textContent = getTeacherPillText();
}
function renderGuruOptions() {
  const valid = new Set(["MANUAL", ...Object.keys(guruSchedules)]);
  if (!valid.has(selectedGuru)) selectedGuru = "MANUAL";
  updateTeacherPill();
}

function openGuruPickerModal() {
  const modal = document.getElementById("guruPickerModal");
  const list = document.getElementById("guruPickerList");
  const search = document.getElementById("guruPickerSearch");
  list.innerHTML = "";
  if (search) search.value = "";

  const selectGuru = (name) => {
    selectedGuru = name;
    localStorage.setItem(KEYS.guruSelected, selectedGuru);
    updateTeacherPill();
    buildMainTable();
    modal.classList.add("hidden");
  };

  const manual = document.createElement("button");
  manual.className = "btn secondary";
  manual.style.width = "100%";
  manual.style.textAlign = "left";
  manual.textContent = "Manual (Jadual Semasa)";
  manual.addEventListener("click", () => selectGuru("MANUAL"));
  list.appendChild(manual);

  getAllTeachers().forEach((name) => {
    const btn = document.createElement("button");
    btn.className = "btn secondary";
    btn.style.width = "100%";
    btn.style.textAlign = "left";
    btn.textContent = name;
    btn.dataset.name = name.toLowerCase();
    btn.addEventListener("click", () => selectGuru(name));
    list.appendChild(btn);
  });

  if (search) {
    search.oninput = () => {
      const q = search.value.toLowerCase();
      list.querySelectorAll("button").forEach((btn) => {
        if (!btn.dataset.name) { btn.style.display = ""; return; }
        btn.style.display = btn.dataset.name.includes(q) ? "" : "none";
      });
    };
  }

  modal.classList.remove("hidden");
  if (search) search.focus();
}


// ─── Class Schedule ──────────────────────────────────────────
function buildClassSchedules() {
  const out = {};
  Object.entries(guruSchedules).forEach(([teacher, map]) => {
    Object.entries(map || {}).forEach(([key, val]) => {
      if (!val || !val.includes("|")) return;
      const [subj, cls] = val.split("|");
      if (!cls) return;
      if (!out[cls]) out[cls] = {};
      out[cls][key] = `${subj}|${teacher}`;
    });
  });
  classSchedules = out;
}

function renderClassOptions() {
  const sel = document.getElementById("classSelect");
  if (!sel) return;
  sel.innerHTML = "";
  const classes = Object.keys(classSchedules).sort();
  classes.forEach((c) => { const o = document.createElement("option"); o.value = c; o.textContent = c; sel.appendChild(o); });
  if (!selectedClass || !classes.includes(selectedClass)) selectedClass = classes[0] || "";
  sel.value = selectedClass || "";
}

function buildClassTable() {
  const table = document.getElementById("classTable");
  if (!table) return;
  table.innerHTML = "";
  const map = classSchedules[selectedClass] || {};
  const thead = document.createElement("thead");
  thead.appendChild(buildTimeHeaderRow());
  table.appendChild(thead);
  const tbody = document.createElement("tbody");
  for (const day of DAYS) {
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    th.className = "day-col";
    th.textContent = day;
    tr.appendChild(th);
    TIMES.forEach((time) => {
      const td = document.createElement("td");
      td.className = "slot-cell";
      const v = map[`${day}|${time}`] || "";
      if (v.includes("|")) {
        const [subj, teacher] = v.split("|");
        const s = document.createElement("div"); s.className = "subjek"; s.textContent = subj;
        const k = document.createElement("div"); k.className = "kelas"; k.textContent = teacher;
        td.appendChild(s); td.appendChild(k);
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
}

// ─── Relief UI ───────────────────────────────────────────────
function addAbsentTeacher(name) {
  if (isReliefPlanApproved || !name) return;
  absentTeachers.add(name);
  ensureAbsentRange(name, true);
  saveAbsentRanges();
  if (!focusAbsentTeacher) focusAbsentTeacher = name;
  renderReliefUi();
}
function removeAbsentTeacher(name) {
  if (isReliefPlanApproved) return;
  absentTeachers.delete(name);
  if (focusAbsentTeacher === name) focusAbsentTeacher = [...absentTeachers][0] || "";
  renderReliefUi();
}

function renderReliefTeacherList() {
  const wrap = document.getElementById("reliefTeacherList");
  wrap.innerHTML = "";
  const teachers = getAllTeachers();
  if (!teachers.length) {
    wrap.innerHTML = "<div class='hint'>Belum ada data guru. Upload guru-schedules.json dulu.</div>";
    return;
  }
  teachers.forEach((name) => {
    const item = document.createElement("label");
    item.className = "teacher-item";
    item.dataset.name = name.toLowerCase();
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = absentTeachers.has(name);
    cb.disabled = isReliefPlanApproved;
    cb.setAttribute("aria-label", `Tandakan ${name} tidak hadir`);
    const chip = document.createElement("span");
    chip.className = "teacher-chip";
    chip.textContent = name;
    chip.draggable = true;
    chip.setAttribute("tabindex", "0");
    chip.addEventListener("dragstart", (e) => e.dataTransfer.setData("text/plain", name));
    chip.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { cb.checked = !cb.checked; cb.dispatchEvent(new Event("change")); }
    });
    cb.addEventListener("change", () => {
      if (isReliefPlanApproved) { cb.checked = absentTeachers.has(name); return; }
      if (cb.checked) addAbsentTeacher(name);
      else removeAbsentTeacher(name);
    });
    item.appendChild(cb);
    item.appendChild(chip);
    wrap.appendChild(item);
  });
}

function filterTeacherList() {
  const q = (document.getElementById("teacherSearchInput").value || "").toLowerCase();
  document.querySelectorAll("#reliefTeacherList .teacher-item").forEach((el) => {
    el.classList.toggle("hidden", q && !el.dataset.name.includes(q));
  });
}

function renderAbsentList() {
  const wrap = document.getElementById("absentList");
  wrap.innerHTML = "";
  [...absentTeachers].sort().forEach((name) => {
    const tag = document.createElement("div");
    tag.className = "absent-tag";
    const focusBtn = document.createElement("button");
    focusBtn.className = "ghost-btn";
    focusBtn.textContent = name;
    focusBtn.title = "Buka jadual";
    focusBtn.setAttribute("aria-label", `Fokus jadual ${name}`);
    focusBtn.addEventListener("click", () => { focusAbsentTeacher = name; renderReliefUi(); });
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "✕";
    removeBtn.title = "Buang";
    removeBtn.setAttribute("aria-label", `Buang ${name} dari senarai`);
    removeBtn.addEventListener("click", () => removeAbsentTeacher(name));
    tag.appendChild(focusBtn);
    tag.appendChild(removeBtn);
    wrap.appendChild(tag);
  });
}

function updateAbsentRange(name, field, value) {
  if (isReliefPlanApproved || !name) return;
  const range = ensureAbsentRange(name);
  const next = { ...range, [field]: value || range[field] };
  if (next.start && next.end && next.end < next.start) {
    if (field === "start") next.end = next.start;
    else next.start = next.end;
  }
  absentRanges[name] = next;
  saveAbsentRanges();
  renderAbsentSummary();
}

function renderAbsentSummary() {
  const wrap = document.getElementById("absentSummaryList");
  if (!wrap) return;
  wrap.innerHTML = "";
  const names = [...absentTeachers].sort();
  if (!names.length) {
    const empty = document.createElement("div");
    empty.className = "hint";
    empty.textContent = "Belum ada guru ditanda tidak hadir.";
    wrap.appendChild(empty);
    return;
  }

  names.forEach((name) => {
    const range = ensureAbsentRange(name);
    const activeToday = isTeacherAbsentOnDate(name);
    const row = document.createElement("div");
    row.className = `absent-summary-row${activeToday ? "" : " absent-summary-inactive"}`;

    const nameBtn = document.createElement("button");
    nameBtn.className = "absent-summary-name";
    nameBtn.textContent = name;
    nameBtn.title = "Buka jadual";
    nameBtn.setAttribute("aria-label", `Fokus jadual ${name}`);
    nameBtn.addEventListener("click", () => { focusAbsentTeacher = name; renderReliefUi(); });

    const startWrap = document.createElement("label");
    startWrap.className = "absent-date-field";
    startWrap.textContent = "Mula";
    const startInput = document.createElement("input");
    startInput.type = "date";
    startInput.value = range.start || "";
    startInput.disabled = isReliefPlanApproved;
    startInput.setAttribute("aria-label", `Tarikh mula ${name} tidak hadir`);
    startInput.addEventListener("change", () => updateAbsentRange(name, "start", startInput.value));
    startWrap.appendChild(startInput);

    const endWrap = document.createElement("label");
    endWrap.className = "absent-date-field";
    endWrap.textContent = "Sampai";
    const endInput = document.createElement("input");
    endInput.type = "date";
    endInput.value = range.end || range.start || "";
    endInput.min = range.start || "";
    endInput.disabled = isReliefPlanApproved;
    endInput.setAttribute("aria-label", `Tarikh tamat ${name} tidak hadir`);
    endInput.addEventListener("change", () => updateAbsentRange(name, "end", endInput.value));
    endWrap.appendChild(endInput);

    row.appendChild(nameBtn);
    row.appendChild(startWrap);
    row.appendChild(endWrap);
    if (!activeToday) {
      const note = document.createElement("div");
      note.className = "absent-range-note";
      note.textContent = "Tak termasuk tarikh hari ini";
      row.appendChild(note);
    }
    wrap.appendChild(row);
  });
}


// ─── Relief Teacher Table & Available Teachers ───────────────
function buildReliefTeacherTable() {
  const label = document.getElementById("reliefFocusLabel");
  const table = document.getElementById("reliefTeacherTable");
  const slotSel = document.getElementById("availableSlotSelect");
  table.innerHTML = "";
  slotSel.innerHTML = "";
  if (!focusAbsentTeacher || !guruSchedules[focusAbsentTeacher]) {
    setText(label, "Belum pilih cikgu.");
    return;
  }
  const reliefDay = getReliefDay();
  setText(label, `Cikgu dipilih: ${focusAbsentTeacher}${reliefDay ? ` (${reliefDay})` : ""}`);
  const map = guruSchedules[focusAbsentTeacher] || {};
  slotSubjectMap = {};
  const allBusySlots = [];
  const thead = document.createElement("thead");

  // Build header: only show HARI + time slots
  const headerRow = document.createElement("tr");
  const th0 = document.createElement("th"); th0.textContent = "HARI"; headerRow.appendChild(th0);
  TIMES.forEach((t) => { const th = document.createElement("th"); th.textContent = t; headerRow.appendChild(th); });
  thead.appendChild(headerRow);
  table.appendChild(thead);
  const tbody = document.createElement("tbody");

  // Only show the relief day (or all days if no date selected)
  const daysToShow = reliefDay ? [reliefDay] : DAYS;

  for (const day of daysToShow) {
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    th.className = "day-col";
    th.textContent = day;
    tr.appendChild(th);
    TIMES.forEach((time) => {
      const k = `${day}|${time}`;
      const td = document.createElement("td");
      td.className = "slot-cell";
      const val = map[k] || "";
      if (val) {
        allBusySlots.push(k);
        const parts = val.split("|");
        const sub = parts[0] || "";
        const cls = parts[1] || "";
        slotSubjectMap[k] = sub.trim().toUpperCase();
        const assignee = reliefAssignments[`${focusAbsentTeacher}|${k}`] || "";

        const sDiv = document.createElement("div"); sDiv.className = "subjek"; sDiv.textContent = sub;
        const cDiv = document.createElement("div"); cDiv.className = "kelas"; cDiv.textContent = cls;
        const hDiv = document.createElement("div"); hDiv.className = "hint";
        hDiv.textContent = assignee ? `Relief: ${assignee}` : "Klik untuk assign";
        td.appendChild(sDiv); td.appendChild(cDiv); td.appendChild(hDiv);

        if (assignee) {
          td.classList.add("assigned");
          const badge = document.createElement("span"); badge.className = "relief-badge"; badge.textContent = "✓";
          td.appendChild(badge);
        }

        td.dataset.dropkey = k;
        td.addEventListener("dragover", (e) => e.preventDefault());
        td.addEventListener("drop", (e) => {
          if (isReliefPlanApproved) return;
          e.preventDefault();
          const tName = e.dataTransfer.getData("text/plain");
          if (!tName) return;
          assignReliefSlot(`${focusAbsentTeacher}|${k}`, tName);
        });
        td.addEventListener("click", () => {
          if (isReliefPlanApproved) return;
          focusSlotKey = k;
          openAssignModal(k);
        });
        td.setAttribute("tabindex", "0");
        td.setAttribute("role", "button");
        td.setAttribute("aria-label", `${day} ${time} ${sub} ${cls} ${assignee ? "Relief: " + assignee : "Belum assign"}`);
        td.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); td.click(); } });
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);

  allBusySlots.forEach((k) => {
    const opt = document.createElement("option");
    opt.value = k;
    opt.textContent = k.replace("|", " ");
    slotSel.appendChild(opt);
  });
  if (!focusSlotKey || !allBusySlots.includes(focusSlotKey)) focusSlotKey = allBusySlots[0] || "";
  slotSel.value = focusSlotKey;
}

function renderAvailableTeachers() {
  const wrap = document.getElementById("availableTeachers");
  wrap.innerHTML = "";
  if (!focusAbsentTeacher || !focusSlotKey) return;
  const [day, time] = focusSlotKey.split("|");
  const excludeSet = new Set([...absentTeachers]);
  const slotAssignKey = `${focusAbsentTeacher}|${focusSlotKey}`;
  const eligible = getEligibleTeachers(day, time, excludeSet, slotAssignKey);
  const subject = slotSubjectMap[focusSlotKey] || "";
  const subjectMap = getSubjectTeachersMap();
  const sameSubj = eligible.filter((t) => subjectMap[subject] && subjectMap[subject].has(t));

  const ranked = rankByScore(eligible);
  const minScore = ranked.length ? ranked[0].score : 0;

  ranked.slice(0, 30).forEach(({ name, score }) => {
    const chip = document.createElement("span");
    chip.className = "teacher-chip";
    if (sameSubj.includes(name)) chip.classList.add("recommended");
    chip.textContent = `${name} (${score})${sameSubj.includes(name) ? " ★" : ""}`;
    chip.draggable = true;
    chip.setAttribute("tabindex", "0");
    chip.setAttribute("aria-label", `${name} score ${score}${sameSubj.includes(name) ? " subjek sama" : ""}`);
    chip.addEventListener("dragstart", (e) => e.dataTransfer.setData("text/plain", name));
    chip.addEventListener("keydown", (e) => {
      if (e.key === "Enter") assignReliefSlot(`${focusAbsentTeacher}|${focusSlotKey}`, name);
    });
    wrap.appendChild(chip);
  });
  if (!eligible.length) wrap.innerHTML = "<div class='hint'>Tiada cikgu available untuk slot ini.</div>";
  renderIneligibleTeachers(wrap, day, time, excludeSet, eligible, slotAssignKey);
}

function renderIneligibleTeachers(wrap, day, time, excludeSet, eligibleSet, excludeAssignKey = "") {
  const subject = slotSubjectMap[focusSlotKey] || "";
  const subjectMap = getSubjectTeachersMap();
  const related = subjectMap[subject] ? [...subjectMap[subject]] : [];
  const ineligible = getAllTeachers()
    .filter((t) => !excludeSet.has(t) && !eligibleSet.includes(t))
    .filter((t) => !related.length || related.includes(t))
    .slice(0, eligibleSet.length ? 5 : 10);
  if (!ineligible.length) return;

  const box = document.createElement("div");
  box.className = "ineligible-box";
  const title = document.createElement("div");
  title.className = "hint";
  title.textContent = "Kenapa guru lain tak available:";
  box.appendChild(title);
  ineligible.forEach((name) => {
    const line = document.createElement("div");
    line.className = "ineligible-line";
    line.textContent = getIneligibilityReason(name, day, time, excludeSet, excludeAssignKey);
    box.appendChild(line);
  });
  wrap.appendChild(box);
}


// ─── Assign Modal ────────────────────────────────────────────
function openAssignModal(slotKey) {
  if (isReliefPlanApproved) return;
  const modal = document.getElementById("assignModal");
  const list = document.getElementById("assignList");
  const title = document.getElementById("assignTitle");
  list.innerHTML = "";
  if (!focusAbsentTeacher || !slotKey) return;

  const [day, time] = slotKey.split("|");
  const subject = (slotSubjectMap[slotKey] || "").toUpperCase();
  const subjectMap = getSubjectTeachersMap();
  const excludeSet = new Set([...absentTeachers]);
  const slotAssignKey = `${focusAbsentTeacher}|${slotKey}`;
  const eligible = getEligibleTeachers(day, time, excludeSet, slotAssignKey);

  const sameSubj = eligible.filter((t) => subjectMap[subject] && subjectMap[subject].has(t));
  const rankedSubj = rankByScore(sameSubj);
  const rankedAll = rankByScore(eligible);

  title.textContent = `Pilih Relief (${day} ${time}) - Subjek ${subject || "-"}`;

  const renderButtons = (arr, prefix = "") => {
    arr.forEach(({ name, score }) => {
      const row = document.createElement("button");
      row.className = "btn secondary";
      row.style.width = "100%";
      row.style.textAlign = "left";
      row.textContent = `${prefix}${name} (score: ${score})`;
      row.addEventListener("click", () => {
        if (isReliefPlanApproved) return;
        if (assignReliefSlot(`${focusAbsentTeacher}|${slotKey}`, name, { silent: true })) {
          modal.classList.add("hidden");
          renderReliefUi();
          showToast(`${name} di-assign untuk ${day} ${time}.`);
        }
      });
      list.appendChild(row);
    });
  };

  if (rankedSubj.length) {
    const hint = document.createElement("div");
    hint.className = "hint";
    hint.textContent = "★ Keutamaan: cikgu subjek sama";
    list.appendChild(hint);
    renderButtons(rankedSubj, "★ ");
    if (rankedAll.length > rankedSubj.length) {
      const hint2 = document.createElement("div");
      hint2.className = "hint";
      hint2.style.marginTop = "10px";
      hint2.textContent = "Lain-lain guru free:";
      list.appendChild(hint2);
      renderButtons(rankedAll.filter((r) => !sameSubj.includes(r.name)));
    }
  } else if (rankedAll.length) {
    const hint = document.createElement("div");
    hint.className = "hint";
    hint.textContent = "Tiada cikgu subjek sama. Senarai guru free (ikut score terendah):";
    list.appendChild(hint);
    renderButtons(rankedAll);
  } else {
    const hint = document.createElement("div");
    hint.className = "hint";
    hint.textContent = "Tiada cikgu available untuk slot ini.";
    list.appendChild(hint);
  }

  // Unassign button if already assigned
  const currentAssignee = reliefAssignments[`${focusAbsentTeacher}|${slotKey}`];
  if (currentAssignee) {
    const unBtn = document.createElement("button");
    unBtn.className = "btn warn";
    unBtn.style.width = "100%";
    unBtn.style.marginTop = "10px";
    unBtn.textContent = `Buang assignment (${currentAssignee})`;
    unBtn.addEventListener("click", () => {
      clearReliefSlot(`${focusAbsentTeacher}|${slotKey}`);
      modal.classList.add("hidden");
      renderReliefUi();
      showToast("Assignment dibuang.");
    });
    list.appendChild(unBtn);
  }

  modal.classList.remove("hidden");
}

// ─── Relief Dropzone ─────────────────────────────────────────
function bindReliefDropzone() {
  const zone = document.getElementById("absentDropzone");
  zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("drag-over"); });
  zone.addEventListener("dragleave", () => zone.classList.remove("drag-over"));
  zone.addEventListener("drop", (e) => {
    if (isReliefPlanApproved) return;
    e.preventDefault();
    zone.classList.remove("drag-over");
    const name = e.dataTransfer.getData("text/plain");
    addAbsentTeacher(name);
  });
}

// ─── Relief Summary & Stats ──────────────────────────────────
function renderReliefUi() {
  renderReliefTeacherList();
  renderAbsentList();
  renderAbsentSummary();
  buildReliefTeacherTable();
  renderAvailableTeachers();
  renderFinalReliefPlan();
  renderTeacherLoadSummary();
  renderClashWarning();
  renderReliefStats();
  renderClosedClassesUi();
  buildMainTable();
}

function renderFinalReliefPlan() {
  const wrap = document.getElementById("finalReliefPlan");
  if (!wrap) return;
  wrap.innerHTML = "";
  const rows = getReliefAssignmentRows(true);

  if (!rows.length) { wrap.innerHTML = "<div class='hint'>Belum ada assignment relief.</div>"; return; }
  rows.forEach((r) => {
    const d = document.createElement("div");
    d.className = "sug-item";
    const t = document.createElement("div"); t.className = "sug-title"; t.textContent = `${r.day} ${r.time}`;
    const f = document.createElement("div"); f.className = "sug-free"; f.textContent = `Tak hadir: ${r.absent} → Relief: ${r.assignee}`;
    d.appendChild(t); d.appendChild(f);
    wrap.appendChild(d);
  });
}

function renderTeacherLoadSummary() {
  const wrap = document.getElementById("teacherLoadSummary");
  if (!wrap) return;
  wrap.innerHTML = "";
  const counts = {};
  getReliefAssignmentRows(true).forEach((r) => { counts[r.assignee] = (counts[r.assignee] || 0) + 1; });
  const rows = Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  if (!rows.length) { wrap.innerHTML = "<div class='hint'>Belum ada data load relief.</div>"; return; }
  rows.forEach(([name, cnt]) => {
    const d = document.createElement("div"); d.className = "sug-item";
    const t = document.createElement("div"); t.className = "sug-title"; t.textContent = name;
    const f = document.createElement("div"); f.className = "sug-free"; f.textContent = `Jumlah relief hari ini: ${cnt}`;
    d.appendChild(t); d.appendChild(f);
    wrap.appendChild(d);
  });
}

function renderClashWarning() {
  const box = document.getElementById("clashWarning");
  if (!box) return;
  const bySlotTeacher = {};
  let duplicateClashes = 0;
  let scheduleClashes = 0;
  getReliefAssignmentRows(true).forEach((r) => {
    const key = `${r.assignee}|${r.day}|${r.time}`;
    bySlotTeacher[key] = (bySlotTeacher[key] || 0) + 1;
    const ownClass = (guruSchedules[r.assignee] || {})[`${r.day}|${r.time}`];
    if (ownClass) {
      const cls = ownClass.split("|")[1] || "";
      if (!closedClasses.has(cls)) scheduleClashes++;
    }
  });
  Object.values(bySlotTeacher).forEach((n) => { if (n > 1) duplicateClashes++; });
  const total = duplicateClashes + scheduleClashes;
  box.classList.remove("clash-ok", "clash-bad");
  if (!total) {
    box.textContent = "✓ Tiada konflik";
    box.classList.add("clash-ok");
    return;
  }
  const parts = [];
  if (duplicateClashes) parts.push(`${duplicateClashes} double-booked`);
  if (scheduleClashes) parts.push(`${scheduleClashes} ada kelas sendiri`);
  box.textContent = `⚠ ${parts.join(" · ")}`;
  box.classList.add("clash-bad");
}

function renderReliefStats() {
  const wrap = document.getElementById("reliefStats");
  if (!wrap) return;
  wrap.innerHTML = "";
  const teachers = getAllTeachers();
  if (!teachers.length) return;
  const scores = teachers.map((t) => ({ name: t, score: Number(reliefScore[t] || 0) })).sort((a, b) => b.score - a.score);
  const total = scores.reduce((s, r) => s + r.score, 0);
  const max = scores[0]?.score || 0;
  const min = scores[scores.length - 1]?.score || 0;

  const stats = [
    { label: "Jumlah Relief", value: total },
    { label: "Score Tertinggi", value: `${scores[0]?.name || "-"} (${max})` },
    { label: "Score Terendah", value: `${scores[scores.length - 1]?.name || "-"} (${min})` },
    { label: "Purata", value: (total / teachers.length).toFixed(1) }
  ];
  stats.forEach((s) => {
    const card = document.createElement("div"); card.className = "stat-card";
    const n = document.createElement("div"); n.className = "stat-name"; n.textContent = s.label;
    const v = document.createElement("div"); v.className = "stat-value"; v.textContent = s.value;
    card.appendChild(n); card.appendChild(v);
    wrap.appendChild(card);
  });
}

// ─── Tutup Kelas UI ─────────────────────────────────────────
function renderClosedClassesUi() {
  const wrap = document.getElementById("closedClassList");
  if (!wrap) return;
  wrap.innerHTML = "";
  const reliefDay = getReliefDay();
  [...closedClasses].sort().forEach((cls) => {
    const tag = document.createElement("div");
    tag.className = "absent-tag";
    tag.style.background = "#fff3cd";
    tag.style.color = "#856404";
    tag.style.borderColor = "#ffc107";
    const label = document.createElement("span");
    label.textContent = cls;
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "✕";
    removeBtn.style.color = "#856404";
    removeBtn.title = "Buka semula kelas";
    removeBtn.addEventListener("click", () => {
      if (isReliefPlanApproved) return;
      closedClasses.delete(cls);
      renderClosedClassesUi();
      renderReliefUi();
    });
    tag.appendChild(label);
    tag.appendChild(removeBtn);
    wrap.appendChild(tag);
  });

  // Show freed teachers info
  const info = document.getElementById("closedClassInfo");
  if (info) {
    if (closedClasses.size && reliefDay) {
      const freed = getTeachersFreedByClosedClasses(reliefDay);
      info.textContent = freed.size ? `Guru jadi available (${reliefDay}): ${[...freed].sort().join(", ")}` : "Tiada guru tambahan dibebaskan.";
    } else {
      info.textContent = "";
    }
  }
}

function addClosedClass() {
  if (isReliefPlanApproved) return;
  const sel = document.getElementById("closedClassSelect");
  if (!sel || !sel.value) return;
  closedClasses.add(sel.value);
  renderClosedClassesUi();
  renderReliefUi();
  showToast(`Kelas ${sel.value} ditutup.`);
}

function renderClosedClassOptions() {
  const sel = document.getElementById("closedClassSelect");
  if (!sel) return;
  sel.innerHTML = "";
  const opt0 = document.createElement("option");
  opt0.value = "";
  opt0.textContent = "-- Pilih kelas --";
  sel.appendChild(opt0);
  getAllClasses().forEach((cls) => {
    const o = document.createElement("option");
    o.value = cls;
    o.textContent = cls;
    sel.appendChild(o);
  });
}


// ─── Relief Rules Form ───────────────────────────────────────
function renderReliefRulesForm() {
  const maxEl = document.getElementById("maxReliefPerDay");
  const txt = document.getElementById("reliefBlocklist");
  if (!maxEl || !txt) return;
  maxEl.value = String(reliefRules.maxPerDay || 2);
  txt.value = (reliefRules.blocklist || []).join("\n");
  const dutyEl = document.getElementById("includeDutyRule");
  if (dutyEl) dutyEl.checked = reliefRules.includeDutyRule !== false;
  const breakEl = document.getElementById("strictBreakRule");
  if (breakEl) breakEl.checked = reliefRules.strictBreakRule !== false;
  const sel = document.getElementById("blockTimeSelect");
  if (sel) {
    sel.innerHTML = "";
    TIMES.forEach((t) => { const o = document.createElement("option"); o.value = t; o.textContent = t; sel.appendChild(o); });
  }
}

// ─── WhatsApp Message ────────────────────────────────────────
function parseAbsentReasonBox() {
  const box = document.getElementById("absentReasonBox");
  if (!box) return;
  const out = {};
  (box.value || "").split(/\r?\n/).map((x) => x.trim()).filter(Boolean).forEach((line) => {
    const idx = line.indexOf("|");
    if (idx < 0) return;
    const name = line.slice(0, idx).trim().toUpperCase();
    const reason = line.slice(idx + 1).trim();
    if (name && reason) out[name] = reason;
  });
  absentReasons = out;
  saveAbsentReasons();
}

function renderAbsentReasonBox() {
  const box = document.getElementById("absentReasonBox");
  if (!box) return;
  box.value = Object.entries(absentReasons).map(([k, v]) => `${k}|${v}`).join("\n");
}

function generateWaMessage() {
  parseAbsentReasonBox();
  const rows = getReliefAssignmentRows(true);
  const date = currentReliefDate || todayIso();
  const dateObj = new Date(`${date}T00:00:00`);
  const dayMap = ["AHAD", "ISNIN", "SELASA", "RABU", "KHAMIS", "JUMAAT", "SABTU"];
  const dayName = dayMap[dateObj.getDay()];
  const months = ["Jan","Feb","Mac","Apr","Mei","Jun","Jul","Ogo","Sep","Okt","Nov","Dis"];
  const prettyDate = `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
  const lines = [`${prettyDate} (${dayName})`, ``, `*Relief Hari Ini*`, ``];

  let absentSet = getAbsentTeachersForCurrentDate().filter((name) => rows.some((r) => r.absent === name));
  if (!absentSet.length) absentSet = [...new Set(rows.map((r) => r.absent))];
  absentSet.forEach((name) => {
    const reason = absentReasons[name.toUpperCase()] || "TIADA MAKLUMAT";
    lines.push(`☑️ ${name} - ${reason}`);
    rows.filter((r) => r.absent === name).forEach((r) => {
      const slot = (guruSchedules[name] || {})[`${r.day}|${r.time}`] || "";
      let subject = "-", cls = "-";
      if (slot.includes("|")) { const [s, c] = slot.split("|"); subject = s; cls = c; }
      const [t1, t2] = r.time.split("-");
      const fmt = (x) => x.replace(":", ".");
      lines.push(`   ${cls} ${fmt(t1)}-${fmt(t2)} ${subject} → ${r.assignee}`);
    });
    lines.push("");
  });
  if (!rows.length) lines.push("Tiada assignment.");
  const el = document.getElementById("waMessageBox");
  if (el) el.value = lines.join("\n");
  showToast("Mesej WhatsApp dijana.");
}

async function copyWaMessage() {
  const el = document.getElementById("waMessageBox");
  if (!el) return;
  try { await navigator.clipboard.writeText(el.value || ""); }
  catch { el.select(); document.execCommand("copy"); }
  showToast("Mesej dicopy ke clipboard.");
}

// ─── Export PDF ──────────────────────────────────────────────
function exportReliefPlanPdf() {
  const rows = getReliefAssignmentRows(true);
  const date = currentReliefDate || todayIso();
  const htmlRows = rows.map((r) => `<tr><td>${esc(r.day)}</td><td>${esc(r.time)}</td><td>${esc(r.absent)}</td><td>${esc(r.assignee)}</td></tr>`).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Relief ${esc(date)}</title>
    <style>body{font-family:Segoe UI,sans-serif;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #888;padding:8px;text-align:left}h2{margin:0 0 10px}</style>
    </head><body><h2>Pelan Relief Harian - ${esc(date)}</h2>
    <table><thead><tr><th>Hari</th><th>Masa</th><th>Cikgu Tak Hadir</th><th>Cikgu Relief</th></tr></thead><tbody>${htmlRows || "<tr><td colspan='4'>Tiada assignment</td></tr>"}</tbody></table>
    <script>window.onload=()=>window.print()<\/script></body></html>`;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.open(); w.document.write(html); w.document.close();
}


// ─── Bertugas Table (Dynamic Week) ──────────────────────────
function bertugasNameCell(day, row) {
  const key = `${day}|${row}`;
  const val = bertugasMap[key] || "";
  return bertugasEditMode ? { editKey: key, text: val } : { text: val || "-" };
}

function bertugasFooterCell(rowLabel) {
  const key = `ALL|${rowLabel}`;
  const val = bertugasMap[key] || "";
  const base = { colspan: 3, className: "bold-center" };
  return bertugasEditMode ? { ...base, editKey: key, text: val } : { ...base, text: val || "-" };
}

function setBertugasEditMode(on) {
  bertugasEditMode = on;
  const btn = document.getElementById("bertugasEditToggle");
  const saveBar = document.getElementById("bertugasSaveBar");
  if (btn) {
    btn.classList.toggle("active", on);
    btn.setAttribute("aria-pressed", String(on));
    btn.textContent = on ? "Tutup Edit" : "Edit Nama";
  }
  if (saveBar) saveBar.classList.toggle("bertugas-view-hidden", !on);
  if (on) setBertugasViewMode("digital");
  buildBertugasTable();
}

function saveBertugasInline(syncCloud = false) {
  document.querySelectorAll("#bertugasTable .bertugas-cell-input").forEach((input) => {
    const { text, hadPair } = sanitizeSingleTeacherName(input.value);
    if (hadPair) input.value = text;
    if (text) bertugasMap[input.dataset.bkey] = text.toUpperCase();
    else delete bertugasMap[input.dataset.bkey];
  });
  if (getBertugasConfig().kumpulan === "B") {
    for (const day of DAYS) splitPairToSecondRow(bertugasMap, day, "PONDOK PENGAWAL 1", "PONDOK PENGAWAL 2");
  }
  saveBertugasMap();
  buildBertugasEditor();
  if (syncCloud) publishBertugasCloud({ silent: true });
  showToast(syncCloud ? "Nama disimpan & disync ke cloud." : "Nama guru disimpan.");
}

function createBertugasTableBuilder(table) {
  table.innerHTML = "";
  table.classList.add("bertugas-layout");
  if (bertugasEditMode) table.classList.add("bertugas-editing");
  else table.classList.remove("bertugas-editing");
  const dayHeader = [{ text: "", className: "small-head" }, ...DAYS.map((d) => ({ text: d, className: "small-head" }))];
  const addRow = (cells, isHeader = false, rowClass = "") => {
    const tr = document.createElement("tr");
    if (rowClass) tr.className = rowClass;
    cells.forEach((cell) => {
      const el = document.createElement(isHeader || cell.header ? "th" : "td");
      if (cell.editKey) {
        const input = document.createElement("input");
        input.type = "text";
        input.className = "bertugas-cell-input";
        input.value = bertugasMap[cell.editKey] || "";
        input.dataset.bkey = cell.editKey;
        input.placeholder = "Satu nama";
        input.setAttribute("aria-label", cell.editKey.replace("|", " "));
        el.appendChild(input);
      } else {
        el.textContent = cell.text || "";
      }
      if (cell.colspan) el.colSpan = cell.colspan;
      if (cell.className) el.className = cell.className;
      tr.appendChild(el);
    });
    table.appendChild(tr);
  };
  return { addRow, dayHeader };
}

function buildBertugasTableD() {
  const table = document.getElementById("bertugasTable");
  const { addRow, dayHeader } = createBertugasTableBuilder(table);
  const week = getWeekDates(bertugasWeekDate);
  const weekLabel = bertugasMeta.weekText || `TARIKH BERTUGAS: ${week.start} HINGGA ${week.end} (ISNIN HINGGA JUMAAT)`;

  addRow([{ text: "JADUAL BERTUGAS", colspan: 6, className: "section-title" }], true);
  addRow([{ text: "KUMPULAN D", colspan: 6, className: "section-title" }], true);
  addRow([{ text: weekLabel, colspan: 6, className: "meta-row" }], true);
  addRow([{ text: "* PAGAR WAKTU DATANG (MURID)", colspan: 6, className: "section-head" }], true);
  addRow([{ text: "PAGAR (12.20 TENGAH HARI)", colspan: 6, className: "section-head" }], true);
  addRow(dayHeader, true);
  addRow([{ text: "", className: "small-head" }, ...DAYS.map((d) => bertugasNameCell(d, "PAGAR WAKTU DATANG (MURID)"))], false, "names-row");
  addRow([{ text: "KETUA BERTUGAS DI DEWAN (12.30 TENGAH HARI)", colspan: 6, className: "section-head" }], true);
  addRow(dayHeader, true);
  addRow([{ text: "", className: "small-head" }, ...DAYS.map((d) => bertugasNameCell(d, "KETUA BERTUGAS DI DEWAN (12.30 TENGAH HARI)"))], false, "names-row");
  addRow([{ text: "WAKTU REHAT", colspan: 6, className: "section-head" }], true);
  addRow(dayHeader, true);
  addRow([{ text: "3.00-3.30", className: "small-head" }, ...DAYS.map((d) => bertugasNameCell(d, "WAKTU REHAT (3.00-3.30)"))]);
  addRow([{ text: "3.30-4.00", className: "small-head" }, ...DAYS.map((d) => bertugasNameCell(d, "WAKTU REHAT (3.30-4.00)"))]);
  addRow([{ text: "WAKTU BALIK (6.30 PETANG)", colspan: 6, className: "section-head" }], true);
  addRow([{ text: "*KAWALAN PERGERAKAN MURID KELUAR PAGAR", colspan: 3, className: "section-subhead" }, { text: "*LALUAN", colspan: 3, className: "section-subhead" }], true);
  addRow([{ text: "SEMUA GURU BERTUGAS", colspan: 3, className: "bold-center" }, { text: "SEMUA GURU BERTUGAS", colspan: 3, className: "bold-center" }], true);
  addRow([{ text: "KAWALAN MURID (sehingga WAKTU BALIK 6.00 PETANG)", colspan: 6, className: "section-head" }], true);
  addRow(dayHeader, true);
  addRow([{ text: "", className: "small-head" }, ...DAYS.map((d) => bertugasNameCell(d, "KAWALAN MURID (6.00 PETANG)"))], false, "names-row");
  addRow([{ text: "TUGAS KHAS", colspan: 6, className: "section-head" }], true);
  BERTUGAS_FOOTER_ROWS.forEach((rowLabel) => {
    addRow([{ text: rowLabel, colspan: 3, className: "small-head" }, bertugasFooterCell(rowLabel)]);
  });
}

function buildBertugasTableB() {
  const table = document.getElementById("bertugasTable");
  const { addRow, dayHeader } = createBertugasTableBuilder(table);
  const week = getWeekDates(bertugasWeekDate);
  const weekLabel = bertugasMeta.weekText || `TARIKH BERTUGAS: ${week.start} HINGGA ${week.end}`;

  addRow([{ text: "JADUAL BERTUGAS", colspan: 6, className: "section-title" }], true);
  addRow([{ text: "KUMPULAN B", colspan: 6, className: "section-title" }], true);
  addRow([{ text: weekLabel, colspan: 6, className: "meta-row" }], true);

  addRow([{ text: "WAKTU DATANG", colspan: 6, className: "section-head" }], true);
  addRow([{ text: "KAWALAN DI PINTU PAGAR B", colspan: 6, className: "section-subhead" }], true);
  addRow(dayHeader, true);
  addRow([{ text: "", className: "small-head" }, ...DAYS.map((d) => bertugasNameCell(d, "WAKTU DATANG"))], false, "names-row");

  addRow([{ text: "KAWALAN DI DEWAN TERBUKA", colspan: 6, className: "section-head" }], true);
  addRow(dayHeader, true);
  addRow([{ text: "", className: "small-head" }, ...DAYS.map((d) => bertugasNameCell(d, "KAWALAN DI DEWAN TERBUKA"))], false, "names-row");

  addRow([{ text: "KAWALAN DI KANTIN", colspan: 6, className: "section-head" }], true);
  addRow(dayHeader, true);
  addRow([{ text: "3.00-3.30 PTG", className: "small-head" }, ...DAYS.map((d) => bertugasNameCell(d, "KANTIN (3.00-3.30)"))]);
  addRow([{ text: "3.30-4.00 PTG", className: "small-head" }, ...DAYS.map((d) => bertugasNameCell(d, "KANTIN (3.30-4.00)"))]);
  addRow([{ text: "4.00-4.30 (JUMAAT)", className: "small-head" }, ...DAYS.map((d) => (d === "JUMAAT" ? bertugasNameCell(d, "KANTIN (4.00-4.30)") : { text: "-" }))]);

  addRow([{ text: "KAWALAN WAKTU BALIK", colspan: 6, className: "section-head" }], true);
  addRow([{ text: "KAWALAN PERGERAKAN KELUAR PAGAR", colspan: 3, className: "section-subhead" }, { text: "LALUAN MURID", colspan: 3, className: "section-subhead" }], true);
  addRow([{ text: "SEMUA GURU KUMPULAN B", colspan: 3, className: "bold-center" }, { text: "SEMUA GURU KUMPULAN B", colspan: 3, className: "bold-center" }], true);

  addRow([{ text: "KAWALAN DI PONDOK PENGAWAL", colspan: 6, className: "section-head" }], true);
  addRow(dayHeader, true);
  addRow([{ text: "Baris 1", className: "small-head" }, ...DAYS.map((d) => bertugasNameCell(d, "PONDOK PENGAWAL 1"))]);
  addRow([{ text: "Baris 2", className: "small-head" }, ...DAYS.map((d) => bertugasNameCell(d, "PONDOK PENGAWAL 2"))]);

  addRow([{ text: "TUGAS KHAS", colspan: 6, className: "section-head" }], true);
  BERTUGAS_B_FOOTER.forEach((rowLabel) => {
    addRow([{ text: rowLabel, colspan: 3, className: "small-head" }, bertugasFooterCell(rowLabel)]);
  });
}

function buildBertugasTable() {
  if (getBertugasConfig().kumpulan === "B") buildBertugasTableB();
  else buildBertugasTableD();
}

// ─── Editor Tables ───────────────────────────────────────────
function buildEditor() {
  const table = document.getElementById("editorTable");
  table.innerHTML = "";
  const thead = document.createElement("thead");
  thead.appendChild(buildTimeHeaderRow());
  table.appendChild(thead);
  const tbody = document.createElement("tbody");
  for (const day of DAYS) {
    const tr = document.createElement("tr");
    const dayCell = document.createElement("th"); dayCell.className = "day-col"; dayCell.textContent = day;
    tr.appendChild(dayCell);
    for (const time of TIMES) {
      const td = document.createElement("td");
      const input = document.createElement("input");
      input.className = "editor-input";
      input.placeholder = "SN|3 R";
      input.value = scheduleMap[`${day}|${time}`] || "";
      input.dataset.key = `${day}|${time}`;
      input.setAttribute("aria-label", `${day} ${time}`);
      td.appendChild(input);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
}

function buildBertugasEditor() {
  const table = document.getElementById("bertugasEditorTable");
  table.innerHTML = "";
  const thead = document.createElement("thead");
  thead.appendChild(buildBertugasHeaderRow());
  table.appendChild(thead);
  const tbody = document.createElement("tbody");
  const cfg = getBertugasConfig();
  for (const row of cfg.rows) {
    const tr = document.createElement("tr");
    const th = document.createElement("th"); th.className = "day-col"; th.textContent = row;
    tr.appendChild(th);
    for (const day of DAYS) {
      const td = document.createElement("td");
      const input = document.createElement("input");
      input.className = "editor-input";
      input.placeholder = "Satu nama";
      input.value = bertugasMap[`${day}|${row}`] || "";
      input.dataset.bkey = `${day}|${row}`;
      input.setAttribute("aria-label", `${day} ${row}`);
      td.appendChild(input);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  for (const row of cfg.footer) {
    const tr = document.createElement("tr");
    const th = document.createElement("th"); th.className = "day-col"; th.textContent = row;
    tr.appendChild(th);
    const td = document.createElement("td");
    td.colSpan = DAYS.length;
    const input = document.createElement("input");
    input.className = "editor-input";
    input.placeholder = "Nama guru";
    input.value = bertugasMap[`ALL|${row}`] || "";
    input.dataset.bkey = `ALL|${row}`;
    input.setAttribute("aria-label", row);
    td.appendChild(input);
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
}

function saveFromEditor() {
  const nextMap = {};
  document.querySelectorAll(".editor-input[data-key]").forEach((input) => {
    const val = input.value.trim().toUpperCase();
    if (val) nextMap[input.dataset.key] = val;
  });
  scheduleMap = nextMap;
  saveScheduleMap();
  buildMainTable();
  showToast("Jadual waktu dah publish.");
}

function saveBertugasFromEditor() {
  const next = {};
  document.querySelectorAll(".editor-input[data-bkey]").forEach((input) => {
    const { text } = sanitizeSingleTeacherName(input.value);
    if (text) next[input.dataset.bkey] = text.toUpperCase();
  });
  if (getBertugasConfig().kumpulan === "B") {
    for (const day of DAYS) splitPairToSecondRow(next, day, "PONDOK PENGAWAL 1", "PONDOK PENGAWAL 2");
  }
  bertugasMap = next;
  saveBertugasMap();
  buildBertugasTable();
  publishBertugasCloud({ silent: true });
  showToast("Jadual bertugas dah publish.");
}


// ─── File Upload Handlers ────────────────────────────────────
function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function compressDataUrl(dataUrl, maxWidth = 1600, quality = 0.82) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      if (scale === 1 && dataUrl.length < 900000) { resolve(dataUrl); return; }
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      try { resolve(canvas.toDataURL("image/jpeg", quality)); }
      catch { resolve(dataUrl); }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

async function fileToStoredRef(file) {
  let dataUrl = await toDataUrl(file);
  if (file.type.startsWith("image/")) dataUrl = await compressDataUrl(dataUrl);
  return { name: file.name, type: file.type, dataUrl, uploadedAt: Date.now() };
}

function safeSetLocalStorage(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function loadBertugasFiles() {
  try { return JSON.parse(localStorage.getItem(KEYS.bertugasFiles) || "[]"); }
  catch { return []; }
}

function getBertugasViewMode() {
  const saved = localStorage.getItem(KEYS.bertugasView);
  if (saved === "digital") return "digital";
  if (saved === "ref" || loadBertugasFiles().length) return "ref";
  return "digital";
}

function setBertugasViewMode(mode) {
  const isRef = mode === "ref";
  localStorage.setItem(KEYS.bertugasView, isRef ? "ref" : "digital");
  const digitalWrap = document.getElementById("bertugasDigitalWrap");
  const refWrap = document.getElementById("bertugasRefWrap");
  const digitalBtn = document.getElementById("bertugasViewDigital");
  const refBtn = document.getElementById("bertugasViewRef");
  if (digitalWrap) digitalWrap.classList.toggle("bertugas-view-hidden", isRef);
  if (refWrap) refWrap.classList.toggle("bertugas-view-hidden", !isRef);
  if (digitalBtn) {
    digitalBtn.classList.toggle("active", !isRef);
    digitalBtn.setAttribute("aria-pressed", String(!isRef));
  }
  if (refBtn) {
    refBtn.classList.toggle("active", isRef);
    refBtn.setAttribute("aria-pressed", String(isRef));
  }
  if (isRef) {
    if (bertugasEditMode) setBertugasEditMode(false);
    renderBertugasReference();
  }
}

function renderBertugasReference() {
  const viewer = document.getElementById("bertugasRefViewer");
  const empty = document.getElementById("bertugasRefEmpty");
  if (!viewer) return;
  const list = loadBertugasFiles();
  viewer.replaceChildren();
  if (!list.length) {
    if (empty) empty.classList.remove("bertugas-ref-empty-hidden");
    return;
  }
  if (empty) empty.classList.add("bertugas-ref-empty-hidden");
  list.forEach((item, idx) => {
    const block = document.createElement("figure");
    block.className = "ref-image-block";
    const cap = document.createElement("figcaption");
    cap.className = "ref-image-caption";
    cap.textContent = item.name || `Fail ${idx + 1}`;
    block.appendChild(cap);
    if ((item.type || "").includes("pdf")) {
      const embed = document.createElement("embed");
      embed.className = "ref-pdf";
      embed.src = item.dataUrl;
      embed.type = "application/pdf";
      embed.setAttribute("aria-label", item.name || "PDF jadual bertugas");
      block.appendChild(embed);
    } else {
      const img = document.createElement("img");
      img.className = "ref-image";
      img.src = item.dataUrl;
      img.alt = item.name || "Jadual bertugas rujukan";
      img.loading = idx === 0 ? "eager" : "lazy";
      block.appendChild(img);
    }
    viewer.appendChild(block);
  });
}

function renderUploadInfo() {
  const jadualInfo = document.getElementById("jadualUploadInfo");
  const one = JSON.parse(localStorage.getItem(KEYS.jadualFile) || "null");
  setText(jadualInfo, one ? `Rujukan terakhir: ${one.name}` : "Belum ada fail rujukan jadual waktu.");
  const list = loadBertugasFiles();
  const names = list.map((f) => f.name).filter(Boolean).join(", ");
  setText(
    document.getElementById("bertugasUploadInfo"),
    list.length ? `${list.length} fail rujukan disimpan${names ? `: ${names}` : ""}. Lihat di tab Jadual Bertugas → Gambar Rujukan.` : "Belum ada fail rujukan bertugas."
  );
}

async function handleUploadJadual(e) {
  const file = e.target.files[0];
  if (!file) return;
  const ref = await fileToStoredRef(file);
  const payload = JSON.stringify({ name: ref.name, type: ref.type, dataUrl: ref.dataUrl });
  if (!safeSetLocalStorage(KEYS.jadualFile, payload)) {
    showToast("Gagal simpan — fail terlalu besar. Cuba compress atau guna fail lebih kecil.");
    return;
  }
  renderUploadInfo();
  showToast("Fail rujukan jadual diupload.");
}

function getGroqApiKey() {
  return localStorage.getItem(KEYS.groqApiKey) || "";
}

function isAutoParseBertugasEnabled() {
  const saved = localStorage.getItem(KEYS.autoParseBertugas);
  return saved !== "0";
}

function renderGroqKeyStatus() {
  const el = document.getElementById("groqKeyStatus");
  const input = document.getElementById("groqApiKeyInput");
  const key = getGroqApiKey();
  if (input && !input.value && key) input.value = key;
  setText(el, key ? "API key disimpan." : "Belum set API key.");
}

function saveGroqApiKey() {
  const input = document.getElementById("groqApiKeyInput");
  const key = (input?.value || "").trim();
  if (!key) {
    showToast("Masukkan Groq API key dulu.");
    return;
  }
  localStorage.setItem(KEYS.groqApiKey, key);
  renderGroqKeyStatus();
  showToast("Groq API key disimpan.");
}

async function compressForGroq(dataUrl) {
  let url = await compressDataUrl(dataUrl, 1500, 0.88);
  if (url.length < 3_400_000) return url;
  for (const q of [0.75, 0.6, 0.45]) {
    url = await compressDataUrl(url, 1300, q);
    if (url.length < 3_400_000) return url;
  }
  return url;
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function fuzzyMatchTeacher(raw) {
  const clean = String(raw || "").replace(/[^A-Za-z\s/]/g, " ").replace(/\s+/g, " ").trim().toUpperCase();
  if (!clean) return { name: "", matched: true };
  const teachers = getAllTeachers();
  if (teachers.includes(clean)) return { name: clean, matched: true };

  let best = null;
  let bestScore = 99;
  for (const t of teachers) {
    const dist = levenshtein(clean, t);
    const first = t.split(/\s+/)[0];
    const firstDist = levenshtein(clean, first);
    const score = Math.min(dist, firstDist + 1);
    if (score < bestScore) {
      bestScore = score;
      best = t;
    }
    if (clean.includes(first) || first.includes(clean)) {
      return { name: t, matched: true };
    }
  }
  if (best && bestScore <= 3) return { name: best, matched: true };
  return { name: clean, matched: false };
}

function sanitizeSingleTeacherName(val) {
  const raw = String(val || "").replace(/\(K\)/gi, "").trim();
  if (!raw) return { text: "", hadPair: false };
  const parts = raw.split(/\s*\/\s*/).map((p) => p.trim()).filter(Boolean);
  return { text: parts[0] || "", hadPair: parts.length > 1 };
}

function normalizeTeacherField(val) {
  const { text: single, hadPair } = sanitizeSingleTeacherName(val);
  if (!single) return { text: "", matched: true, hadPair: false };
  const m = fuzzyMatchTeacher(single);
  return { text: m.name, matched: m.matched, hadPair };
}

function splitPairToSecondRow(assignments, day, row1, row2) {
  const k1 = `${day}|${row1}`;
  const k2 = `${day}|${row2}`;
  const raw = assignments[k1];
  if (!raw || !String(raw).includes("/")) return;
  const parts = String(raw).split(/\s*\/\s*/).map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return;
  assignments[k1] = parts[0].toUpperCase();
  if (parts[1] && !assignments[k2]) assignments[k2] = parts[1].toUpperCase();
}

function cleanupBertugasMapPairs() {
  let changed = false;
  for (const [k, v] of Object.entries({ ...bertugasMap })) {
    const s = sanitizeSingleTeacherName(v);
    const next = s.text ? s.text.toUpperCase() : "";
    if (!next) { delete bertugasMap[k]; changed = true; continue; }
    if (next !== v) { bertugasMap[k] = next; changed = true; }
  }
  if (getBertugasConfig().kumpulan === "B") {
    const before = JSON.stringify(bertugasMap);
    for (const day of DAYS) splitPairToSecondRow(bertugasMap, day, "PONDOK PENGAWAL 1", "PONDOK PENGAWAL 2");
    if (JSON.stringify(bertugasMap) !== before) changed = true;
  }
  if (changed) saveBertugasMap();
}

function getTeacherNameList() {
  return Object.keys(guruSchedules || {}).sort();
}

function normalizeBertugasRow(rowRaw, kumpulan) {
  const row = String(rowRaw || "").trim().toUpperCase().replace(/\(K\)/g, "").trim();
  if (BERTUGAS_ROW_ALIASES[row]) return BERTUGAS_ROW_ALIASES[row];
  const cfg = getBertugasConfig(kumpulan);
  const hit = cfg.rows.find((r) => row.includes(r) || r.includes(row));
  if (hit) return hit;
  const footer = cfg.footer.find((r) => row.includes(r) || r.includes(row));
  return footer || null;
}

function normalizeBertugasKey(key, kumpulan) {
  if (!key || typeof key !== "string") return null;
  const parts = key.split("|");
  if (parts.length !== 2) return null;
  const day = parts[0].trim().toUpperCase();
  const row = normalizeBertugasRow(parts[1], kumpulan);
  if (!row) return null;
  const cfg = getBertugasConfig(kumpulan);
  if (day === "ALL" && cfg.footer.includes(row)) return `ALL|${row}`;
  if (!DAYS.includes(day)) return null;
  if (cfg.rows.includes(row)) return `${day}|${row}`;
  return null;
}

function postProcessAiAssignments(assignments, kumpulan) {
  const out = { ...assignments };
  if (getBertugasConfig(kumpulan).kumpulan !== "D") return out;
  for (const day of DAYS) {
    const k1 = `${day}|PAGAR WAKTU DATANG (MURID)`;
    const k2 = `${day}|PAGAR (12.20 TENGAH HARI)`;
    if (out[k1] && !out[k2]) out[k2] = out[k1];
    if (out[k2] && !out[k1]) out[k1] = out[k2];
  }
  return out;
}

function processAiParseResult(parsed) {
  const kumpulan = (parsed?.kumpulan || bertugasMeta.kumpulan || "B").toUpperCase();
  const uncertain = new Set((parsed?.uncertain || []).map((k) => normalizeBertugasKey(k, kumpulan)).filter(Boolean));
  const keyedRaw = {};
  for (const [rawKey, rawVal] of Object.entries(parsed?.assignments || {})) {
    const key = normalizeBertugasKey(rawKey, kumpulan);
    if (key) keyedRaw[key] = rawVal;
  }
  if (kumpulan === "B") {
    for (const day of DAYS) splitPairToSecondRow(keyedRaw, day, "PONDOK PENGAWAL 1", "PONDOK PENGAWAL 2");
  }
  const normalized = {};
  const reviewRows = [];

  for (const [key, rawVal] of Object.entries(keyedRaw)) {
    const norm = normalizeTeacherField(rawVal);
    if (!norm.text) continue;
    normalized[key] = norm.text;
    reviewRows.push({
      key,
      label: key.replace("|", " — "),
      raw: String(rawVal || "").replace(/\(K\)/gi, "").trim().toUpperCase(),
      value: norm.text,
      warn: uncertain.has(key) || !norm.matched || norm.hadPair
    });
  }

  const assignments = postProcessAiAssignments(normalized, kumpulan);
  reviewRows.sort((a, b) => a.key.localeCompare(b.key));
  const warnCount = reviewRows.filter((r) => r.warn).length;
  return {
    assignments,
    reviewRows,
    warnCount,
    weekStart: parsed?.weekStart || "",
    weekText: parsed?.weekText || "",
    kumpulan
  };
}

function showAiReviewModal(processed) {
  pendingAiParse = processed;
  const modal = document.getElementById("aiReviewModal");
  const list = document.getElementById("aiReviewList");
  const summary = document.getElementById("aiReviewSummary");
  if (!modal || !list) return;

  setText(summary, `${processed.reviewRows.length} slot dibaca — ${processed.warnCount} perlu semak (⚠).`);
  list.replaceChildren();
  for (const row of processed.reviewRows) {
    const div = document.createElement("div");
    div.className = `ai-review-row${row.warn ? " warn" : ""}`;
    const slot = document.createElement("div");
    slot.className = "ai-review-slot";
    slot.textContent = `${row.warn ? "⚠ " : ""}${row.label}`;
    const name = document.createElement("div");
    name.className = "ai-review-name";
    name.textContent = row.raw !== row.value ? `${row.value} (asal: ${row.raw})` : row.value;
    div.appendChild(slot);
    div.appendChild(name);
    list.appendChild(div);
  }
  modal.classList.remove("hidden");
}

function closeAiReviewModal() {
  document.getElementById("aiReviewModal")?.classList.add("hidden");
  pendingAiParse = null;
}

function confirmAiReviewApply() {
  if (!pendingAiParse) return;
  const count = applyParsedBertugas({
    assignments: pendingAiParse.assignments,
    weekStart: pendingAiParse.weekStart,
    weekText: pendingAiParse.weekText,
    kumpulan: pendingAiParse.kumpulan
  });
  closeAiReviewModal();
  setBertugasViewMode("digital");
  activateTab("bertugas");
  setAiParseStatus(`${count} slot digunakan.`);
  showToast(`AI digunakan — ${count} slot. Semak di Admin jika masih ada salah.`);
}

function applyParsedBertugas(parsed) {
  const assignments = parsed?.assignments || {};
  bertugasMap = {};
  let count = 0;
  for (const [key, val] of Object.entries(assignments)) {
    const text = String(val || "").trim().toUpperCase();
    if (text) {
      bertugasMap[key] = text;
      count++;
    }
  }
  if (parsed?.kumpulan) {
    bertugasMeta.kumpulan = String(parsed.kumpulan).toUpperCase();
  }
  if (parsed?.weekText) bertugasMeta.weekText = parsed.weekText;
  if (parsed?.weekStart) {
    const d = new Date(parsed.weekStart);
    if (!Number.isNaN(d.getTime())) {
      bertugasWeekDate = d.toISOString().slice(0, 10);
      localStorage.setItem(KEYS.bertugasWeek, bertugasWeekDate);
      const weekInput = document.getElementById("bertugasWeekInput");
      if (weekInput) weekInput.value = bertugasWeekDate;
    }
  }
  saveBertugasMeta();
  saveBertugasMap();
  buildBertugasTable();
  buildBertugasEditor();
  publishBertugasCloud({ silent: true });
  return count;
}

function applyCloudBertugas(payload, opts = {}) {
  const { force = false } = opts;
  if (!payload?.bertugasMap || typeof payload.bertugasMap !== "object") return false;
  if (!Object.keys(payload.bertugasMap).length) return false;
  const localAt = localStorage.getItem(KEYS.bertugasCloudAt) || "";
  const cloudAt = payload.updatedAt || "";
  if (!force && localAt && cloudAt && new Date(localAt) >= new Date(cloudAt)) return false;

  bertugasMap = { ...payload.bertugasMap };
  saveBertugasMap();
  if (payload.meta) {
    bertugasMeta = { ...bertugasMeta, ...payload.meta };
    saveBertugasMeta();
  }
  if (payload.week) {
    bertugasWeekDate = payload.week;
    localStorage.setItem(KEYS.bertugasWeek, bertugasWeekDate);
  }
  if (Array.isArray(payload.referenceImages) && payload.referenceImages.length) {
    safeSetLocalStorage(KEYS.bertugasFiles, JSON.stringify(payload.referenceImages));
  }
  if (cloudAt) localStorage.setItem(KEYS.bertugasCloudAt, cloudAt);
  return true;
}

function renderBertugasSyncStatus(text) {
  const el = document.getElementById("bertugasSyncStatus");
  if (el) el.textContent = text || "";
}

async function fetchCloudBertugas() {
  try {
    const res = await fetch(`${BERTUGAS_CLOUD_GET}?v=${Date.now()}`, { cache: "no-store" });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return { data: null, error: data?.error || `Ralat ${res.status}` };
    }
    if (data?.error) return { data: null, error: data.error };
    if (!data?.bertugasMap || !data.updatedAt || !Object.keys(data.bertugasMap).length) {
      return { data: null, error: null };
    }
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || "Gagal sambung cloud" };
  }
}

async function pullBertugasFromCloud(opts = {}) {
  const { force = true, silent = false } = opts;
  if (!silent) renderBertugasSyncStatus("Memuat dari cloud...");
  const { data, error } = await fetchCloudBertugas();
  if (error) {
    renderBertugasSyncStatus(`Cloud gagal: ${error}`);
    if (!silent) showToast(`Gagal muat cloud: ${error}`);
    return false;
  }
  if (!data) {
    renderBertugasSyncStatus("Cloud kosong — admin perlu Simpan ke Cloud dulu");
    if (!silent) showToast("Tiada jadual dalam cloud. Simpan dari phone/PC admin dulu.");
    return false;
  }
  if (!applyCloudBertugas(data, { force })) {
    const cloudAt = data.updatedAt ? new Date(data.updatedAt).toLocaleString("ms-MY") : "";
    renderBertugasSyncStatus(cloudAt ? `PC sudah sama/baru (${cloudAt})` : "Tiada perubahan dari cloud");
    if (!silent) showToast("Data PC sudah sama atau lebih baru dari cloud.");
    return false;
  }
  buildBertugasTable();
  buildBertugasEditor();
  renderUploadInfo();
  const cloudAt = data.updatedAt ? new Date(data.updatedAt).toLocaleString("ms-MY") : "";
  renderBertugasSyncStatus(cloudAt ? `Dimuat dari cloud: ${cloudAt}` : "Dimuat dari cloud");
  if (!silent) showToast("Jadual bertugas dimuat dari cloud.");
  return true;
}

async function publishBertugasCloud(opts = {}) {
  const { silent = false } = opts;
  const refs = loadBertugasFiles();
  const referenceImages = refs.slice(0, 1);
  try {
    if (!silent) renderBertugasSyncStatus("Menyimpan ke cloud...");
    const res = await fetch(BERTUGAS_CLOUD_PUBLISH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bertugasMap,
        week: bertugasWeekDate,
        meta: bertugasMeta,
        referenceImages
      })
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || `Ralat ${res.status}`);
    if (body.updatedAt) localStorage.setItem(KEYS.bertugasCloudAt, body.updatedAt);
    const when = body.updatedAt ? new Date(body.updatedAt).toLocaleString("ms-MY") : "";
    renderBertugasSyncStatus(when ? `Cloud sync: ${when}` : "Cloud sync OK");
    if (!silent) showToast("Jadual bertugas disimpan ke cloud. Phone lain akan auto dapat.");
    return true;
  } catch (err) {
    renderBertugasSyncStatus("Cloud sync gagal");
    if (!silent) showToast(`Cloud sync gagal: ${err.message}`);
    return false;
  }
}

function renderReliefSyncStatus(text) {
  const el = document.getElementById("reliefSyncStatus");
  if (el) el.textContent = text || "";
}

function applyCloudRelief(payload, opts = {}) {
  const { force = false } = opts;
  if (!payload?.reliefPlans || typeof payload.reliefPlans !== "object") return false;
  if (!payload.updatedAt) return false;
  const localAt = localStorage.getItem(KEYS.reliefCloudAt) || "";
  const cloudAt = payload.updatedAt || "";
  if (!force && localAt && cloudAt && new Date(localAt) >= new Date(cloudAt)) return false;

  reliefPlans = { ...payload.reliefPlans };
  saveReliefPlans();
  Object.keys(reliefScore).forEach((k) => delete reliefScore[k]);
  Object.assign(reliefScore, payload.reliefScore || {});
  saveReliefScore();
  if (cloudAt) localStorage.setItem(KEYS.reliefCloudAt, cloudAt);

  if (currentReliefDate && reliefPlans[currentReliefDate]) {
    applyPlanPayload(reliefPlans[currentReliefDate]);
  } else if (currentReliefDate) {
    reliefAssignments = {};
    absentTeachers.clear();
    closedClasses = new Set();
    isReliefPlanApproved = false;
    setReliefStatus("Status: Draft (Plan baru)");
  }
  return true;
}

async function fetchCloudRelief() {
  try {
    const res = await fetch(`${RELIEF_CLOUD_GET}?v=${Date.now()}`, { cache: "no-store" });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { data: null, error: data?.error || `Ralat ${res.status}` };
    if (data?.error) return { data: null, error: data.error };
    if (!data?.reliefPlans || !data.updatedAt) return { data: null, error: null };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || "Gagal sambung cloud" };
  }
}

async function pullReliefFromCloud(opts = {}) {
  const { force = true, silent = false } = opts;
  if (!silent) renderReliefSyncStatus("Memuat relief dari cloud...");
  const { data, error } = await fetchCloudRelief();
  if (error) {
    renderReliefSyncStatus(`Cloud gagal: ${error}`);
    if (!silent) showToast(`Gagal muat relief cloud: ${error}`);
    return false;
  }
  if (!data) {
    renderReliefSyncStatus("Cloud kosong — Simpan Relief ke Cloud dulu");
    if (!silent) showToast("Tiada plan relief dalam cloud.");
    return false;
  }
  if (!applyCloudRelief(data, { force })) {
    const cloudAt = data.updatedAt ? new Date(data.updatedAt).toLocaleString("ms-MY") : "";
    renderReliefSyncStatus(cloudAt ? `PC sudah sama/baru (${cloudAt})` : "Tiada perubahan");
    if (!silent) showToast("Relief PC sudah sama atau lebih baru dari cloud.");
    return false;
  }
  renderReliefUi();
  const cloudAt = data.updatedAt ? new Date(data.updatedAt).toLocaleString("ms-MY") : "";
  renderReliefSyncStatus(cloudAt ? `Dimuat dari cloud: ${cloudAt}` : "Dimuat dari cloud");
  if (!silent) showToast("Plan relief dimuat dari cloud.");
  return true;
}

async function publishReliefCloud(opts = {}) {
  const { silent = false } = opts;
  if (currentReliefDate) reliefPlans[currentReliefDate] = getCurrentPlanPayload();
  try {
    if (!silent) renderReliefSyncStatus("Menyimpan relief ke cloud...");
    const res = await fetch(RELIEF_CLOUD_PUBLISH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reliefPlans, reliefScore })
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || `Ralat ${res.status}`);
    if (body.updatedAt) localStorage.setItem(KEYS.reliefCloudAt, body.updatedAt);
    const when = body.updatedAt ? new Date(body.updatedAt).toLocaleString("ms-MY") : "";
    renderReliefSyncStatus(when ? `Cloud sync: ${when}` : "Cloud sync OK");
    if (!silent) showToast("Plan relief disimpan ke cloud.");
    return true;
  } catch (err) {
    renderReliefSyncStatus("Cloud sync gagal");
    if (!silent) showToast(`Relief cloud gagal: ${err.message}`);
    return false;
  }
}

function setAiParseStatus(text, busy = false) {
  const el = document.getElementById("aiParseStatus");
  if (!el) return;
  el.textContent = text || "";
  el.classList.toggle("busy", busy);
}

async function parseBertugasFromImage(dataUrl) {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    showToast("Set Groq API key di Admin dulu.");
    return false;
  }
  if (!dataUrl || !(dataUrl.startsWith("data:image"))) {
    showToast("AI baca perlukan fail JPEG/PNG.");
    return false;
  }

  setAiParseStatus("AI sedang baca gambar...", true);
  const imageDataUrl = await compressForGroq(dataUrl);

  try {
    const res = await fetch(GROQ_PROXY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey,
        imageDataUrl,
        teacherNames: getTeacherNameList(),
        kumpulan: document.getElementById("bertugasKumpulanSelect")?.value || bertugasMeta.kumpulan || "B"
      })
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || `Ralat ${res.status}`);

    const processed = processAiParseResult(body.data);
    if (!processed.reviewRows.length) {
      setAiParseStatus("");
      showToast("AI tak jumpa nama dalam gambar. Cuba gambar lebih jelas atau isi manual.");
      return false;
    }
    setAiParseStatus(`Semak ${processed.warnCount} slot ⚠`);
    activateTab("bertugas");
    showAiReviewModal(processed);
    showToast("AI selesai baca — semak hasil sebelum guna.");
    return true;
  } catch (err) {
    setAiParseStatus("");
    showToast(`AI gagal: ${err.message}`);
    return false;
  }
}

async function aiParseLatestBertugasImage() {
  const list = loadBertugasFiles();
  const image = list.find((f) => (f.type || "").startsWith("image/") || (f.dataUrl || "").startsWith("data:image"));
  if (!image?.dataUrl) {
    showToast("Upload gambar JPEG dulu.");
    return;
  }
  await parseBertugasFromImage(image.dataUrl);
}

async function processBertugasUpload(files, inputEl) {
  if (!files.length) return false;
  const out = [];
  for (const f of files) out.push(await fileToStoredRef(f));
  const payload = JSON.stringify(out);
  if (!safeSetLocalStorage(KEYS.bertugasFiles, payload)) {
    showToast("Gagal simpan — gambar terlalu besar untuk storan browser. Cuba resize/compress JPEG dahulu.");
    if (inputEl) inputEl.value = "";
    return false;
  }
  renderUploadInfo();
  activateTab("bertugas");
  setBertugasViewMode("ref");
  showToast(`${files.length} gambar jadual bertugas dimuat naik.`);
  publishBertugasCloud({ silent: true });

  const firstImage = out.find((f) => (f.type || "").startsWith("image/"));
  if (firstImage && isAutoParseBertugasEnabled() && getGroqApiKey()) {
    await parseBertugasFromImage(firstImage.dataUrl);
  } else if (firstImage && isAutoParseBertugasEnabled() && !getGroqApiKey()) {
    showToast("Tip: set Groq API key di Admin untuk auto susun jadual dari gambar.");
  }

  if (inputEl) inputEl.value = "";
  return true;
}

async function handleUploadBertugas(e) {
  await processBertugasUpload(Array.from(e.target.files || []), e.target);
}

async function handleUploadGuruJson(e) {
  const file = e.target.files[0];
  if (!file) return;
  if ((absentTeachers.size || Object.keys(reliefAssignments).length) &&
    !confirm("Upload jadual guru baru akan clear senarai tak hadir & assignment relief semasa. Teruskan?")) {
    e.target.value = "";
    return;
  }
  try {
    const txt = await file.text();
    const parsed = JSON.parse(txt);
    if (!parsed || !parsed.teachers || typeof parsed.teachers !== "object") {
      showToast("Format JSON tak sah. Perlukan { teachers: {...} }");
      return;
    }
    guruSchedules = parsed.teachers;
    saveGuruSchedules();
    buildClassSchedules();
    renderGuruOptions();
    renderClassOptions();
    renderClosedClassOptions();
    selectedGuru = "MANUAL";
    localStorage.setItem(KEYS.guruSelected, selectedGuru);
    absentTeachers.clear();
    buildMainTable();
    buildClassTable();
    renderReliefUi();
    showToast(`Import berjaya: ${Object.keys(guruSchedules).length} guru.`);
  } catch (err) {
    showToast("Error parsing JSON: " + err.message);
  }
}

// ─── Export/Import All Data ──────────────────────────────────
function exportAllData() {
  const data = {
    version: "3.0",
    exportDate: todayIso(),
    scheduleMap,
    bertugasMap,
    guruSchedules,
    reliefScore,
    reliefRules,
    reliefPlans,
    absentReasons,
    absentRanges
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `jadual-guru-backup-${todayIso()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Data diexport.");
}

function importAllData(file) {
  if (!file) return;
  file.text().then((txt) => {
    try {
      const data = JSON.parse(txt);
      if (data.scheduleMap) { scheduleMap = data.scheduleMap; saveScheduleMap(); }
      if (data.bertugasMap) { bertugasMap = data.bertugasMap; saveBertugasMap(); }
      if (data.guruSchedules) { guruSchedules = data.guruSchedules; saveGuruSchedules(); }
      if (data.reliefScore) { Object.assign(reliefScore, data.reliefScore); saveReliefScore(); }
      if (data.reliefRules) { reliefRules = data.reliefRules; saveReliefRules(); }
      if (data.reliefPlans) { reliefPlans = data.reliefPlans; saveReliefPlans(); }
      if (data.absentReasons) { absentReasons = data.absentReasons; saveAbsentReasons(); }
      if (data.absentRanges) { absentRanges = data.absentRanges; saveAbsentRanges(); }
      // Rebuild everything
      buildClassSchedules();
      renderGuruOptions();
      renderClassOptions();
      renderReliefRulesForm();
      renderAbsentReasonBox();
      buildMainTable();
      buildClassTable();
      buildBertugasTable();
      buildEditor();
      buildBertugasEditor();
      renderReliefUi();
      showToast("Data diimport berjaya.");
    } catch (err) {
      showToast("Error import: " + err.message);
    }
  });
}


// ─── Initialization ──────────────────────────────────────────
function init() {
  // Tab navigation
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.addEventListener("click", () => activateTab(btn.dataset.tab)));

  // Clear relief
  document.getElementById("clearReliefBtn").addEventListener("click", () => {
    if (isReliefPlanApproved) return;
    [...reliefSet].forEach((k) => { if (k.startsWith(`${selectedGuru}::`)) reliefSet.delete(k); });
    if (selectedGuru === "MANUAL") DAYS.forEach((d) => TIMES.forEach((_, i) => reliefSet.delete(`${d}|${i}`)));
    saveRelief();
    buildMainTable();
    showToast("Relief direset.");
  });

  // Editor save
  document.getElementById("saveJadualBtn").addEventListener("click", saveFromEditor);
  document.getElementById("saveBertugasBtn").addEventListener("click", saveBertugasFromEditor);

  // File uploads
  document.getElementById("uploadJadual").addEventListener("change", handleUploadJadual);
  document.getElementById("uploadBertugas").addEventListener("change", handleUploadBertugas);
  const uploadBertugasTab = document.getElementById("uploadBertugasTab");
  if (uploadBertugasTab) uploadBertugasTab.addEventListener("change", handleUploadBertugas);
  document.getElementById("uploadGuruJson").addEventListener("change", handleUploadGuruJson);

  const saveGroqKeyBtn = document.getElementById("saveGroqKeyBtn");
  if (saveGroqKeyBtn) saveGroqKeyBtn.addEventListener("click", saveGroqApiKey);
  const autoParseBox = document.getElementById("autoParseBertugas");
  if (autoParseBox) {
    autoParseBox.checked = isAutoParseBertugasEnabled();
    autoParseBox.addEventListener("change", (e) => {
      localStorage.setItem(KEYS.autoParseBertugas, e.target.checked ? "1" : "0");
    });
  }
  const kumpulanSelect = document.getElementById("bertugasKumpulanSelect");
  if (kumpulanSelect) {
    kumpulanSelect.value = bertugasMeta.kumpulan || "B";
    kumpulanSelect.addEventListener("change", (e) => {
      bertugasMeta.kumpulan = e.target.value;
      saveBertugasMeta();
      buildBertugasTable();
      buildBertugasEditor();
      showToast(`Format jadual: Kumpulan ${e.target.value}`);
    });
  }
  const aiParseBtn = document.getElementById("aiParseBertugasBtn");
  if (aiParseBtn) aiParseBtn.addEventListener("click", aiParseLatestBertugasImage);
  const syncCloudBtn = document.getElementById("syncBertugasCloudBtn");
  if (syncCloudBtn) syncCloudBtn.addEventListener("click", () => publishBertugasCloud());
  const pullCloudBtn = document.getElementById("pullBertugasCloudBtn");
  if (pullCloudBtn) pullCloudBtn.addEventListener("click", () => pullBertugasFromCloud());
  const pullCloudAdminBtn = document.getElementById("pullBertugasCloudAdminBtn");
  if (pullCloudAdminBtn) pullCloudAdminBtn.addEventListener("click", () => pullBertugasFromCloud());

  // Available slot select
  document.getElementById("availableSlotSelect").addEventListener("change", (e) => {
    focusSlotKey = e.target.value;
    renderAvailableTeachers();
  });

  // Relief rules
  document.getElementById("saveReliefRulesBtn").addEventListener("click", () => {
    if (isReliefPlanApproved) return;
    const maxPerDay = Math.max(1, Number(document.getElementById("maxReliefPerDay").value || 2));
    const blocklist = (document.getElementById("reliefBlocklist").value || "").split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
    const includeDutyRule = document.getElementById("includeDutyRule").checked;
    const strictBreakRule = document.getElementById("strictBreakRule")?.checked !== false;
    reliefRules = { maxPerDay, blocklist, includeDutyRule, strictBreakRule };
    saveReliefRules();
    renderReliefUi();
    showToast("Tetapan relief disimpan.");
  });

  document.getElementById("addBlockTimeBtn").addEventListener("click", () => {
    if (isReliefPlanApproved) return;
    const t = document.getElementById("blockTimeSelect").value;
    if (!t) return;
    const adds = [];
    getAllTeachers().forEach((g) => DAYS.forEach((d) => adds.push(`${g}|${d}|${t}`)));
    reliefRules.blocklist = [...new Set([...(reliefRules.blocklist || []), ...adds])];
    renderReliefRulesForm();
    showToast(`Masa ${t} diblock untuk semua guru.`);
  });

  // Relief plan management
  document.getElementById("loadReliefPlanBtn").addEventListener("click", () => loadPlanByDate(document.getElementById("reliefDate").value || todayIso()));
  document.getElementById("saveReliefPlanBtn").addEventListener("click", saveCurrentPlan);
  document.getElementById("approveReliefPlanBtn").addEventListener("click", approveCurrentPlan);
  document.getElementById("unlockReliefPlanBtn").addEventListener("click", unlockCurrentPlan);
  document.getElementById("exportReliefPdfBtn").addEventListener("click", exportReliefPlanPdf);
  document.getElementById("undoReliefBtn").addEventListener("click", undoRelief);
  document.getElementById("redoReliefBtn").addEventListener("click", redoRelief);
  document.getElementById("publishReliefCloudBtn")?.addEventListener("click", () => publishReliefCloud());
  document.getElementById("pullReliefCloudBtn")?.addEventListener("click", () => pullReliefFromCloud());

  // Auto-assign
  document.getElementById("autoAssignBtn").addEventListener("click", autoAssignGreedy);
  document.getElementById("autoAssignSmartBtn").addEventListener("click", autoAssignSmart);

  // Tutup Kelas
  document.getElementById("addClosedClassBtn").addEventListener("click", addClosedClass);

  // WhatsApp
  document.getElementById("generateWaBtn").addEventListener("click", generateWaMessage);
  document.getElementById("copyWaBtn").addEventListener("click", copyWaMessage);

  // Class select
  document.getElementById("classSelect").addEventListener("change", (e) => { selectedClass = e.target.value; buildClassTable(); });

  // Modals
  document.getElementById("closeAssignModal").addEventListener("click", () => document.getElementById("assignModal").classList.add("hidden"));
  document.getElementById("assignModal").addEventListener("click", (e) => { if (e.target.id === "assignModal") e.currentTarget.classList.add("hidden"); });
  document.getElementById("closeGuruPickerModal").addEventListener("click", () => document.getElementById("guruPickerModal").classList.add("hidden"));
  document.getElementById("guruPickerModal").addEventListener("click", (e) => { if (e.target.id === "guruPickerModal") e.currentTarget.classList.add("hidden"); });

  // Teacher pill
  const teacherBtn = document.getElementById("teacherNameBtn");
  if (teacherBtn) teacherBtn.addEventListener("click", openGuruPickerModal);

  // Teacher search in relief tab
  const searchInput = document.getElementById("teacherSearchInput");
  if (searchInput) searchInput.addEventListener("input", filterTeacherList);

  // Bertugas week
  const bertugasWeekInput = document.getElementById("bertugasWeekInput");
  if (bertugasWeekInput) bertugasWeekInput.value = bertugasWeekDate;
  document.getElementById("bertugasWeekBtn").addEventListener("click", () => {
    bertugasWeekDate = bertugasWeekInput.value || todayIso();
    localStorage.setItem(KEYS.bertugasWeek, bertugasWeekDate);
    buildBertugasTable();
    showToast("Minggu bertugas dikemaskini.");
  });
  const bertugasViewDigital = document.getElementById("bertugasViewDigital");
  const bertugasViewRef = document.getElementById("bertugasViewRef");
  if (bertugasViewDigital) bertugasViewDigital.addEventListener("click", () => setBertugasViewMode("digital"));
  if (bertugasViewRef) bertugasViewRef.addEventListener("click", () => setBertugasViewMode("ref"));
  const bertugasEditToggle = document.getElementById("bertugasEditToggle");
  if (bertugasEditToggle) bertugasEditToggle.addEventListener("click", () => setBertugasEditMode(!bertugasEditMode));
  document.getElementById("bertugasSaveInlineBtn")?.addEventListener("click", () => saveBertugasInline(false));
  document.getElementById("bertugasSaveCloudInlineBtn")?.addEventListener("click", () => saveBertugasInline(true));

  // Admin: reset score
  document.getElementById("resetScoreBtn").addEventListener("click", () => {
    if (!confirm("Pasti nak reset semua relief score?")) return;
    Object.keys(reliefScore).forEach((k) => delete reliefScore[k]);
    saveReliefScore();
    renderReliefUi();
    showToast("Relief score direset.");
  });

  // Admin: export/import
  document.getElementById("exportDataBtn").addEventListener("click", exportAllData);
  document.getElementById("importDataBtn").addEventListener("click", () => document.getElementById("importDataFile").click());
  document.getElementById("importDataFile").addEventListener("change", (e) => {
    if (e.target.files[0]) importAllData(e.target.files[0]);
  });

  // Keyboard: Escape closes modals
  document.getElementById("aiReviewCancel")?.addEventListener("click", closeAiReviewModal);
  document.getElementById("aiReviewApply")?.addEventListener("click", confirmAiReviewApply);
  document.getElementById("aiReviewModal")?.addEventListener("click", (e) => {
    if (e.target.id === "aiReviewModal") closeAiReviewModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.getElementById("assignModal").classList.add("hidden");
      document.getElementById("guruPickerModal").classList.add("hidden");
      closeAiReviewModal();
    }
  });

  // ─── Build UI ────────────────────────────────────────────
  renderBuildBadge();
  renderGuruOptions();
  renderReliefRulesForm();
  renderAbsentReasonBox();
  loadPlanByDate(todayIso());
  buildClassSchedules();
  renderClassOptions();
  renderClosedClassOptions();
  bindReliefDropzone();
  renderReliefUi();
  buildMainTable();
  buildClassTable();
  buildEditor();
  cleanupBertugasMapPairs();
  buildBertugasTable();
  buildBertugasEditor();
  renderUploadInfo();
  renderGroqKeyStatus();
  setBertugasViewMode(getBertugasViewMode());
}

// ─── Bootstrap: fetch guru-schedules + cloud data then init ─
Promise.all([
  fetch("./guru-schedules.json?v=20260608relief").then((r) => (r.ok ? r.json() : null)).catch(() => null),
  fetchCloudBertugas(),
  fetchCloudRelief()
]).then(([guruData, cloudBertugasResult, cloudReliefResult]) => {
  if (guruData?.teachers) {
    guruSchedules = guruData.teachers;
    saveGuruSchedules();
  }
  const cloudBertugas = cloudBertugasResult?.data;
  const cloudBertugasError = cloudBertugasResult?.error;
  if (cloudBertugasError) {
    renderBertugasSyncStatus(`Cloud: ${cloudBertugasError}`);
  } else if (cloudBertugas && applyCloudBertugas(cloudBertugas)) {
    renderUploadInfo();
    const cloudAt = cloudBertugas.updatedAt ? new Date(cloudBertugas.updatedAt).toLocaleString("ms-MY") : "";
    renderBertugasSyncStatus(cloudAt ? `Dimuat dari cloud: ${cloudAt}` : "Dimuat dari cloud");
  }
  const cloudRelief = cloudReliefResult?.data;
  const cloudReliefError = cloudReliefResult?.error;
  if (cloudReliefError) {
    renderReliefSyncStatus(`Cloud: ${cloudReliefError}`);
  } else if (cloudRelief && applyCloudRelief(cloudRelief)) {
    const cloudAt = cloudRelief.updatedAt ? new Date(cloudRelief.updatedAt).toLocaleString("ms-MY") : "";
    renderReliefSyncStatus(cloudAt ? `Dimuat dari cloud: ${cloudAt}` : "Dimuat dari cloud");
  }
}).finally(init);
