const { getStore } = require("@netlify/blobs");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { bertugasMap, week, referenceImages = [] } = body;
    if (!bertugasMap || typeof bertugasMap !== "object") {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "bertugasMap diperlukan" }) };
    }

    const safeImages = Array.isArray(referenceImages)
      ? referenceImages.slice(0, 1).filter((img) => img?.dataUrl && img.dataUrl.length < 1_800_000)
      : [];

    const payload = {
      version: 1,
      updatedAt: new Date().toISOString(),
      week: week || null,
      bertugasMap,
      referenceImages: safeImages
    };

    const store = getStore("jadual-bertugas");
    await store.setJSON("live", payload);

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true, updatedAt: payload.updatedAt, hasImage: safeImages.length > 0 })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message || "Gagal publish cloud" })
    };
  }
};