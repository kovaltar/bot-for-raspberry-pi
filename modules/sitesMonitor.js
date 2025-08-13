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

export const sitesMonitor = {
  ping,
};