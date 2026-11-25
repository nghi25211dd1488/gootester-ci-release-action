#!/usr/bin/env node
/**
 * GOOtester Official GitHub Action — Zero-Dependency Node 20 Runner
 * Syncs Android App Bundle (.aab) release lineage with https://gootester.com/api/v1/ci/release
 * and renders a GitHub Actions Job Summary table via GET https://gootester.com/api/v1/ci/status.
 */
import fs from "node:fs";
import crypto from "node:crypto";

function getInput(name, fallback = "") {
  const envKey = `INPUT_${name.replace(/ /g, "_").replace(/-/g, "_").toUpperCase()}`;
  const raw = process.env[envKey] ?? process.env[`INPUT_${name.toUpperCase()}`] ?? fallback;
  return String(raw).trim();
}

function appendOutput(key, value) {
  const outPath = process.env.GITHUB_OUTPUT;
  const safeVal = String(value ?? "").replace(/\r?\n/g, " ");
  if (outPath) {
    fs.appendFileSync(outPath, `${key}=${safeVal}\n`, "utf8");
  }
}

function appendSummary(markdown) {
  const sumPath = process.env.GITHUB_STEP_SUMMARY;
  if (sumPath) {
    fs.appendFileSync(sumPath, `${markdown}\n`, "utf8");
  }
}

function computeFileSha256(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return "";
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

async function run() {
  const apiToken = getInput("api-token");
  const appPackage = getInput("app-package");
  const versionCodeRaw = getInput("version-code");
  const versionName = getInput("version-name");
  const campaignId = getInput("campaign-id");
  const aabPath = getInput("aab-path");
  const releaseNotes = getInput("release-notes");
  const fetchStatus = getInput("fetch-status", "true").toLowerCase() !== "false";
  const apiOrigin = getInput("api-origin", "https://gootester.com").replace(/\/+$/, "");

  if (!apiToken) {
    console.error("::error::Missing required input 'api-token' (create a scoped key in https://dashboard.gootester.com).");
    process.exit(1);
  }
  const versionCode = Number.parseInt(versionCodeRaw, 10);
  if (!appPackage || !Number.isInteger(versionCode) || versionCode <= 0 || !versionName) {
    console.error("::error::Valid 'app-package', positive integer 'version-code', and 'version-name' are required.");
    process.exit(1);
  }

  const aabSha256 = computeFileSha256(aabPath);
  if (aabSha256) {
    appendOutput("aab-sha256", aabSha256);
  }

  const commitSha = (process.env.GITHUB_SHA || "").slice(0, 40);
  const runId = process.env.GITHUB_RUN_ID || String(Date.now());
  const idempotencyKey = `gha-${appPackage}-${versionCode}-${commitSha || runId}`.slice(0, 120);

  const releasePayload = {
    app_package: appPackage,
    version_code: versionCode,
    version_name: versionName,
    ...(campaignId ? { campaign_id: campaignId } : {}),
    ...(releaseNotes ? { release_notes: releaseNotes } : {}),
    ...(aabSha256 ? { aab_sha256: aabSha256 } : {}),
    ...(commitSha ? { commit_sha: commitSha } : {})
  };

  const releaseResp = await fetch(`${apiOrigin}/api/v1/ci/release`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
      "User-Agent": "gootester-ci-release-action/1.0"
    },
    body: JSON.stringify(releasePayload)
  });

  const releaseJson = await releaseResp.json().catch(() => ({}));
  if (!releaseResp.ok || releaseJson.ok === false) {
    const errMsg = releaseJson?.error?.message || releaseJson?.error || `HTTP ${releaseResp.status}`;
    console.error(`::error::GOOtester CI release sync failed: ${errMsg}`);
    process.exit(1);
  }

  const resolvedCampaignId = releaseJson?.campaign_id || releaseJson?.data?.campaign_id || campaignId;
  const recordedReleaseId = releaseJson?.release?.id || releaseJson?.data?.release_id || "";
  appendOutput("campaign-id", resolvedCampaignId);
  appendOutput("release-id", recordedReleaseId);

  let statusData = null;
  if (fetchStatus) {
    const qs = new URLSearchParams();
    if (resolvedCampaignId) qs.set("campaign_id", resolvedCampaignId);
    if (appPackage) qs.set("app_package", appPackage);
    const statusResp = await fetch(`${apiOrigin}/api/v1/ci/status?${qs.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "User-Agent": "gootester-ci-release-action/1.0"
      }
    });
    if (statusResp.ok) {
      statusData = await statusResp.json().catch(() => null);
    }
  }

  const observedDays =
    statusData?.service_clock?.observed_days ??
    statusData?.data?.service_clock?.observed_days ??
    "pending_setup";
  appendOutput("observed-service-days", observedDays);

  const summaryLines = [
    "### GOOtester Android Closed Testing Release Synced",
    "",
    "| Field | Value |",
    "| :--- | :--- |",
    `| **Android Package** | \`${appPackage}\` |`,
    `| **Release Version** | \`${versionName}\` (\`versionCode ${versionCode}\`) |`,
    `| **AAB SHA-256** | \`${aabSha256 || "not_provided"}\` |`,
    `| **Observed Service Clock** | \`${observedDays}\` (Google Play Console tracks official 14-day continuity separately) |`,
    "",
    "- Manage campaign & Production Access kit: https://dashboard.gootester.com",
    "- Stack release playbooks: https://gootester.com/frameworks",
    "- Play Console error diagnostics: https://gootester.com/errors",
    "- Free closed testing calculators: https://gootester.com/tools"
  ];
  appendSummary(summaryLines.join("\n"));
  console.log(`Synced ${appPackage} v${versionName} (${versionCode}) with GOOtester.`);
}

run().catch((err) => {
  console.error(`::error::Unexpected failure in gootester-ci-release-action: ${err?.message || err}`);
  process.exit(1);
});
