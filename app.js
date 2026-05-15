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
   ============================================================ */

const BUILD_ID = "Build 2026-05-15";
document.title = `${document.title} | ${BUILD_ID}`;

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
  bertugasWeek: "jadual-v1-bertugas-week"
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
let bertugasWeekDate = localStorage.getItem(KEYS.bertugasWeek) || todayIso();
let closedClasses = new Set(); // Format: "KELAS_NAME" — kelas yang ditutup hari ini

// ─── Load/Save Functions ─────────────────────────────────────
function loadScheduleMap() {
  const raw = localStorage.getItem(KEYS.jadual);
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}
function loadBertugasMap() {
  const raw = localStorage.getItem(KEYS.bertugasData);
  if (!raw) return { ...DEFAULT_BERTUGAS };
  try { return JSON.parse(raw); } catch { return { ...DEFAULT_BERTUGAS }; }
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
  if (!raw) return { maxPerDay: 2, blocklist: [], includeDutyRule: true };
  try {
    const v = JSON.parse(raw);
    return { maxPerDay: Number(v.maxPerDay || 2), blocklist: Array.isArray(v.blocklist) ? v.blocklist : [], includeDutyRule: v.includeDutyRule !== false };
  } catch { return { maxPerDay: 2, blocklist: [], includeDutyRule: true }; }
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

function saveScheduleMap() { localStorage.setItem(KEYS.jadual, JSON.stringify(scheduleMap)); }
function saveRelief() { localStorage.setItem(KEYS.relief, JSON.stringify([...reliefSet])); }
function saveBertugasMap() { localStorage.setItem(KEYS.bertugasData, JSON.stringify(bertugasMap)); }
function saveGuruSchedules() { localStorage.setItem(KEYS.guruSchedules, JSON.stringify(guruSchedules)); }
function saveReliefScore() { localStorage.setItem(KEYS.reliefScore, JSON.stringify(reliefScore)); }
function saveReliefRules() { localStorage.setItem(KEYS.reliefRules, JSON.stringify(reliefRules)); }
function saveReliefPlans() { localStorage.setItem(KEYS.reliefPlans, JSON.stringify(reliefPlans)); }
function saveAbsentReasons() { localStorage.setItem(KEYS.absentReasons, JSON.stringify(absentReasons)); }

// ─── Undo/Redo ───────────────────────────────────────────────
function snapshotAssignments() { return JSON.stringify(reliefAssignments); }
function pushUndoState() {
  undoStack.push(snapshotAssignments());
  if (undoStack.length > 200) undoStack.shift();
  redoStack = [];
}
function restoreFromSnapshot(s) {
  try { reliefAssignments = JSON.parse(s) || {}; } catch { reliefAssignments = {}; }
}
function undoRelief() {
  if (isReliefPlanApproved || !undoStack.length) return;
  redoStack.push(snapshotAssignments());
  restoreFromSnapshot(undoStack.pop());
  renderReliefUi();
}
function redoRelief() {
  if (isReliefPlanApproved || !redoStack.length) return;
  undoStack.push(snapshotAssignments());
  restoreFromSnapshot(redoStack.pop());
  renderReliefUi();
}


// ─── Relief Plan Management ──────────────────────────────────
function setReliefStatus(text) { setText(document.getElementById("reliefPlanStatus"), text); }

function getCurrentPlanPayload() {
  return { assignments: reliefAssignments, absentTeachers: [...absentTeachers], approved: isReliefPlanApproved, rules: reliefRules, closedClasses: [...closedClasses] };
}
function applyPlanPayload(plan) {
  reliefAssignments = { ...(plan.assignments || {}) };
  absentTeachers.clear();
  (plan.absentTeachers || []).forEach((x) => absentTeachers.add(x));
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
  saveReliefPlans();
  setReliefStatus(`Status: ${isReliefPlanApproved ? "Approved (Locked)" : "Draft"} | Saved ${currentReliefDate}`);
  showToast("Plan disimpan.");
}
function approveCurrentPlan() { isReliefPlanApproved = true; saveCurrentPlan(); renderReliefUi(); showToast("Plan approved & locked."); }
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

function isBlockedByRule(teacher, day, time) {
  const token = `${teacher}|${day}|${time}`.toUpperCase();
  return (reliefRules.blocklist || []).some((r) => r.toUpperCase() === token);
}

function isTeacherOnDutyAtSlot(teacher, day, time) {
  if (reliefRules.includeDutyRule === false) return false;
  for (const row of BERTUGAS_ROWS) {
    const cell = (bertugasMap[`${day}|${row}`] || "").toUpperCase();
    if (!cell.split("/").map((x) => x.trim()).includes(teacher.toUpperCase())) continue;
    if ((DUTY_TIME_MAP[row] || []).includes(time)) return true;
  }
  return false;
}

function getTeacherSlotsOnDay(teacher, day) {
  const map = guruSchedules[teacher] || {};
  const slots = [];
  TIMES.forEach((t, idx) => { if (map[`${day}|${t}`]) slots.push(idx); });
  return slots;
}

function hasNoBreakOnDay(teacher, day) {
  const slots = getTeacherSlotsOnDay(teacher, day);
  if (slots.length < 3) return false;
  const min = Math.min(...slots);
  const max = Math.max(...slots);
  for (let i = min; i <= max; i++) {
    if (!(guruSchedules[teacher] || {})[`${day}|${TIMES[i]}`]) return false;
  }
  return (max - min + 1) >= TIMES.length - 1;
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

function getEligibleTeachers(day, time, excludeSet) {
  const dailyCounts = getAssignedCountByTeacherDay();
  const maxPerDay = Number(reliefRules.maxPerDay || 2);
  const freedByClass = getTeachersFreedByClosedClasses(day);
  return getAllTeachers()
    .filter((t) => !excludeSet.has(t))
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
    .filter((t) => !wouldLoseAllBreaks(t, day, time));
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
  if (!absentTeachers.size) { showToast("Pilih guru tak hadir dulu."); return; }
  const reliefDay = getReliefDay();
  if (!reliefDay) { showToast("Tarikh yang dipilih bukan hari sekolah."); return; }
  pushUndoState();
  const subjectMap = getSubjectTeachersMap();
  let assigned = 0;
  let skipped = 0;
  const absent = [...absentTeachers];

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
      const eligible = getEligibleTeachers(day, time, excludeSet);
      // Prioritize same subject
      const sameSubj = eligible.filter((t) => subjectMap[subject] && subjectMap[subject].has(t));
      const pool = sameSubj.length ? sameSubj : eligible;
      const ranked = rankByScore(pool);
      if (ranked.length) {
        const chosen = ranked[0].name;
        reliefAssignments[assignKey] = chosen;
        reliefScore[chosen] = (Number(reliefScore[chosen]) || 0) + 1;
        assigned++;
      } else {
        skipped++;
      }
    });
  });

  saveReliefScore();
  renderReliefUi();
  const log = document.getElementById("autoAssignLog");
  if (log) log.textContent = `Auto-assign (${reliefDay}): ${assigned} slot diisi, ${skipped} slot tiada guru available.`;
  showToast(`Auto-assign: ${assigned} slot diisi.`);
}

