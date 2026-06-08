const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function buildPromptB() {
  const days = ["ISNIN", "SELASA", "RABU", "KHAMIS", "JUMAAT"];
  const keys = [];
  const rows = [
    "WAKTU DATANG",
    "KAWALAN DI DEWAN TERBUKA",
    "KANTIN (3.00-3.30)",
    "KANTIN (3.30-4.00)",
    "KANTIN (4.00-4.30)",
    "PONDOK PENGAWAL 1",
    "PONDOK PENGAWAL 2"
  ];
  for (const row of rows) for (const day of days) keys.push(`${day}|${row}`);
  ["BUKU LAPORAN BERTUGAS", "LAPORAN BERTUGAS", "RMT/KANTIN/SUSU"].forEach((r) => keys.push(`ALL|${r}`));

  return `OCR jadual JADUAL BERTUGAS KUMPULAN B (format sekolah Malaysia).

STRUKTUR IMEJ (atas→bawah):
1. WAKTU DATANG > KAWALAN DI PINTU PAGAR B — 1 baris: ISNIN..JUMAAT
   → key: ISNIN|WAKTU DATANG, SELASA|WAKTU DATANG, ...
2. KAWALAN DI DEWAN TERBUKA — 1 baris 5 nama (buang suffix (K))
   → key: ISNIN|KAWALAN DI DEWAN TERBUKA, ...
3. KAWALAN DI KANTIN:
   - 3.00-3.30 PTG: ISNIN-KHAMIS (JUMAAT kosong "-")
   - 3.30-4.00 PTG: ISNIN-KHAMIS
   - JUMAAT sahaja: 3.30-4.00 → JUMAAT|KANTIN (3.30-4.00), 4.00-4.30 → JUMAAT|KANTIN (4.00-4.30)
4. KAWALAN DI PONDOK PENGAWAL — 2 baris berasingan setiap hari:
   - baris atas → PONDOK PENGAWAL 1 (SATU nama)
   - baris bawah → PONDOK PENGAWAL 2 (SATU nama)
   - JANGAN gabung dua nama dalam satu sel (tiada " / ")
5. TUGAS KHAS (ALL|...):
   - BUKU LAPORAN BERTUGAS
   - LAPORAN BERTUGAS
   - RMT/KANTIN/SUSU

PENTING:
- Baca mengikut LAJUR hari (ISNIN, SELASA, RABU, KHAMIS, JUMAAT)
- Jangan campur baris kantin 3.00-3.30 dengan 3.30-4.00
- Pondok pengawal: 2 nama menegak per hari = 2 baris berasingan
- Nama tepat seperti dalam imej (MURSIDA, YUSUF, FARAH, AKALILI, RODZIAH, HALIYZA, dll)
- GURU WANITA = nama sah untuk JUMAAT pagar

Kunci JSON wajib:
${keys.map((k) => `"${k}"`).join(", ")}

Return JSON:
{
  "kumpulan": "B",
  "weekStart": "2026-06-08",
  "weekEnd": "2026-06-12",
  "weekText": "TARIKH BERTUGAS: 8 HINGGA 12 JUN 2026",
  "assignments": { "ISNIN|WAKTU DATANG": "MURSIDA", ... },
  "uncertain": []
}

Peraturan:
- SATU nama sahaja setiap kunci — JANGAN guna " / " atau pair
- UPPERCASE, buang (K), kosong "" jika tiada`;
}

function buildPromptD(teacherNames) {
  const days = ["ISNIN", "SELASA", "RABU", "KHAMIS", "JUMAAT"];
  const rows = [
    "PAGAR WAKTU DATANG (MURID)",
    "PAGAR (12.20 TENGAH HARI)",
    "KETUA BERTUGAS DI DEWAN (12.30 TENGAH HARI)",
    "WAKTU REHAT (3.00-3.30)",
    "WAKTU REHAT (3.30-4.00)",
    "KAWALAN MURID (6.00 PETANG)"
  ];
  const keys = [];
  for (const row of rows) for (const day of days) keys.push(`${day}|${row}`);
  ["BUKU LAPORAN BERTUGAS", "LAPORAN BERTUGAS&NILAI MURNI", "RMT/KANTIN"].forEach((r) => keys.push(`ALL|${r}`));

  return `OCR jadual JADUAL BERTUGAS KUMPULAN D.
Senarai guru: ${teacherNames.join(", ")}
Kunci: ${keys.join(", ")}
Return JSON: { "kumpulan":"D", "weekStart":"", "weekText":"", "assignments":{}, "uncertain":[] }`;
}

function buildPromptReliefClose(context) {
  return `Anda pembantu guru besar sekolah rendah Malaysia (sesi PETANG 12:15-6:45).

INI SISTEM RELIEF CIKGU SAHAJA — BUKAN kehadiran murid.

PERATURAN TUTUP KELAS:
- Tutup kelas = slot cikgu tak hadir untuk kelas itu tidak perlu relief; cikgu lain yang mengajar kelas sama jadi available.
- Cadang TUTUP jika slot terjejas tiada cikgu relief available (eligibleCount = 0).
- Cadang RELIEF DULU jika slot belum assign tetapi masih ada cikgu available.
- Relief separuh hari (mesyuarat): slot SELEPAS guru hadir semula — guru sendiri mengajar; biasanya JANGAN tutup jika slot sebelum itu sudah ada relief.
- Jika lebih 9 cikgu tak hadir sekolah, semak semula kelas terjejas dengan teliti.

DATA ANALISIS HARI INI:
${JSON.stringify(context, null, 2)}

Return JSON sahaja:
{
  "summary": "ringkasan 1-2 ayat untuk pentadbir",
  "suggestions": [
    {
      "class": "2 AL FARABI",
      "action": "tutup",
      "confidence": "tinggi",
      "reason": "sebab ringkas dalam BM"
    }
  ]
}

action mesti salah satu: "tutup", "jangan_tutup", "relief_dulu"
confidence: "tinggi", "sederhana", "rendah"`;
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { apiKey, imageDataUrl, mode, context, teacherNames = [], kumpulan = "B" } = JSON.parse(event.body || "{}");
    if (!apiKey) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "API key diperlukan" }) };
    }

    const isReliefClose = mode === "relief-close";
    if (!isReliefClose && !imageDataUrl) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Imej diperlukan" }) };
    }
    if (isReliefClose && !context) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Context diperlukan" }) };
    }

    const prompt = isReliefClose
      ? buildPromptReliefClose(context)
      : (String(kumpulan).toUpperCase() === "D" ? buildPromptD(teacherNames) : buildPromptB());

    const userContent = isReliefClose
      ? [{ type: "text", text: prompt }]
      : [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageDataUrl } }
        ];

    const groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0,
        max_completion_tokens: isReliefClose ? 2048 : 4096,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: userContent }]
      })
    });

    const groqData = await groqRes.json();
    if (!groqRes.ok) {
      const msg = groqData?.error?.message || `Groq error ${groqRes.status}`;
      return { statusCode: groqRes.status, headers: corsHeaders, body: JSON.stringify({ error: msg }) };
    }

    const raw = groqData?.choices?.[0]?.message?.content || "{}";
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { statusCode: 502, headers: corsHeaders, body: JSON.stringify({ error: "AI return bukan JSON sah", raw }) };
    }

    if (!parsed.kumpulan) parsed.kumpulan = String(kumpulan).toUpperCase() === "D" ? "D" : "B";

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true, data: parsed })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message || "Ralat server" })
    };
  }
};