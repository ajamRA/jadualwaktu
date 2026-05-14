const buildId = "Build 2026-05-14-1";
const oldTitle = document.title;
document.title = `${oldTitle} | ${buildId}`;const DAYS = ["ISNIN", "SELASA", "RABU", "KHAMIS", "JUMAAT"];
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

const DEFAULT_CLASS_BLOCKS = [
  { day:"ISNIN", start:1, len:1, subjek:"SN", kelas:"3 R" },
  { day:"ISNIN", start:3, len:1, subjek:"SN", kelas:"3 J" },
  { day:"ISNIN", start:7, len:2, subjek:"SN", kelas:"3 F" },
  { day:"ISNIN", start:9, len:2, subjek:"SN", kelas:"3 B" },
  { day:"SELASA", start:4, len:1, subjek:"SN", kelas:"3 K" },
  { day:"SELASA", start:5, len:1, subjek:"SN", kelas:"1 J" },
  { day:"SELASA", start:6, len:1, subjek:"MZ", kelas:"1 J" },
  { day:"SELASA", start:9, len:2, subjek:"PSV", kelas:"2 S" },
  { day:"RABU", start:1, len:1, subjek:"SN", kelas:"3 B" },
  { day:"RABU", start:3, len:2, subjek:"PSV", kelas:"2 R" },
  { day:"RABU", start:6, len:2, subjek:"SN", kelas:"3 J" },
  { day:"RABU", start:9, len:2, subjek:"SN", kelas:"3 S" },
  { day:"KHAMIS", start:2, len:2, subjek:"SN", kelas:"1 J" },
  { day:"KHAMIS", start:5, len:2, subjek:"SN", kelas:"3 R" },
  { day:"KHAMIS", start:8, len:1, subjek:"SN", kelas:"3 S" },
  { day:"KHAMIS", start:9, len:2, subjek:"SN", kelas:"3 K" },
  { day:"JUMAAT", start:5, len:1, subjek:"SN", kelas:"3 F" },
  { day:"JUMAAT", start:7, len:2, subjek:"PSV", kelas:"3 K" }
];

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
  absentReasons: "jadual-v1-absent-reasons"
};

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

function blocksToMap(blocks) {
  const map = {};
  for (const b of blocks) {
    for (let i = 0; i < b.len; i++) {
      const t = TIMES[b.start + i];
      if (!t) continue;
      map[`${b.day}|${t}`] = `${b.subjek}|${b.kelas}`;
    }
  }
  return map;
}

function loadScheduleMap() {
  const raw = localStorage.getItem(KEYS.jadual);
  if (!raw) return blocksToMap(DEFAULT_CLASS_BLOCKS);
  try { return JSON.parse(raw); } catch { return blocksToMap(DEFAULT_CLASS_BLOCKS); }
}

function loadBertugasMap() {
  const raw = localStorage.getItem(KEYS.bertugasData);
  if (!raw) return { ...DEFAULT_BERTUGAS };
  try { return JSON.parse(raw); } catch { return { ...DEFAULT_BERTUGAS }; }
}

function saveScheduleMap() { localStorage.setItem(KEYS.jadual, JSON.stringify(scheduleMap)); }
function saveRelief() { localStorage.setItem(KEYS.relief, JSON.stringify([...reliefSet])); }
function saveBertugasMap() { localStorage.setItem(KEYS.bertugasData, JSON.stringify(bertugasMap)); }
function saveGuruSchedules() { localStorage.setItem(KEYS.guruSchedules, JSON.stringify(guruSchedules)); }
function saveReliefScore() { localStorage.setItem(KEYS.reliefScore, JSON.stringify(reliefScore)); }

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
  if (!raw) return { maxPerDay: 2, blocklist: [] };
  try {
    const v = JSON.parse(raw);
    return {
      maxPerDay: Number(v.maxPerDay || 2),
      blocklist: Array.isArray(v.blocklist) ? v.blocklist : []
    };
  } catch {
    return { maxPerDay: 2, blocklist: [] };
  }
}

