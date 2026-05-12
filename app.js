const DAYS = ["ISNIN", "SELASA", "RABU", "KHAMIS", "JUMAAT"];
const TIMES = [
  "1:00-1:30", "1:30-2:00", "2:00-2:30", "2:30-3:00", "3:00-3:30",
  "3:30-4:00", "4:00-4:30", "4:30-5:00", "5:00-5:30", "5:30-6:00", "6:00-6:30"
];

const DEFAULT_CLASS_BLOCKS = [
  { day:"ISNIN", start:1, len:1, subjek:"SN", kelas:"3 R" },
  { day:"ISNIN", start:3, len:1, subjek:"SN", kelas:"3 J" },
  { day:"ISNIN", start:7, len:2, subjek:"SN", kelas:"3 F" },
  { day:"ISNIN", start:9, len:2, subjek:"SN", kelas:"3 B" },
  { day:"SELASA", start:4, len:1, subjek:"SN", kelas:"3 K" },
  { day:"SELASA", start:5, len:1, subjek:"SN", kelas:"1 J" },
  { day:"SELASA", start:6, len:1, subjek:"MZ", kelas:"1 J" },
  { day:"SELASA", start:9, len:1, subjek:"PSV", kelas:"2 S" },
  { day:"RABU", start:1, len:1, subjek:"SN", kelas:"3 B" },
  { day:"RABU", start:3, len:2, subjek:"PSV", kelas:"2 R" },
  { day:"RABU", start:6, len:2, subjek:"SN", kelas:"3 J" },
  { day:"RABU", start:9, len:1, subjek:"SN", kelas:"3 S" },
  { day:"KHAMIS", start:2, len:2, subjek:"SN", kelas:"1 J" },
  { day:"KHAMIS", start:5, len:2, subjek:"SN", kelas:"3 R" },
  { day:"KHAMIS", start:8, len:1, subjek:"SN", kelas:"3 S" },
  { day:"KHAMIS", start:9, len:2, subjek:"SN", kelas:"3 K" },
  { day:"JUMAAT", start:5, len:1, subjek:"SN", kelas:"3 F" },
  { day:"JUMAAT", start:7, len:2, subjek:"PSV", kelas:"3 K" },
];

const KEYS = {
  jadual: "jadual-v2-data",
  relief: "jadual-v2-relief",
  jadualFile: "jadual-v2-upload",
  bertugasFiles: "jadual-v2-bertugas"
};

const reliefSet = new Set(JSON.parse(localStorage.getItem(KEYS.relief) || "[]"));
let scheduleMap = loadScheduleMap();

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

function saveScheduleMap() {
  localStorage.setItem(KEYS.jadual, JSON.stringify(scheduleMap));
}

function saveRelief() {
  localStorage.setItem(KEYS.relief, JSON.stringify([...reliefSet]));
}

function activateTab(name) {
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === name));
  document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.toggle("active", panel.id === `tab-${name}`));
}

function buildHeaderRow() {
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

function buildMainTable() {
  const table = document.getElementById("jadualTable");
  table.innerHTML = "";
  const thead = document.createElement("thead");
  thead.appendChild(buildHeaderRow());
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
        if (td.classList.contains("relief")) reliefSet.add(reliefKey);
        else reliefSet.delete(reliefKey);
        saveRelief();
      };
      td.addEventListener("click", toggle);
      td.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
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
  thead.appendChild(buildHeaderRow());
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

function saveFromEditor() {
  const nextMap = {};
  document.querySelectorAll(".editor-input").forEach((input) => {
    const val = input.value.trim().toUpperCase();
    if (val) nextMap[input.dataset.key] = val;
  });
  scheduleMap = nextMap;
  saveScheduleMap();
  buildMainTable();
  alert("Jadual baru dah disimpan.");
}

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function renderUploadInfo() {
  const jadualInfo = document.getElementById("jadualUploadInfo");
  const one = JSON.parse(localStorage.getItem(KEYS.jadualFile) || "null");
  jadualInfo.textContent = one ? `Fail terakhir: ${one.name}` : "Belum ada fail jadual waktu.";

  const list = JSON.parse(localStorage.getItem(KEYS.bertugasFiles) || "[]");
  document.getElementById("bertugasUploadInfo").textContent = list.length ? `${list.length} fail bertugas disimpan.` : "Belum ada fail bertugas.";
}

function renderBertugasFiles() {
  const wrap = document.getElementById("bertugasList");
  wrap.innerHTML = "";
  const list = JSON.parse(localStorage.getItem(KEYS.bertugasFiles) || "[]");
  if (!list.length) {
    wrap.innerHTML = '<div class="hint">Tiada fail lagi.</div>';
    return;
  }

  list.forEach((item) => {
    const card = document.createElement("div");
    card.className = "file-item";
    const title = document.createElement("div");
    title.textContent = item.name;
    title.style.fontWeight = "700";
    title.style.marginBottom = "8px";
    card.appendChild(title);

    if (item.type.includes("pdf")) {
      const frame = document.createElement("iframe");
      frame.src = item.dataUrl;
      card.appendChild(frame);
    } else {
      const img = document.createElement("img");
      img.src = item.dataUrl;
      img.alt = item.name;
      card.appendChild(img);
    }

    wrap.appendChild(card);
  });
}

async function handleUploadJadual(e) {
  const file = e.target.files[0];
  if (!file) return;
  const dataUrl = await toDataUrl(file);
  localStorage.setItem(KEYS.jadualFile, JSON.stringify({ name: file.name, type: file.type, dataUrl }));
  renderUploadInfo();
  alert("Fail jadual waktu berjaya upload. Seterusnya update slot dalam editor dan klik Simpan & Publish.");
}

async function handleUploadBertugas(e) {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;
  const out = [];
  for (const f of files) {
    out.push({ name: f.name, type: f.type, dataUrl: await toDataUrl(f) });
  }
  localStorage.setItem(KEYS.bertugasFiles, JSON.stringify(out));
  renderUploadInfo();
  renderBertugasFiles();
  alert("Fail jadual bertugas berjaya upload.");
}

function registerPwa() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

function init() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => activateTab(btn.dataset.tab));
  });
  document.getElementById("clearReliefBtn").addEventListener("click", () => {
    reliefSet.clear();
    saveRelief();
    buildMainTable();
  });
  document.getElementById("saveJadualBtn").addEventListener("click", saveFromEditor);
  document.getElementById("uploadJadual").addEventListener("change", handleUploadJadual);
  document.getElementById("uploadBertugas").addEventListener("change", handleUploadBertugas);

  buildMainTable();
  buildEditor();
  renderUploadInfo();
  renderBertugasFiles();
  registerPwa();
}

init();
