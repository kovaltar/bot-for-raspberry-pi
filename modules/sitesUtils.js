// module for sites monitoring

import fetch from 'node-fetch';
import { AbortController } from 'abort-controller';

async function ping(sites) {
  const results = [];

  for (const site of sites) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const res = await fetch(`https://${site}`, {
        method: 'HEAD',
        signal: controller.signal
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
  
  try {
    const raw = await fs.readFile(
      new URL("../sites.json", import.meta.url),
      "utf8"
    );
  
    if (raw.trim()) {
      sitesArr = JSON.parse(raw);
    } else {
      console.warn("⚠️ File sites.json is empty порожній.");
    }
  } catch (err) {
    if (err.code === "ENOENT") {
      console.warn("⚠️ File sites.json was not found.");
    } else {
      console.error("❌ Error while reading sites.json file:", err.message);
    }
  }

  return sitesArr;
}

export const sitesUtils = {
  ping,
  getSites,
};