function loadReliefPlans() {
  const raw = localStorage.getItem(KEYS.reliefPlans);
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

function saveReliefPlans() {
  localStorage.setItem(KEYS.reliefPlans, JSON.stringify(reliefPlans));
}

function loadAbsentReasons() {
  const raw = localStorage.getItem(KEYS.absentReasons);
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

function saveAbsentReasons() {
  localStorage.setItem(KEYS.absentReasons, JSON.stringify(absentReasons));
}

function snapshotAssignments() {
  return JSON.stringify(reliefAssignments);
}

function pushUndoState() {
  undoStack.push(snapshotAssignments());
  if (undoStack.length > 200) undoStack.shift();
  redoStack = [];
}

function restoreAssignmentsFromSnapshot(s) {
  try { reliefAssignments = JSON.parse(s) || {}; } catch { reliefAssignments = {}; }
}

function undoRelief() {
  if (isReliefPlanApproved || !undoStack.length) return;
  redoStack.push(snapshotAssignments());
  restoreAssignmentsFromSnapshot(undoStack.pop());
  renderReliefUi();
}

function redoRelief() {
  if (isReliefPlanApproved || !redoStack.length) return;
  undoStack.push(snapshotAssignments());
  restoreAssignmentsFromSnapshot(redoStack.pop());
  renderReliefUi();
}

function setReliefStatus(text) {
  const el = document.getElementById("reliefPlanStatus");
  if (el) el.textContent = text;
}

function todayIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getCurrentPlanPayload() {
  return {
    assignments: reliefAssignments,
    absentTeachers: [...absentTeachers],
    approved: isReliefPlanApproved,
    rules: reliefRules
  };
}

function applyPlanPayload(plan) {
  reliefAssignments = { ...(plan.assignments || {}) };
  absentTeachers.clear();
  (plan.absentTeachers || []).forEach((x) => absentTeachers.add(x));
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
  if (found) {
    applyPlanPayload(found);
  } else {
    reliefAssignments = {};
    absentTeachers.clear();
    isReliefPlanApproved = false;
    setReliefStatus("Status: Draft (Plan baru)");
  }
  renderReliefUi();
}

function saveCurrentPlan() {
  if (!currentReliefDate) currentReliefDate = todayIso();
  reliefPlans[currentReliefDate] = getCurrentPlanPayload();
  saveReliefPlans();
  setReliefStatus(`Status: ${isReliefPlanApproved ? "Approved (Locked)" : "Draft"} | Saved ${currentReliefDate}`);
}

function approveCurrentPlan() {
  isReliefPlanApproved = true;
  saveCurrentPlan();
  renderReliefUi();
}

function unlockCurrentPlan() {
  isReliefPlanApproved = false;
  saveCurrentPlan();
  setReliefStatus("Status: Draft (Unlocked)");
  renderReliefUi();
}

function saveReliefRules() {
  localStorage.setItem(KEYS.reliefRules, JSON.stringify(reliefRules));
}

function renderReliefRulesForm() {
  const maxEl = document.getElementById("maxReliefPerDay");
  const txt = document.getElementById("reliefBlocklist");
  if (!maxEl || !txt) return;
  maxEl.value = String(reliefRules.maxPerDay || 2);
  txt.value = (reliefRules.blocklist || []).join("\n");
  const sel = document.getElementById("blockTimeSelect");
  if (sel) {
    sel.innerHTML = "";
    TIMES.forEach((t) => {
      const o = document.createElement("option");
      o.value = t;
      o.textContent = t;
      sel.appendChild(o);
    });
  }
}

function parseAbsentReasonBox() {
  const box = document.getElementById("absentReasonBox");
  if (!box) return;
  const out = {};
  (box.value || "")
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean)
    .forEach((line) => {
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
  const lines = Object.entries(absentReasons).map(([k, v]) => `${k}|${v}`);
  box.value = lines.join("\n");
}

function getAssignedCountByTeacherDay() {
  const counts = {};
  Object.entries(reliefAssignments).forEach(([k]) => {
    const parts = k.split("|");
    if (parts.length < 3) return;
    const assignee = reliefAssignments[k];
    if (!assignee) return;
    const day = parts[1];
    const key = `${assignee}|${day}`;
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
}

function isBlockedByRule(teacher, day, time) {
  const token = `${teacher}|${day}|${time}`.toUpperCase();
  return (reliefRules.blocklist || []).some((r) => r.toUpperCase() === token);
}

function hasNoBreakOnDay(teacher, day) {
  const map = guruSchedules[teacher] || {};
  const occupied = TIMES.map((t, idx) => ({ idx, busy: Boolean(map[`${day}|${t}`]) })).filter((x) => x.busy).map((x) => x.idx);
  if (!occupied.length) return false;
  const min = Math.min(...occupied);
  const max = Math.max(...occupied);
  for (let i = min; i <= max; i += 1) {
    if (!map[`${day}|${TIMES[i]}`]) return false;
  }
  return true;
}

function activateTab(name) {
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === name));
  document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.toggle("active", panel.id === `tab-${name}`));
}

function buildTimeHeaderRow() {
  const tr = document.createElement("tr");
  const day = document.createElement("th");
  day.textContent = "HARI";
  tr.appendChild(day);
  for (const t of TIMES) {
    const th = document.createElement("th");
    th.textContent = t;
    tr.appendChild(th);
  }
  return tr;
}

function buildBertugasHeaderRow() {
  const tr = document.createElement("tr");
  const day = document.createElement("th");
  day.textContent = "TUGAS";
  tr.appendChild(day);
  for (const d of DAYS) {
    const th = document.createElement("th");
    th.textContent = d;
    tr.appendChild(th);
  }
  return tr;
}

function buildMainTable() {
  const table = document.getElementById("jadualTable");
  table.innerHTML = "";
  const thead = document.createElement("thead");
  thead.appendChild(buildTimeHeaderRow());
  table.appendChild(thead);
  const tbody = document.createElement("tbody");

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

      const viewMap = selectedGuru !== "MANUAL" && guruSchedules[selectedGuru] ? guruSchedules[selectedGuru] : scheduleMap;
      const text = viewMap[key] || "";
      if (text.includes("|")) {
        const [subjek, kelas] = text.split("|");
        td.innerHTML = `<div class="subjek">${subjek}</div><div class="kelas">${kelas}</div>`;
      }

      const reliefKey = `${selectedGuru}::${day}|${idx}`;
      const legacyKey = `${day}|${idx}`;
      if (reliefSet.has(reliefKey) || (selectedGuru === "MANUAL" && reliefSet.has(legacyKey))) {
        td.classList.add("relief");
      }
      const toggle = () => {
        td.classList.toggle("relief");
        if (td.classList.contains("relief")) {
          reliefSet.add(reliefKey);
        } else {
          reliefSet.delete(reliefKey);
        }
        saveRelief();
      };
      td.addEventListener("click", toggle);
      td.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
      });
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
}

function renderGuruOptions() {
  const valid = new Set(["MANUAL", ...Object.keys(guruSchedules)]);
  if (!valid.has(selectedGuru)) selectedGuru = "MANUAL";
  updateTeacherPill();
}

