// module for working with IP and Cloudflare

import fs from 'fs';
import path from 'path';
import https from 'https';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const IP_FILE = path.join(__dirname, '../last_ip.txt');

// gets a public IP address from the ipify service
function getPublicIP() {
  return new Promise((resolve, reject) => {
    https.get('https://api.ipify.org', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data.trim()));
    }).on('error', reject);
  });
}

// reads the last saved IP from a file
function readLastIP() {
  try {
    return fs.readFileSync(IP_FILE, 'utf8').trim();
  } catch {
    return null;
  }
}

// saves the current IP to a file
function saveCurrentIP(ip) {
  fs.writeFileSync(IP_FILE, ip, 'utf8');
}

// updates the IP address in the DNS record via the Cloudflare API
async function updateCloudflare(ip, { CF_API_TOKEN, ZONE_ID, RECORD_ID }) {
  const url = `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${RECORD_ID}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'A',
      name: process.env.DNS_RECORD_NAME,
      content: ip,
      ttl: 1,
      proxied: true,
    }),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(`Cloudflare update failed: ${JSON.stringify(result.errors)}`);
  }

  return result;
}

export const ip = {
  getPublicIP,
  readLastIP,
  saveCurrentIP,
  updateCloudflare,
};