// Smart: uses constraint-first to minimize max load on any single teacher
// Only assigns for the selected relief day
function autoAssignSmart() {
  if (isReliefPlanApproved) return;
  if (!absentTeachers.size) { showToast("Pilih guru tak hadir dulu."); return; }
  const reliefDay = getReliefDay();
  if (!reliefDay) { showToast("Tarikh yang dipilih bukan hari sekolah."); return; }
  pushUndoState();
  const subjectMap = getSubjectTeachersMap();
  const absent = [...absentTeachers];

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

  // Sort slots by number of eligible teachers (most constrained first)
  const excludeSet = new Set(absent);
  slots.forEach((s) => {
    s.eligible = getEligibleTeachers(s.day, s.time, excludeSet);
    s.sameSubj = s.eligible.filter((t) => subjectMap[s.subject] && subjectMap[s.subject].has(t));
  });
  slots.sort((a, b) => a.eligible.length - b.eligible.length);

  // Track daily assignments for this run
  const dailyCount = {};
  const maxPerDay = Number(reliefRules.maxPerDay || 2);
  let assigned = 0;
  let skipped = 0;

  // Greedy with constraint propagation
  for (const slot of slots) {
    const pool = slot.sameSubj.length ? slot.sameSubj : slot.eligible;
    const candidates = pool.filter((t) => {
      const key = `${t}|${slot.day}`;
      return (dailyCount[key] || 0) < maxPerDay;
    });
    const ranked = rankByScore(candidates);
    if (ranked.length) {
      const minScore = ranked[0].score;
      const tier = ranked.filter((r) => r.score === minScore);
      const chosen = tier[Math.floor(Math.random() * tier.length)].name;
      reliefAssignments[slot.assignKey] = chosen;
      reliefScore[chosen] = (Number(reliefScore[chosen]) || 0) + 1;
      const dKey = `${chosen}|${slot.day}`;
      dailyCount[dKey] = (dailyCount[dKey] || 0) + 1;
      assigned++;
    } else {
      skipped++;
    }
  }

  saveReliefScore();
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

      const reliefKey = `${selectedGuru}::${day}|${idx}`;
      const legacyKey = `${day}|${idx}`;
      if (reliefSet.has(reliefKey) || (selectedGuru === "MANUAL" && reliefSet.has(legacyKey))) {
        td.classList.add("relief");
      }
      const toggle = () => {
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
          pushUndoState();
          reliefAssignments[`${focusAbsentTeacher}|${k}`] = tName;
          reliefScore[tName] = (Number(reliefScore[tName]) || 0) + 1;
          saveReliefScore();
          renderReliefUi();
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
  const eligible = getEligibleTeachers(day, time, excludeSet);
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
      if (e.key === "Enter") {
        if (isReliefPlanApproved) return;
        pushUndoState();
        reliefAssignments[`${focusAbsentTeacher}|${focusSlotKey}`] = name;
        reliefScore[name] = (Number(reliefScore[name]) || 0) + 1;
        saveReliefScore();
        renderReliefUi();
      }
    });
    wrap.appendChild(chip);
  });
  if (!eligible.length) wrap.innerHTML = "<div class='hint'>Tiada cikgu available untuk slot ini.</div>";
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
  const eligible = getEligibleTeachers(day, time, excludeSet);

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
        pushUndoState();
        reliefAssignments[`${focusAbsentTeacher}|${slotKey}`] = name;
        reliefScore[name] = (Number(reliefScore[name]) || 0) + 1;
        saveReliefScore();
        modal.classList.add("hidden");
        renderReliefUi();
        showToast(`${name} di-assign untuk ${day} ${time}.`);
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
      pushUndoState();
      delete reliefAssignments[`${focusAbsentTeacher}|${slotKey}`];
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
  buildReliefTeacherTable();
  renderAvailableTeachers();
  renderFinalReliefPlan();
  renderTeacherLoadSummary();
  renderClashWarning();
  renderReliefStats();
  renderClosedClassesUi();
}