function getTeacherPillText() {
  if (selectedGuru && selectedGuru !== "MANUAL") return selectedGuru;
  return "MUHAMAD NURAZAM BIN RAHIM";
}

function updateTeacherPill() {
  const pill = document.getElementById("teacherNameBtn") || document.querySelector(".teacher-name");
  if (!pill) return;
  pill.textContent = getTeacherPillText();
}

function openGuruPickerModal() {
  const modal = document.getElementById("guruPickerModal");
  const list = document.getElementById("guruPickerList");
  list.innerHTML = "";

  const manual = document.createElement("button");
  manual.className = "btn secondary";
  manual.style.width = "100%";
  manual.style.textAlign = "left";
  manual.textContent = "Manual (Jadual Semasa)";
  const selectGuru = (name) => {
    selectedGuru = name;
    localStorage.setItem(KEYS.guruSelected, selectedGuru);
    updateTeacherPill();
    buildMainTable();
    modal.classList.add("hidden");
  };

  const bindTap = (el, fn) => {
    let touchStartX = 0;
    let touchStartY = 0;
    let moved = false;

    el.addEventListener("click", fn);
    el.addEventListener("touchstart", (e) => {
      const t = e.touches && e.touches[0];
      if (!t) return;
      touchStartX = t.clientX;
      touchStartY = t.clientY;
      moved = false;
    }, { passive: true });

    el.addEventListener("touchmove", (e) => {
      const t = e.touches && e.touches[0];
      if (!t) return;
      if (Math.abs(t.clientX - touchStartX) > 8 || Math.abs(t.clientY - touchStartY) > 8) {
        moved = true;
      }
    }, { passive: true });

    el.addEventListener("touchend", (e) => {
      if (moved) return; // user sedang scroll, jangan trigger pilih
      e.preventDefault();
      fn();
    }, { passive: false });
  };

  bindTap(manual, () => {
    selectGuru("MANUAL");
  });
  list.appendChild(manual);

  getAllTeachers().forEach((name) => {
    const btn = document.createElement("button");
    btn.className = "btn secondary";
    btn.style.width = "100%";
    btn.style.textAlign = "left";
    btn.textContent = name;
    bindTap(btn, () => selectGuru(name));
    list.appendChild(btn);
  });

  modal.classList.remove("hidden");
}

function bindTeacherPillGlobalTrigger() {
  const handler = (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (t.closest("#teacherNameBtn") || t.closest(".teacher-name")) {
      e.preventDefault();
      openGuruPickerModal();
    }
  };
  document.addEventListener("pointerup", handler);
}

function getAllTeachers() {
  return Object.keys(guruSchedules).sort();
}

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
  classes.forEach((c) => {
    const o = document.createElement("option");
    o.value = c;
    o.textContent = c;
    sel.appendChild(o);
  });
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
        td.innerHTML = `<div class="subjek">${subj}</div><div class="kelas">${teacher}</div>`;
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
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

function addAbsentTeacher(name) {
  if (isReliefPlanApproved) return;
  if (!name) return;
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
    wrap.innerHTML = "<div class='hint'>Belum ada data guru. Upload `guru-schedules.json` dulu.</div>";
    return;
  }

  teachers.forEach((name) => {
    const item = document.createElement("label");
    item.className = "teacher-item";
    item.innerHTML = `
      <input type="checkbox" ${absentTeachers.has(name) ? "checked" : ""} />
      <span class="teacher-chip" draggable="true">${name}</span>
    `;
    const checkbox = item.querySelector("input");
    checkbox.disabled = isReliefPlanApproved;
    const chip = item.querySelector(".teacher-chip");
    checkbox.addEventListener("change", () => {
      if (isReliefPlanApproved) {
        checkbox.checked = absentTeachers.has(name);
        return;
      }
      if (checkbox.checked) addAbsentTeacher(name);
      else removeAbsentTeacher(name);
    });
    chip.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", name);
    });
    wrap.appendChild(item);
  });
}

function renderAbsentList() {
  const wrap = document.getElementById("absentList");
  wrap.innerHTML = "";
  [...absentTeachers].sort().forEach((name) => {
    const tag = document.createElement("div");
    tag.className = "absent-tag";
    tag.innerHTML = `<button class="ghost-btn" data-focus="${name}" title="Buka jadual">${name}</button><button title="Buang" data-name="${name}">x</button>`;
    tag.querySelector("[data-focus]").addEventListener("click", () => {
      focusAbsentTeacher = name;
      renderReliefUi();
    });
    tag.querySelector("[data-name]").addEventListener("click", () => removeAbsentTeacher(name));
    wrap.appendChild(tag);
  });
}

function suggestRelief() {
  const suggestions = [];
  const absent = [...absentTeachers];
  if (!absent.length) return suggestions;
  const allTeachers = getAllTeachers();

  absent.forEach((absentName) => {
    const map = guruSchedules[absentName] || {};
    Object.entries(map).forEach(([key, val]) => {
      if (!val || !val.includes("|")) return;
      const [day, time] = key.split("|");
      const busy = new Set(absent);
      allTeachers.forEach((t) => {
        if ((guruSchedules[t] || {})[`${day}|${time}`]) busy.add(t);
      });
      const free = allTeachers.filter((t) => !busy.has(t)).slice(0, 8);
      suggestions.push({
        absentName,
        day,
        time,
        kelas: val,
        free
      });
    });
  });

  suggestions.sort((a, b) => {
    const d = DAYS.indexOf(a.day) - DAYS.indexOf(b.day);
    if (d !== 0) return d;
    return TIMES.indexOf(a.time) - TIMES.indexOf(b.time);
  });
  return suggestions;
}

