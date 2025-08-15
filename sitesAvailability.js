import "dotenv/config";
import { sitesUtils } from "./modules/sitesUtils.js";
import { tg } from "./modules/telegram.js";
import { statusStorage } from "./modules/sitesStatusStorage.js";

const { TG_BOT_TOKEN, TG_CHAT_ID, SITE_CHECK_MINUTES } = process.env;
const sites = await sitesUtils.getSites();

async function check() {
  const results = await sitesUtils.ping(sites);
  const previous = await statusStorage.readStatuses();

  for (const { site, status, ok } of results) {
    const prev = previous[site];

    if (!prev || prev.ok !== ok) {
      await tg.sendTelegramMessage(
        TG_BOT_TOKEN,
        TG_CHAT_ID,
        sitesUtils.formatStatus({ site, status, ok })
      );
    }
  }

  await statusStorage.writeStatuses(results);
}

let checkTime = +SITE_CHECK_MINUTES * 60 * 1000;

if (isNaN(checkTime)) {
  checkTime = 5 * 60 * 1000;
  console.error("❌ Incorrect value of SITE_CHECK_MINUTES in .env");
}

check();
setInterval(check, checkTime);
