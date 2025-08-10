// module for sending messages via Telegram

import fetch from 'node-fetch';

async function sendTelegramMessage(token, chatId, message) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message }),
  });

  if (!res.ok) {
    const errText = await res.text();

    throw new Error(`Telegram API error (${res.status}): ${errText}`);
  }

  return res.json();
}

export const tg = {
  sendTelegramMessage,
};