function renderReliefSuggestions() {
  const wrap = document.getElementById("reliefSuggestions");
  wrap.innerHTML = "";
  const data = suggestRelief();
  if (!data.length) {
    wrap.innerHTML = "<div class='hint'>Pilih cikgu tak hadir dulu untuk dapatkan cadangan auto.</div>";
    return;
  }
  data.forEach((row) => {
    const div = document.createElement("div");
    div.className = "sug-item";
    div.innerHTML = `
      <div class="sug-title">${row.day} ${row.time} - ${row.kelas.replace("|", " / ")}</div>
      <div class="sug-free">Tak hadir: <b>${row.absentName}</b></div>
      <div class="sug-free">Cadangan cikgu free: ${row.free.length ? row.free.join(", ") : "Tiada cadangan (semua busy)."}</div>
    `;
    wrap.appendChild(div);
  });
}

function buildReliefTeacherTable() {
  const label = document.getElementById("reliefFocusLabel");
  const table = document.getElementById("reliefTeacherTable");
  const slotSel = document.getElementById("availableSlotSelect");
  table.innerHTML = "";
  slotSel.innerHTML = "";
  if (!focusAbsentTeacher || !guruSchedules[focusAbsentTeacher]) {
    label.textContent = "Belum pilih cikgu.";
    return;
  }

  label.textContent = `Cikgu dipilih: ${focusAbsentTeacher}`;
  const map = guruSchedules[focusAbsentTeacher] || {};
  slotSubjectMap = {};
  const allBusySlots = [];
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
      const k = `${day}|${time}`;
      const td = document.createElement("td");
      td.className = "slot-cell";
      const val = map[k] || "";
      if (val) {
        allBusySlots.push(k);
        const [sub, cls] = val.split("|");
        slotSubjectMap[k] = (sub || "").trim().toUpperCase();
        const assignee = reliefAssignments[`${focusAbsentTeacher}|${k}`] || "";
        td.innerHTML = `<div class="subjek">${sub}</div><div class="kelas">${cls}</div><div class="hint">${assignee ? `Relief: ${assignee}` : "Drop cikgu available sini"}</div>`;
        td.dataset.dropkey = k;
        td.addEventListener("dragover", (e) => e.preventDefault());
        td.addEventListener("drop", (e) => {
          if (isReliefPlanApproved) return;
          e.preventDefault();
          const tName = e.dataTransfer.getData("text/plain");
          if (!tName) return;
          pushUndoState();
          reliefAssignments[`${focusAbsentTeacher}|${k}`] = tName;
          renderReliefUi();
        });
        td.addEventListener("click", () => {
          if (isReliefPlanApproved) return;
          focusSlotKey = k;
          openAssignModal(k);
          renderReliefUi();
        });
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
  const all = getAllTeachers();
  const dailyCounts = getAssignedCountByTeacherDay();
  const available = all.filter((t) => t !== focusAbsentTeacher && !absentTeachers.has(t) && !(guruSchedules[t] || {})[`${day}|${time}`]);
  const ranked = available
    .filter((t) => !hasNoBreakOnDay(t, day))
    .filter((t) => !isBlockedByRule(t, day, time))
    .filter((t) => (dailyCounts[`${t}|${day}`] || 0) < Number(reliefRules.maxPerDay || 2))
    .map((name) => ({ name, score: Number(reliefScore[name] || 0) }))
    .sort((a, b) => a.score - b.score || a.name.localeCompare(b.name));
  const minScore = ranked.length ? ranked[0].score : 0;
  const fairPool = ranked.filter((r) => r.score === minScore);
  fairPool.slice(0, 30).forEach(({ name, score }) => {
    const chip = document.createElement("span");
    chip.className = "teacher-chip";
    chip.textContent = `${name} (${score})`;
    chip.draggable = true;
    chip.addEventListener("dragstart", (e) => e.dataTransfer.setData("text/plain", name));
    wrap.appendChild(chip);
  });
  if (!available.length) wrap.innerHTML = "<div class='hint'>Tiada cikgu available untuk slot ini.</div>";
}

function openAssignModal(slotKey) {
  if (isReliefPlanApproved) return;
  const modal = document.getElementById("assignModal");
  const list = document.getElementById("assignList");
  const title = document.getElementById("assignTitle");
  list.innerHTML = "";
  if (!focusAbsentTeacher || !slotKey) return;

  const [day, time] = slotKey.split("|");
  const dailyCounts = getAssignedCountByTeacherDay();
  const subject = (slotSubjectMap[slotKey] || "").toUpperCase();
  const subjectMap = getSubjectTeachersMap();
  const teacherPool = subjectMap[subject] ? [...subjectMap[subject]] : [];
  const candidatesSubject = teacherPool
    .filter((t) => t !== focusAbsentTeacher)
    .filter((t) => !absentTeachers.has(t))
    .filter((t) => !(guruSchedules[t] || {})[`${day}|${time}`])
    .filter((t) => !hasNoBreakOnDay(t, day))
    .filter((t) => !isBlockedByRule(t, day, time))
    .filter((t) => (dailyCounts[`${t}|${day}`] || 0) < Number(reliefRules.maxPerDay || 2))
    .map((name) => ({ name, score: Number(reliefScore[name] || 0) }))
    .sort((a, b) => a.score - b.score || a.name.localeCompare(b.name));
  const minSubjectScore = candidatesSubject.length ? candidatesSubject[0].score : 0;
  const fairSubject = candidatesSubject.filter((c) => c.score === minSubjectScore);

  const allFree = getAllTeachers()
    .filter((t) => t !== focusAbsentTeacher)
    .filter((t) => !absentTeachers.has(t))
    .filter((t) => !(guruSchedules[t] || {})[`${day}|${time}`])
    .filter((t) => !hasNoBreakOnDay(t, day))
    .filter((t) => !isBlockedByRule(t, day, time))
    .filter((t) => (dailyCounts[`${t}|${day}`] || 0) < Number(reliefRules.maxPerDay || 2))
    .map((name) => ({ name, score: Number(reliefScore[name] || 0) }))
    .sort((a, b) => a.score - b.score || a.name.localeCompare(b.name));
  const minAnyScore = allFree.length ? allFree[0].score : 0;
  const fairAny = allFree.filter((c) => c.score === minAnyScore);

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
        reliefScore[name] = Number(reliefScore[name] || 0) + 1;
        saveReliefScore();
        modal.classList.add("hidden");
        renderReliefUi();
      });
      list.appendChild(row);
    });
  };

  if (fairSubject.length) {
    list.innerHTML = "<div class='hint'>Keutamaan: cikgu subjek sama.</div>";
    renderButtons(fairSubject);
  } else if (fairAny.length) {
    list.innerHTML = "<div class='hint'>Tiada cikgu subjek sama. Fallback: cikgu free lain (ikut score terendah).</div>";
    renderButtons(fairAny, "[Fallback] ");
  } else {
    list.innerHTML = "<div class='hint'>Tiada cikgu available untuk slot ini.</div>";
  }
  modal.classList.remove("hidden");
}