function renderFinalReliefPlan() {
  const wrap = document.getElementById("finalReliefPlan");
  if (!wrap) return;
  wrap.innerHTML = "";
  const reliefDay = getReliefDay();
  const rows = Object.entries(reliefAssignments)
    .map(([k, assignee]) => { const [absent, day, time] = k.split("|"); return { absent, day, time, assignee }; })
    .filter((r) => r.assignee)
    .filter((r) => !reliefDay || r.day === reliefDay) // Only show today's
    .sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || TIMES.indexOf(a.time) - TIMES.indexOf(b.time));

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
  Object.values(reliefAssignments).forEach((name) => { if (name) counts[name] = (counts[name] || 0) + 1; });
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
  let clashes = 0;
  Object.entries(reliefAssignments).forEach(([k, assignee]) => {
    if (!assignee) return;
    const [, day, time] = k.split("|");
    const key = `${assignee}|${day}|${time}`;
    bySlotTeacher[key] = (bySlotTeacher[key] || 0) + 1;
  });
  Object.values(bySlotTeacher).forEach((n) => { if (n > 1) clashes++; });
  box.textContent = clashes ? `⚠️ Clash: ${clashes} konflik dikesan!` : "✓ Tiada konflik dikesan.";
  box.style.color = clashes ? "var(--danger)" : "var(--success)";
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
  const rows = Object.entries(reliefAssignments)
    .map(([k, assignee]) => { const [absent, day, time] = k.split("|"); return { absent, day, time, assignee }; })
    .filter((r) => r.assignee)
    .sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || TIMES.indexOf(a.time) - TIMES.indexOf(b.time));
  const date = currentReliefDate || todayIso();
  const dateObj = new Date(`${date}T00:00:00`);
  const dayMap = ["AHAD", "ISNIN", "SELASA", "RABU", "KHAMIS", "JUMAAT", "SABTU"];
  const dayName = dayMap[dateObj.getDay()];
  const months = ["Jan","Feb","Mac","Apr","Mei","Jun","Jul","Ogo","Sep","Okt","Nov","Dis"];
  const prettyDate = `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
  const lines = [`${prettyDate} (${dayName})`, ``, `*Relief Hari Ini*`, ``];

  const absentSet = [...new Set(rows.map((r) => r.absent))];
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
  const rows = Object.entries(reliefAssignments)
    .map(([k, assignee]) => { const [absent, day, time] = k.split("|"); return { absent, day, time, assignee }; })
    .filter((r) => r.assignee)
    .sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || TIMES.indexOf(a.time) - TIMES.indexOf(b.time));
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
function buildBertugasTable() {
  const table = document.getElementById("bertugasTable");
  table.innerHTML = "";
  table.classList.add("bertugas-layout");

  const week = getWeekDates(bertugasWeekDate);

  const addRow = (cells, isHeader = false, rowClass = "") => {
    const tr = document.createElement("tr");
    if (rowClass) tr.className = rowClass;
    cells.forEach((cell) => {
      const el = document.createElement(isHeader || cell.header ? "th" : "td");
      el.textContent = cell.text || "";
      if (cell.colspan) el.colSpan = cell.colspan;
      if (cell.className) el.className = cell.className;
      tr.appendChild(el);
    });
    table.appendChild(tr);
  };

  const dayHeader = [{ text: "", className: "small-head" }, ...DAYS.map((d) => ({ text: d, className: "small-head" }))];

  addRow([{ text: "JADUAL BERTUGAS", colspan: 6, className: "section-title" }], true);
  addRow([{ text: "KUMPULAN D", colspan: 6, className: "section-title" }], true);
  addRow([{ text: `TARIKH BERTUGAS: ${week.start} HINGGA ${week.end} (ISNIN HINGGA JUMAAT)`, colspan: 6, className: "meta-row" }], true);
  addRow([{ text: "* KETUA BERTUGAS MINGGUAN : FAEZA BINTI HAMZAH", colspan: 6, className: "meta-row" }], true);

  addRow([{ text: "* PAGAR WAKTU DATANG (MURID)", colspan: 6, className: "section-head" }], true);
  addRow([{ text: "PAGAR (12.20 TENGAH HARI)", colspan: 6, className: "section-head" }], true);
  addRow(dayHeader, true);
  addRow([{ text: "", className: "small-head" }, ...DAYS.map((d) => ({ text: bertugasMap[`${d}|PAGAR WAKTU DATANG (MURID)`] || "-" }))], false, "names-row");

  addRow([{ text: "KETUA BERTUGAS DI DEWAN (12.30 TENGAH HARI)", colspan: 6, className: "section-head" }], true);
  addRow(dayHeader, true);
  addRow([{ text: "", className: "small-head" }, ...DAYS.map((d) => ({ text: bertugasMap[`${d}|KETUA BERTUGAS DI DEWAN (12.30 TENGAH HARI)`] || "-" }))], false, "names-row");
  addRow([{ text: "*GURU BERTUGAS YANG TIDAK BERTUGAS DI PAGAR AKAN BERTUGAS DI DEWAN", colspan: 6, className: "meta-row" }], true);

  addRow([{ text: "WAKTU REHAT", colspan: 6, className: "section-head" }], true);
  addRow(dayHeader, true);
  addRow([{ text: "3.00-3.30", className: "small-head" }, ...DAYS.map((d) => ({ text: bertugasMap[`${d}|WAKTU REHAT (3.00-3.30)`] || "-" }))]);
  addRow([{ text: "3.30-4.00", className: "small-head" }, ...DAYS.map((d) => ({ text: bertugasMap[`${d}|WAKTU REHAT (3.30-4.00)`] || "-" }))]);

  addRow([{ text: "WAKTU BALIK (6.30 PETANG)", colspan: 6, className: "section-head" }], true);
  addRow([{ text: "*KAWALAN PERGERAKAN MURID KELUAR PAGAR", colspan: 3, className: "section-subhead" }, { text: "*LALUAN", colspan: 3, className: "section-subhead" }], true);
  addRow([{ text: "SEMUA GURU BERTUGAS", colspan: 3, className: "bold-center" }, { text: "SEMUA GURU BERTUGAS", colspan: 3, className: "bold-center" }], true);

  addRow([{ text: "KAWALAN MURID (sehingga WAKTU BALIK 6.00 PETANG)", colspan: 6, className: "section-head" }], true);
  addRow(dayHeader, true);
  addRow([{ text: "", className: "small-head" }, ...DAYS.map((d) => ({ text: bertugasMap[`${d}|KAWALAN MURID (6.00 PETANG)`] || "-" }))], false, "names-row");

  addRow([{ text: "TUGAS KHAS", colspan: 6, className: "section-head" }], true);
  BERTUGAS_FOOTER_ROWS.forEach((rowLabel) => {
    addRow([{ text: rowLabel, colspan: 3, className: "small-head" }, { text: bertugasMap[`ALL|${rowLabel}`] || "-", colspan: 3, className: "bold-center" }]);
  });
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
  for (const row of BERTUGAS_ROWS) {
    const tr = document.createElement("tr");
    const th = document.createElement("th"); th.className = "day-col"; th.textContent = row;
    tr.appendChild(th);
    for (const day of DAYS) {
      const td = document.createElement("td");
      const input = document.createElement("input");
      input.className = "editor-input";
      input.placeholder = "Nama guru";
      input.value = bertugasMap[`${day}|${row}`] || "";
      input.dataset.bkey = `${day}|${row}`;
      input.setAttribute("aria-label", `${day} ${row}`);
      td.appendChild(input);
      tr.appendChild(td);
    }
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
    const val = input.value.trim().toUpperCase();
    if (val) next[input.dataset.bkey] = val;
  });
  bertugasMap = next;
  saveBertugasMap();
  buildBertugasTable();
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

function renderUploadInfo() {
  const jadualInfo = document.getElementById("jadualUploadInfo");
  const one = JSON.parse(localStorage.getItem(KEYS.jadualFile) || "null");
  setText(jadualInfo, one ? `Rujukan terakhir: ${one.name}` : "Belum ada fail rujukan jadual waktu.");
  const list = JSON.parse(localStorage.getItem(KEYS.bertugasFiles) || "[]");
  setText(document.getElementById("bertugasUploadInfo"), list.length ? `${list.length} fail rujukan bertugas disimpan.` : "Belum ada fail rujukan bertugas.");
}

async function handleUploadJadual(e) {
  const file = e.target.files[0];
  if (!file) return;
  localStorage.setItem(KEYS.jadualFile, JSON.stringify({ name: file.name, type: file.type, dataUrl: await toDataUrl(file) }));
  renderUploadInfo();
  showToast("Fail rujukan jadual diupload.");
}

async function handleUploadBertugas(e) {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;
  const out = [];
  for (const f of files) out.push({ name: f.name, type: f.type, dataUrl: await toDataUrl(f) });
  localStorage.setItem(KEYS.bertugasFiles, JSON.stringify(out));
  renderUploadInfo();
  showToast("Fail rujukan bertugas diupload.");
}

async function handleUploadGuruJson(e) {
  const file = e.target.files[0];
  if (!file) return;
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
    absentReasons
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
  document.getElementById("uploadGuruJson").addEventListener("change", handleUploadGuruJson);

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
    reliefRules = { maxPerDay, blocklist, includeDutyRule };
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
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.getElementById("assignModal").classList.add("hidden");
      document.getElementById("guruPickerModal").classList.add("hidden");
    }
  });

  // ─── Build UI ────────────────────────────────────────────
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
  buildBertugasTable();
  buildBertugasEditor();
  renderUploadInfo();
}

// ─── Bootstrap: fetch guru-schedules.json then init ──────────
fetch("./guru-schedules.json?v=20260515")
  .then((r) => (r.ok ? r.json() : null))
  .then((data) => {
    if (data && data.teachers) {
      guruSchedules = data.teachers;
      saveGuruSchedules();
    }
  })
  .catch(() => {})
  .finally(init);
