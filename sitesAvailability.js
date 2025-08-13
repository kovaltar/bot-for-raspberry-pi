import "dotenv/config";
import { sitesUtils } from "./modules/sitesUtils.js";
import { tg } from "./modules/telegram.js";
import { statusStorage } from "./modules/sitesStatusStorage.js";

const { TELEGRAM_BOT_TOKEN, CHAT_ID, SITE_CHECK_MINUTES } = process.env;
const sites = sitesUtils.getSites();
const statusDescription = [
  "No response",
  "Pending",
  "Success",
  "Redirect",
  "Client Error",
  "Server Error",
];

async function check() {
  const results = await sitesUtils.ping(sites);
  const previous = await statusStorage.read();

  for (const { site, status, ok } of results) {
    const prev = previous[site];
    const statusInd = typeof status === "number" ? Math.floor(status / 100) : 0;
    const statusText = `${status ?? "N/A"} : ${
      statusDescription[statusInd] || "Unknown"
    }`;

    if (!prev || prev.ok !== ok) {
      await tg.sendTelegramMessage(
        TELEGRAM_BOT_TOKEN,
        CHAT_ID,
        `${site} | status: ${status} : ${statusDescription[statusInd]} | ${
          ok ? "🟢 OK" : "🔴 Alert!"
        }``${site} | status: ${statusText} | ${ok ? "🟢 OK" : "🔴 Alert!"}`
      );
    }
  }

  await statusStorage.write(results);
}

let checkTime = +SITE_CHECK_MINUTES * 60 * 1000;

if (isNaN(checkTime)) {
  checkTime = 5 * 60 * 1000;
  console.error("❌ Некоректне значення SITE_CHECK_MINUTES у .env");
}

check();
setInterval(check, checkTime);
