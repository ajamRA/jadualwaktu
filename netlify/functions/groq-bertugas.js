const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function buildPrompt(teacherNames) {
  const days = ["ISNIN", "SELASA", "RABU", "KHAMIS", "JUMAAT"];
  const keys = [];
  const rows = [
    ["PAGAR WAKTU DATANG (MURID)", "Satu baris nama bawah header hari — pagar waktu datang murid"],
    ["PAGAR (12.20 TENGAH HARI)", "Biasanya SAMA dengan pagar waktu datang untuk hari sama"],
    ["KETUA BERTUGAS DI DEWAN (12.30 TENGAH HARI)", "Baris ketua bertugas dewan tengah hari"],
    ["WAKTU REHAT (3.00-3.30)", "Baris rehat slot pertama"],
    ["WAKTU REHAT (3.30-4.00)", "Baris rehat slot kedua — JANGAN campur dengan slot pertama"],
    ["KAWALAN MURID (6.00 PETANG)", "Baris kawalan murid petang — boleh 2 nama dengan /"],
    ["TUGAS KHAS", "Jika ada dalam imej"]
  ];
  for (const [row] of rows) for (const day of days) keys.push(`${day}|${row}`);
  ["BUKU LAPORAN BERTUGAS", "LAPORAN BERTUGAS&NILAI MURNI", "RMT/KANTIN"].forEach((r) => keys.push(`ALL|${r}`));

  return `Anda OCR jadual bertugas sekolah Malaysia. Imej ialah jadual dengan LAJUR hari (ISNIN→JUMAAT).

STRUKTUR JADUAL (atas ke bawah):
1. PAGAR WAKTU DATANG (MURID) — 1 baris 5 nama (ISNIN..JUMAAT)
2. PAGAR (12.20 TENGAH HARI) — biasanya nama sama seperti #1
3. KETUA BERTUGAS DI DEWAN (12.30 TENGAH HARI) — 1 baris 5 nama
4. WAKTU REHAT — 2 baris berasingan:
   - baris "3.00-3.30" (5 nama)
   - baris "3.30-4.00" (5 nama)
5. KAWALAN MURID (6.00 PETANG) — 1 baris 5 nama
6. Footer (seluruh minggu): BUKU LAPORAN BERTUGAS, LAPORAN BERTUGAS&NILAI MURNI, RMT/KANTIN

PENTING:
- Baca setiap SEL mengikut LAJUR hari di atasnya, bukan baris sebelah
- Jangan gerakkan nama ke hari salah
- Waktu rehat ada 2 baris — jangan salin baris pertama ke baris kedua
- Padankan ejaan nama ke senarai guru jika hampir sama

Senarai guru sah: ${teacherNames.join(", ")}

Kunci JSON (guna tepat):
${keys.map((k) => `"${k}"`).join(", ")}

Return JSON:
{
  "weekStart": "YYYY-MM-DD",
  "weekEnd": "YYYY-MM-DD",
  "assignments": { "ISNIN|PAGAR WAKTU DATANG (MURID)": "NAMA", ... },
  "uncertain": ["ISNIN|WAKTU REHAT (3.00-3.30)"]
}

Peraturan:
- Nama UPPERCASE, 2 guru: "NAMA1 / NAMA2"
- uncertain = slot yang kurang pasti / blur
- Kosongkan "" jika tiada dalam imej
- Jangan cipta kunci baru`;
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { apiKey, imageDataUrl, teacherNames = [] } = JSON.parse(event.body || "{}");
    if (!apiKey) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "API key diperlukan" }) };
    }
    if (!imageDataUrl) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "Imej diperlukan" }) };
    }

    const groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0,
        max_completion_tokens: 4096,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: buildPrompt(teacherNames) },
              { type: "image_url", image_url: { url: imageDataUrl } }
            ]
          }
        ]
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