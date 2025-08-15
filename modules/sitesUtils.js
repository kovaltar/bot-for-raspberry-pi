// module for sites monitoring utils

import fetch from "node-fetch";
import { AbortController } from "abort-controller";
import { getFilePath } from "../utils/getFilePath.js";
import fs from "fs/promises";

async function ping(sites) {
  const results = [];

  for (const site of sites) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const res = await fetch(`https://${site}`, {
        method: "HEAD",
        signal: controller.signal,
      });

      results.push({ site, status: res.status, ok: res.ok });
    } catch {
      results.push({ site, ok: false });
    } finally {
      clearTimeout(timeout);
    }
  }

  return results;
}

async function getSites() {
  let sitesArr = [];
  const sitesFilePath = getFilePath("../sites.json", import.meta.url);

  try {
    const raw = await fs.readFile(sitesFilePath, "utf8");

    if (raw.trim()) {
      sitesArr = JSON.parse(raw);
    } else {
      console.warn("❌ File sites.json is empty.");
    }
  } catch (err) {
    if (err.code === "ENOENT") {
      console.warn("❌ File sites.json was not found.");
    } else {
      console.error(
        "❌ An error occurred while reading sites.json file:",
        err.message
      );
    }
  }

  return sitesArr;
}

function formatStatus({ site, status, ok }) {
  const statusDescription = [
    "No response",
    "Pending",
    "Success",
    "Redirect",
    "Client Error",
    "Server Error",
  ];

  const statusInd = (typeof status === 'number') ? Math.floor(status / 100) : 0;
  const statusText = `${status ?? 'N/A'} : ${statusDescription[statusInd] || 'Unknown'}`;

  return `${site} | status: ${statusText} | ${ok ? "🟢 OK" : "🔴 Alert!"}`;
}

export const sitesUtils = {
  ping,
  getSites,
  formatStatus,
};