function bindReliefDropzone() {
  const zone = document.getElementById("absentDropzone");
  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    zone.classList.add("drag-over");
  });
  zone.addEventListener("dragleave", () => zone.classList.remove("drag-over"));
  zone.addEventListener("drop", (e) => {
    if (isReliefPlanApproved) return;
    e.preventDefault();
    zone.classList.remove("drag-over");
    const name = e.dataTransfer.getData("text/plain");
    addAbsentTeacher(name);
  });
}

function renderReliefUi() {
  renderReliefTeacherList();
  renderAbsentList();
  buildReliefTeacherTable();
  renderAvailableTeachers();
  renderFinalReliefPlan();
  renderTeacherLoadSummary();
  renderClashWarning();
}

function renderFinalReliefPlan() {
  const wrap = document.getElementById("finalReliefPlan");
  if (!wrap) return;
  wrap.innerHTML = "";
  const rows = Object.entries(reliefAssignments)
    .map(([k, assignee]) => {
      const [absent, day, time] = k.split("|");
      return { absent, day, time, assignee };
    })
    .filter((r) => r.assignee)
    .sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || TIMES.indexOf(a.time) - TIMES.indexOf(b.time));

  if (!rows.length) {
    wrap.innerHTML = "<div class='hint'>Belum ada assignment relief.</div>";
    return;
  }
  rows.forEach((r) => {
    const d = document.createElement("div");
    d.className = "sug-item";
    d.innerHTML = `<div class="sug-title">${r.day} ${r.time}</div><div class="sug-free">Tak hadir: <b>${r.absent}</b> -> Relief: <b>${r.assignee}</b></div>`;
    wrap.appendChild(d);
  });
}

function renderTeacherLoadSummary() {
  const wrap = document.getElementById("teacherLoadSummary");
  if (!wrap) return;
  wrap.innerHTML = "";
  const counts = {};
  Object.values(reliefAssignments).forEach((name) => {
    if (!name) return;
    counts[name] = (counts[name] || 0) + 1;
  });
  const rows = Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  if (!rows.length) {
    wrap.innerHTML = "<div class='hint'>Belum ada data load relief.</div>";
    return;
  }
  rows.forEach(([name, cnt]) => {
    const d = document.createElement("div");
    d.className = "sug-item";
    d.innerHTML = `<div class="sug-title">${name}</div><div class="sug-free">Jumlah relief hari ini: <b>${cnt}</b></div>`;
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
  Object.values(bySlotTeacher).forEach((n) => { if (n > 1) clashes += 1; });
  box.textContent = clashes ? `Clash Check: ${clashes} konflik dikesan.` : "Clash Check: Tiada konflik dikesan.";
}

function generateWaMessage() {
  parseAbsentReasonBox();
  const rows = Object.entries(reliefAssignments)
    .map(([k, assignee]) => {
      const [absent, day, time] = k.split("|");
      return { absent, day, time, assignee };
    })
    .filter((r) => r.assignee)
    .sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || TIMES.indexOf(a.time) - TIMES.indexOf(b.time));
  const date = currentReliefDate || todayIso();
  const dateObj = new Date(`${date}T00:00:00`);
  const dayMap = ["AHAD", "ISNIN", "SELASA", "RABU", "KHAMIS", "JUMAAT", "SABTU"];
  const dayName = dayMap[dateObj.getDay()];
  const prettyDate = `${dateObj.getDate()} ${["Jan","Feb","Mac","Apr","Mei","Jun","Jul","Ogo","Sep","Okt","Nov","Dis"][dateObj.getMonth()]} ${dateObj.getFullYear()}`;
  const lines = [`${prettyDate} ( ${dayName}) `, ``, `*Relief Hari Ini*`, ``];

  const absentSet = [...new Set(rows.map((r) => r.absent))];
  absentSet.forEach((name) => {
    const reason = absentReasons[name.toUpperCase()] || "TIADA MAKLUMAT";
    lines.push(`☑️${name} - ${reason}`);
    rows.filter((r) => r.absent === name).forEach((r) => {
      const slot = (guruSchedules[name] || {})[`${r.day}|${r.time}`] || "";
      let subject = "-";
      let cls = "-";
      if (slot.includes("|")) {
        const [s, c] = slot.split("|");
        subject = s;
        cls = c;
      }
      const [t1, t2] = r.time.split("-");
      const fmt = (x) => x.replace(":", ".");
      const t = `${fmt(t1)} - ${fmt(t2)}`;
      lines.push(`${cls} ${t} ${subject} ${r.assignee}`);
    });
    lines.push("");
  });
  if (!rows.length) lines.push("Tiada assignment.");
  const el = document.getElementById("waMessageBox");
  if (el) el.value = lines.join("\n");
}

async function copyWaMessage() {
  const el = document.getElementById("waMessageBox");
  if (!el) return;
  const text = el.value || "";
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    el.select();
    document.execCommand("copy");
  }
  alert("Mesej WhatsApp dicopy.");
}

