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
  bertugasData: "jadual-v2-bertugas-data"
};

const reliefSet = new Set(JSON.parse(localStorage.getItem(KEYS.relief) || "[]"));
let scheduleMap = loadScheduleMap();
let bertugasMap = loadBertugasMap();

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

      const text = scheduleMap[key] || "";
      if (text.includes("|")) {
        const [subjek, kelas] = text.split("|");
        td.innerHTML = `<div class="subjek">${subjek}</div><div class="kelas">${kelas}</div>`;
      }

      const reliefKey = `${day}|${idx}`;
      if (reliefSet.has(reliefKey)) td.classList.add("relief");
      const toggle = () => {
        td.classList.toggle("relief");
        if (td.classList.contains("relief")) reliefSet.add(reliefKey); else reliefSet.delete(reliefKey);
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

function registerPwa() {
  if (!("serviceWorker" in navigator)) return;

  const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(location.hostname);
  if (isLocalhost) {
    navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
    return;
  }

  navigator.serviceWorker.register("./sw.js?v=2").then((reg) => reg.update()).catch(() => {});
}

function init() {
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.addEventListener("click", () => activateTab(btn.dataset.tab)));
  document.getElementById("clearReliefBtn").addEventListener("click", () => {
    reliefSet.clear(); saveRelief(); buildMainTable();
  });
  document.getElementById("saveJadualBtn").addEventListener("click", saveFromEditor);
  document.getElementById("saveBertugasBtn").addEventListener("click", saveBertugasFromEditor);
  document.getElementById("uploadJadual").addEventListener("change", handleUploadJadual);
  document.getElementById("uploadBertugas").addEventListener("change", handleUploadBertugas);

  buildMainTable();
  buildEditor();
  buildBertugasTable();
  buildBertugasEditor();
  renderUploadInfo();
  registerPwa();
}

init();






