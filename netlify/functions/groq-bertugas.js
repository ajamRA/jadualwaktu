const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function buildPrompt(teacherNames) {
  const rows = [
    "PAGAR WAKTU DATANG (MURID)",
    "PAGAR (12.20 TENGAH HARI)",
    "KETUA BERTUGAS DI DEWAN (12.30 TENGAH HARI)",
    "WAKTU REHAT (3.00-3.30)",
    "WAKTU REHAT (3.30-4.00)",
    "WAKTU BALIK (6.30 PETANG)",
    "KAWALAN MURID (6.00 PETANG)",
    "TUGAS KHAS"
  ];
  const days = ["ISNIN", "SELASA", "RABU", "KHAMIS", "JUMAAT"];
  const footer = ["BUKU LAPORAN BERTUGAS", "LAPORAN BERTUGAS&NILAI MURNI", "RMT/KANTIN"];
  const keys = [];
  for (const row of rows) for (const day of days) keys.push(`${day}|${row}`);
  for (const row of footer) keys.push(`ALL|${row}`);

  return `Baca imej JADUAL BERTUGAS sekolah Malaysia ini. Ekstrak nama guru untuk setiap slot.

Hari: ISNIN, SELASA, RABU, KHAMIS, JUMAAT
Kunci assignment (guna tepat):
${keys.map((k) => `- ${k}`).join("\n")}

Senarai guru dikenali (padankan nama jika boleh): ${teacherNames.join(", ")}

Return JSON sahaja:
{
  "weekStart": "YYYY-MM-DD atau kosong",
  "weekEnd": "YYYY-MM-DD atau kosong",
  "assignments": {
    "ISNIN|PAGAR WAKTU DATANG (MURID)": "NAMA",
    "ALL|BUKU LAPORAN BERTUGAS": "NAMA"
  }
}

Peraturan:
- Nama UPPERCASE
- Dua guru guna " / " contoh: "SARINAH / ABDULLAH"
- Jika tidak boleh baca, guna string kosong ""
- Jangan tambah kunci selain senarai di atas`;
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
        temperature: 0.1,
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