function exportReliefPlanPdf() {
  const rows = Object.entries(reliefAssignments)
    .map(([k, assignee]) => {
      const [absent, day, time] = k.split("|");
      return { absent, day, time, assignee };
    })
    .filter((r) => r.assignee)
    .sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || TIMES.indexOf(a.time) - TIMES.indexOf(b.time));
  const date = currentReliefDate || todayIso();
  const htmlRows = rows.map((r) => `<tr><td>${r.day}</td><td>${r.time}</td><td>${r.absent}</td><td>${r.assignee}</td></tr>`).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Relief ${date}</title>
    <style>body{font-family:Segoe UI,sans-serif;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #888;padding:8px;text-align:left}h2{margin:0 0 10px}</style>
    </head><body><h2>Pelan Relief Harian - ${date}</h2>
    <table><thead><tr><th>Hari</th><th>Masa</th><th>Cikgu Tak Hadir</th><th>Cikgu Relief</th></tr></thead><tbody>${htmlRows || "<tr><td colspan='4'>Tiada assignment</td></tr>"}</tbody></table>
    <script>window.onload=()=>window.print()</script></body></html>`;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function buildEditor() {
  const table = document.getElementById("editorTable");
  table.innerHTML = "";
  const thead = document.createElement("thead");
  thead.appendChild(buildTimeHeaderRow());
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (const day of DAYS) {
    const tr = document.createElement("tr");
    const dayCell = document.createElement("th");
    dayCell.className = "day-col";
    dayCell.textContent = day;
    tr.appendChild(dayCell);

    for (const time of TIMES) {
      const td = document.createElement("td");
      const input = document.createElement("input");
      input.className = "editor-input";
      input.placeholder = "SN|3 R";
      input.value = scheduleMap[`${day}|${time}`] || "";
      input.dataset.key = `${day}|${time}`;
      td.appendChild(input);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
}

function buildBertugasTable() {
  const table = document.getElementById("bertugasTable");
  table.innerHTML = "";
  table.classList.add("bertugas-layout");

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
  addRow([{ text: "TARIKH BERTUGAS: 11 HINGGA 15 MEI 2026 ( ISNIN HINGGA JUMAAT )", colspan: 6, className: "meta-row" }], true);
  addRow([{ text: "* KETUA BERTUGAS MINGGUAN : FAEZA BINTI HAMZAH", colspan: 6, className: "meta-row" }], true);

  addRow([{ text: "* PAGAR WAKTU DATANG (MURID)", colspan: 6, className: "section-head" }], true);
  addRow([{ text: "PAGAR (12.20 TENGAH HARI)", colspan: 6, className: "section-head" }], true);
  addRow(dayHeader, true);
  addRow([
    { text: "", className: "small-head" },
    { text: bertugasMap["ISNIN|PAGAR WAKTU DATANG (MURID)"] || "-" },
    { text: bertugasMap["SELASA|PAGAR WAKTU DATANG (MURID)"] || "-" },
    { text: bertugasMap["RABU|PAGAR WAKTU DATANG (MURID)"] || "-" },
    { text: bertugasMap["KHAMIS|PAGAR WAKTU DATANG (MURID)"] || "-" },
    { text: bertugasMap["JUMAAT|PAGAR WAKTU DATANG (MURID)"] || "-" }
  ], false, "names-row");

  addRow([{ text: "KETUA BERTUGAS DI DEWAN (12.30 TENGAH HARI)", colspan: 6, className: "section-head" }], true);
  addRow(dayHeader, true);
  addRow([
    { text: "", className: "small-head" },
    { text: bertugasMap["ISNIN|KETUA BERTUGAS DI DEWAN (12.30 TENGAH HARI)"] || "-" },
    { text: bertugasMap["SELASA|KETUA BERTUGAS DI DEWAN (12.30 TENGAH HARI)"] || "-" },
    { text: bertugasMap["RABU|KETUA BERTUGAS DI DEWAN (12.30 TENGAH HARI)"] || "-" },
    { text: bertugasMap["KHAMIS|KETUA BERTUGAS DI DEWAN (12.30 TENGAH HARI)"] || "-" },
    { text: bertugasMap["JUMAAT|KETUA BERTUGAS DI DEWAN (12.30 TENGAH HARI)"] || "-" }
  ], false, "names-row");
  addRow([{ text: "*GURU BERTUGAS YANG TIDAK BERTUGAS DI PAGAR AKAN BERTUGAS DI DEWAN", colspan: 6, className: "meta-row" }], true);

  addRow([{ text: "WAKTU REHAT", colspan: 6, className: "section-head" }], true);
  addRow(dayHeader, true);
  addRow([
    { text: "3.00-3.30", className: "small-head" },
    { text: bertugasMap["ISNIN|WAKTU REHAT (3.00-3.30)"] || "-" },
    { text: bertugasMap["SELASA|WAKTU REHAT (3.00-3.30)"] || "-" },
    { text: bertugasMap["RABU|WAKTU REHAT (3.00-3.30)"] || "-" },
    { text: bertugasMap["KHAMIS|WAKTU REHAT (3.00-3.30)"] || "-" },
    { text: bertugasMap["JUMAAT|WAKTU REHAT (3.00-3.30)"] || "-" }
  ]);
  addRow([
    { text: "3.30-4.00", className: "small-head" },
    { text: bertugasMap["ISNIN|WAKTU REHAT (3.30-4.00)"] || "-" },
    { text: bertugasMap["SELASA|WAKTU REHAT (3.30-4.00)"] || "-" },
    { text: bertugasMap["RABU|WAKTU REHAT (3.30-4.00)"] || "-" },
    { text: bertugasMap["KHAMIS|WAKTU REHAT (3.30-4.00)"] || "-" },
    { text: bertugasMap["JUMAAT|WAKTU REHAT (3.30-4.00)"] || "-" }
  ]);

  addRow([{ text: "WAKTU BALIK (6.30 PETANG)", colspan: 6, className: "section-head" }], true);
  addRow([
    { text: "*KAWALAN PERGERAKAN MURID KELUAR PAGAR", colspan: 3, className: "section-subhead" },
    { text: "*LALUAN", colspan: 3, className: "section-subhead" }
  ], true);
  addRow([
    { text: "SEMUA GURU BERTUGAS", colspan: 3, className: "bold-center" },
    { text: "SEMUA GURU BERTUGAS", colspan: 3, className: "bold-center" }
  ], true);

  addRow([{ text: "KAWALAN MURID (sehingga WAKTU BALIK 6.00 PETANG)", colspan: 6, className: "section-head" }], true);
  addRow(dayHeader, true);
  addRow([
    { text: "", className: "small-head" },
    { text: bertugasMap["ISNIN|KAWALAN MURID (6.00 PETANG)"] || "-" },
    { text: bertugasMap["SELASA|KAWALAN MURID (6.00 PETANG)"] || "-" },
    { text: bertugasMap["RABU|KAWALAN MURID (6.00 PETANG)"] || "-" },
    { text: bertugasMap["KHAMIS|KAWALAN MURID (6.00 PETANG)"] || "-" },
    { text: bertugasMap["JUMAAT|KAWALAN MURID (6.00 PETANG)"] || "-" }
  ], false, "names-row");

  addRow([{ text: "TUGAS KHAS", colspan: 6, className: "section-head" }], true);
  BERTUGAS_FOOTER_ROWS.forEach((rowLabel) => {
    addRow([
      { text: rowLabel, colspan: 3, className: "small-head" },
      { text: bertugasMap[`ALL|${rowLabel}`] || "-", colspan: 3, className: "bold-center" }
    ]);
  });
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
    const th = document.createElement("th");
    th.className = "day-col";
    th.textContent = row;
    tr.appendChild(th);

    for (const day of DAYS) {
      const td = document.createElement("td");
      const input = document.createElement("input");
      input.className = "editor-input";
      input.placeholder = "Nama guru";
      input.value = bertugasMap[`${day}|${row}`] || "";
      input.dataset.bkey = `${day}|${row}`;
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
  alert("Jadual waktu dah publish.");
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
  alert("Jadual bertugas dah publish.");
}

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
  jadualInfo.textContent = one ? `Rujukan terakhir: ${one.name}` : "Belum ada fail rujukan jadual waktu.";

  const list = JSON.parse(localStorage.getItem(KEYS.bertugasFiles) || "[]");
  document.getElementById("bertugasUploadInfo").textContent = list.length ? `${list.length} fail rujukan bertugas disimpan.` : "Belum ada fail rujukan bertugas.";
}

async function handleUploadJadual(e) {
  const file = e.target.files[0];
  if (!file) return;
  localStorage.setItem(KEYS.jadualFile, JSON.stringify({ name: file.name, type: file.type, dataUrl: await toDataUrl(file) }));
  renderUploadInfo();
}

async function handleUploadBertugas(e) {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;
  const out = [];
  for (const f of files) out.push({ name: f.name, type: f.type, dataUrl: await toDataUrl(f) });
  localStorage.setItem(KEYS.bertugasFiles, JSON.stringify(out));
  renderUploadInfo();
}

async function handleUploadGuruJson(e) {
  const file = e.target.files[0];
  if (!file) return;
  const txt = await file.text();
  const parsed = JSON.parse(txt);
  if (!parsed || !parsed.teachers || typeof parsed.teachers !== "object") {
    alert("Format JSON tak sah. Perlukan struktur { teachers: {...} }");
    return;
  }
  guruSchedules = parsed.teachers;
  saveGuruSchedules();
  buildClassSchedules();
  renderGuruOptions();
  renderClassOptions();
  selectedGuru = "MANUAL";
  localStorage.setItem(KEYS.guruSelected, selectedGuru);
  absentTeachers.clear();
  buildMainTable();
  buildClassTable();
  renderReliefUi();
  alert(`Import berjaya: ${Object.keys(guruSchedules).length} guru.`);
}

function registerPwa() {
  // Disable SW caching to avoid stale build on phones.
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.getRegistrations()
    .then((regs) => Promise.all(regs.map((r) => r.unregister())))
    .catch(() => {});
  if ("caches" in window) {
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).catch(() => {});
  }
}

function init() {
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.addEventListener("click", () => activateTab(btn.dataset.tab)));
  document.getElementById("clearReliefBtn").addEventListener("click", () => {
    if (isReliefPlanApproved) return;
    [...reliefSet].forEach((k) => {
      if (k.startsWith(`${selectedGuru}::`)) reliefSet.delete(k);
    });
    if (selectedGuru === "MANUAL") {
      // clear old legacy keys too
      DAYS.forEach((d) => TIMES.forEach((_, i) => reliefSet.delete(`${d}|${i}`)));
    }
    saveRelief();
    buildMainTable();
  });
  document.getElementById("saveJadualBtn").addEventListener("click", saveFromEditor);
  document.getElementById("saveBertugasBtn").addEventListener("click", saveBertugasFromEditor);
  document.getElementById("uploadJadual").addEventListener("change", handleUploadJadual);
  document.getElementById("uploadBertugas").addEventListener("change", handleUploadBertugas);
  document.getElementById("uploadGuruJson").addEventListener("change", handleUploadGuruJson);
  document.getElementById("availableSlotSelect").addEventListener("change", (e) => {
    focusSlotKey = e.target.value;
    renderAvailableTeachers();
  });
  document.getElementById("saveReliefRulesBtn").addEventListener("click", () => {
    if (isReliefPlanApproved) return;
    const maxEl = document.getElementById("maxReliefPerDay");
    const txt = document.getElementById("reliefBlocklist");
    const maxPerDay = Math.max(1, Number(maxEl.value || 2));
    const blocklist = (txt.value || "")
      .split(/\r?\n/)
      .map((x) => x.trim())
      .filter(Boolean);
    reliefRules = { maxPerDay, blocklist };
    saveReliefRules();
    renderReliefUi();
    alert("Tetapan relief disimpan.");
  });
  document.getElementById("addBlockTimeBtn").addEventListener("click", () => {
    if (isReliefPlanApproved) return;
    const t = document.getElementById("blockTimeSelect").value;
    if (!t) return;
    const adds = [];
    getAllTeachers().forEach((g) => DAYS.forEach((d) => adds.push(`${g}|${d}|${t}`)));
    reliefRules.blocklist = [...new Set([...(reliefRules.blocklist || []), ...adds])];
    renderReliefRulesForm();
  });
  document.getElementById("loadReliefPlanBtn").addEventListener("click", () => {
    loadPlanByDate(document.getElementById("reliefDate").value || todayIso());
  });
  document.getElementById("saveReliefPlanBtn").addEventListener("click", saveCurrentPlan);
  document.getElementById("approveReliefPlanBtn").addEventListener("click", approveCurrentPlan);
  document.getElementById("unlockReliefPlanBtn").addEventListener("click", unlockCurrentPlan);
  document.getElementById("exportReliefPdfBtn").addEventListener("click", exportReliefPlanPdf);
  document.getElementById("undoReliefBtn").addEventListener("click", undoRelief);
  document.getElementById("redoReliefBtn").addEventListener("click", redoRelief);
  document.getElementById("generateWaBtn").addEventListener("click", generateWaMessage);
  document.getElementById("copyWaBtn").addEventListener("click", copyWaMessage);
  document.getElementById("classSelect").addEventListener("change", (e) => {
    selectedClass = e.target.value;
    buildClassTable();
  });
  document.getElementById("closeAssignModal").addEventListener("click", () => {
    document.getElementById("assignModal").classList.add("hidden");
  });
  document.getElementById("assignModal").addEventListener("click", (e) => {
    if (e.target.id === "assignModal") e.currentTarget.classList.add("hidden");
  });
  document.getElementById("closeGuruPickerModal").addEventListener("click", () => {
    document.getElementById("guruPickerModal").classList.add("hidden");
  });
  document.getElementById("guruPickerModal").addEventListener("click", (e) => {
    if (e.target.id === "guruPickerModal") e.currentTarget.classList.add("hidden");
  });
  const teacherBtn = document.getElementById("teacherNameBtn") || document.querySelector(".teacher-name");
  if (teacherBtn) {
    teacherBtn.addEventListener("click", openGuruPickerModal);
    teacherBtn.addEventListener("touchend", (e) => {
      e.preventDefault();
      openGuruPickerModal();
    }, { passive: false });
  }
  bindTeacherPillGlobalTrigger();

  renderGuruOptions();
  renderReliefRulesForm();
  renderAbsentReasonBox();
  loadPlanByDate(todayIso());
  buildClassSchedules();
  renderClassOptions();
  bindReliefDropzone();
  renderReliefUi();
  buildMainTable();
  buildClassTable();
  buildEditor();
  buildBertugasTable();
  buildBertugasEditor();
  renderUploadInfo();
  registerPwa();
}

fetch("./guru-schedules.json?v=20260514-2")
  .then((r) => (r.ok ? r.json() : null))
  .then((data) => {
    if (data && data.teachers) {
      guruSchedules = data.teachers;
      saveGuruSchedules();
      buildClassSchedules();
      renderGuruOptions();
      renderClassOptions();
      buildMainTable();
      buildClassTable();
      renderReliefUi();
    }
  })
  .catch(() => {})
  .finally(init);








