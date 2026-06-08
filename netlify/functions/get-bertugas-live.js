const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS"
};

const RAW_URL = "https://raw.githubusercontent.com/ajamRA/jadualwaktu/main/bertugas-live.json";

async function readFromBlobs(context) {
  try {
    const { getStore } = require("@netlify/blobs");
    const siteID = context?.site?.id || process.env.SITE_ID || process.env.NETLIFY_SITE_ID;
    const token = context?.blobs || process.env.NETLIFY_BLOB_READ_WRITE_TOKEN;
    const store = siteID && token
      ? getStore({ name: "jadual-bertugas", siteID, token })
      : getStore("jadual-bertugas");
    return await store.get("live", { type: "json" });
  } catch {
    return null;
  }
}

async function readFromGitHub() {
  const res = await fetch(`${RAW_URL}?t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.bertugasMap || !data.updatedAt) return null;
  if (!Object.keys(data.bertugasMap).length) return null;
  return data;
}

exports.handler = async (event, context) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    let data = await readFromBlobs(context);
    if (!data) data = await readFromGitHub();
    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify(data || null)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message || "Gagal baca cloud" })
    };
  }
};