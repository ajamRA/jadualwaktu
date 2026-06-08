const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const GITHUB_OWNER = "ajamRA";
const GITHUB_REPO = "jadualwaktu";
const GITHUB_FILE = "relief-live.json";
const GITHUB_BRANCH = "main";

async function publishToBlobs(payload, context) {
  const { getStore } = require("@netlify/blobs");
  const siteID = context?.site?.id || process.env.SITE_ID || process.env.NETLIFY_SITE_ID;
  const token = context?.blobs || process.env.NETLIFY_BLOB_READ_WRITE_TOKEN;
  const store = siteID && token
    ? getStore({ name: "jadual-relief", siteID, token })
    : getStore("jadual-relief");
  await store.setJSON("live", payload);
}

async function publishToGitHub(payload) {
  const token = process.env.GITHUB_BERTUGAS_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_BERTUGAS_TOKEN belum diset di Netlify (Site settings → Environment variables)");
  }

  const apiBase = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE}`;
  const getRes = await fetch(`${apiBase}?ref=${GITHUB_BRANCH}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "jadualwaktu-netlify"
    }
  });

  let sha;
  if (getRes.ok) {
    const existing = await getRes.json();
    sha = existing.sha;
  } else if (getRes.status !== 404) {
    const err = await getRes.json().catch(() => ({}));
    throw new Error(err.message || `GitHub read gagal (${getRes.status})`);
  }

  const content = Buffer.from(JSON.stringify(payload, null, 2), "utf8").toString("base64");
  const putRes = await fetch(apiBase, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "jadualwaktu-netlify"
    },
    body: JSON.stringify({
      message: `cloud: relief plan ${payload.updatedAt}`,
      content,
      branch: GITHUB_BRANCH,
      ...(sha ? { sha } : {})
    })
  });

  if (!putRes.ok) {
    const err = await putRes.json().catch(() => ({}));
    throw new Error(err.message || `GitHub write gagal (${putRes.status})`);
  }
}

exports.handler = async (event, context) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { reliefPlans, reliefScore = {} } = body;
    if (!reliefPlans || typeof reliefPlans !== "object") {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "reliefPlans diperlukan" }) };
    }

    const payload = {
      version: 1,
      updatedAt: new Date().toISOString(),
      reliefPlans,
      reliefScore
    };

    let blobOk = false;
    try {
      await publishToBlobs(payload, context);
      blobOk = true;
    } catch {
      blobOk = false;
    }

    await publishToGitHub(payload);

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        ok: true,
        updatedAt: payload.updatedAt,
        planCount: Object.keys(reliefPlans).length,
        storage: blobOk ? "blobs+github" : "github"
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message || "Gagal publish relief cloud" })
    };
  }
};