const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS"
};

const GITHUB_OWNER = "ajamRA";
const GITHUB_REPO = "jadualwaktu";
const GITHUB_FILE = "bertugas-live.json";
const GITHUB_BRANCH = "main";

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
  const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE}?ref=${GITHUB_BRANCH}`;
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "jadualwaktu-netlify"
  };
  const token = process.env.GITHUB_BERTUGAS_TOKEN || process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(apiUrl, { headers, cache: "no-store" });
  if (!res.ok) return null;
  const meta = await res.json();
  if (!meta?.content) return null;
  const json = Buffer.from(meta.content.replace(/\n/g, ""), "base64").toString("utf8");
  const data = JSON.parse(json);
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