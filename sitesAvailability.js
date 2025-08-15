import "dotenv/config";
import { sitesUtils } from "./modules/sitesUtils.js";
import { tg } from "./modules/telegram.js";

const { TG_BOT_TOKEN, TG_CHAT_ID, SITE_CHECK_MINUTES } = process.env;
const sites = await sitesUtils.getSites();

async function check() {
  const sitesInfo = await sitesUtils.ping(sites);
  const previousInfo = await sitesUtils.readStatuses();

  for (const { site, status, ok } of sitesInfo) {
    const prev = previousInfo[site];

    if (!prev || prev.ok !== ok) {
      await tg.sendTelegramMessage(
        TG_BOT_TOKEN,
        TG_CHAT_ID,
        sitesUtils.formatStatus({ site, status, ok })
      );
    }
  }

  await sitesUtils.writeStatuses(sitesInfo);
}

let checkTime = +SITE_CHECK_MINUTES * 60 * 1000;

if (isNaN(checkTime)) {
  checkTime = 5 * 60 * 1000;
  console.error("❌ Incorrect value of SITE_CHECK_MINUTES in .env");
}

check();
setInterval(check, checkTime);
