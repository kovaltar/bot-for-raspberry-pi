import 'dotenv/config';
import { ip } from './modules/ip.js';
import { tg } from './modules/telegram.js';

const {
  TELEGRAM_BOT_TOKEN,
  CHAT_ID,
  CF_API_TOKEN,
  ZONE_ID,
  RECORD_ID,
  IP_CHECK_MINUTES,
} = process.env;

// IP check and IP update function
async function checkAndUpdateIP() {
  try {
    const currentIP = await ip.getPublicIP();
    const lastIP = ip.readLastIP();

    if (currentIP !== lastIP) {
      const now = new Date().toLocaleString();

      await tg.sendTelegramMessage(
        TELEGRAM_BOT_TOKEN,
        CHAT_ID,
        `🔄 Зміна IP (${now}):\n${lastIP || 'невідомо'} ➝ ${currentIP}`
      );

      await ip.updateCloudflare(currentIP, { CF_API_TOKEN, ZONE_ID, RECORD_ID });

      ip.saveCurrentIP(currentIP);
      console.log(`[IP-UPDATE] IP оновлено: ${currentIP}`);
    } else {
      console.log(`[IP-UPDATE] IP не змінився: ${currentIP}`);
    }
  } catch (err) {
    console.error('[IP-UPDATE] Помилка:', err.message);
    await tg.sendTelegramMessage(
      TELEGRAM_BOT_TOKEN,
      CHAT_ID,
      `❌ Помилка під час перевірки IP:\n${err.message}`
    );
  }
}

let checkTime = +IP_CHECK_MINUTES * 60 * 1000;

if (isNaN(checkTime)) {
  checkTime = 5 * 60 * 1000;
  console.error('❌ Некоректне значення IP_CHECK_MINUTES у .env');
}

checkAndUpdateIP();
setInterval(checkAndUpdateIP, checkTime);
