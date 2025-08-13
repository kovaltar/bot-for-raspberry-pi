import 'dotenv/config';
import fs from 'fs/promises';
// import sitesFromJSON from './sites.json' assert { type: 'json' };
import { sitesMonitor } from './modules/sitesMonitor.js';
import { tg } from './modules/telegram.js';
import { statusStorage } from './modules/sitesStatusStorage';

const {
  TELEGRAM_BOT_TOKEN,
  CHAT_ID,
  SITE_CHECK_MINUTES,
} = process.env;

let sites = [];

try {
  const raw = await fs.readFile(new URL('./sites.json', import.meta.url), 'utf8');

  if (raw.trim()) {
    sites = JSON.parse(raw);
  } else {
    console.warn('⚠️ File sites.json is empty порожній.');
  }

} catch (err) {
  if (err.code === 'ENOENT') {
    console.warn('⚠️ File sites.json was not found.');
  } else {
    console.error('❌ Error while reading sites.json file:', err.message);
  }
}

const statusDescription = [
  'No response',
  'Pending',
  'Success',
  'Redirect',
  'Client Error',
  'Server Error',
];

async function check() {
  const results = await sitesMonitor.ping(sites);
  const previous = await statusStorage.read();

  for (const { site, status, ok } of results) {
    const prev = previous[site];
    const statusInd = (typeof status === 'number')
      ? Math.floor(status / 100)
      : 0;
    const statusText = `${status ?? 'N/A'} : ${statusDescription[statusInd] || 'Unknown'}`;

    if (!prev || prev.ok !== ok) {
      await tg.sendTelegramMessage(
        TELEGRAM_BOT_TOKEN,
        CHAT_ID,
        `${site} | status: ${status} : ${statusDescription[statusInd]} | ${ok ? '🟢 OK' : '🔴 Alert!'}`
        `${site} | status: ${statusText} | ${ok ? '🟢 OK' : '🔴 Alert!'}`
      );
    }
  }

  await statusStorage.write(results);
}

let checkTime = +SITE_CHECK_MINUTES * 60 * 1000;

if (isNaN(checkTime)) {
  checkTime = 5 * 60 * 1000;
  console.error('❌ Некоректне значення SITE_CHECK_MINUTES у .env');
}

check();
setInterval(check, checkTime);