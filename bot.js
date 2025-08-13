import 'dotenv/config';
import { Bot } from 'grammy';
import { ip } from './modules/ip.js';
import { temperature } from './modules/temperature.js';
import sitesFromJSON from './sites.json' assert { type: 'json' };
import { sitesMonitor } from './modules/sitesMonitor.js';

const { TELEGRAM_BOT_TOKEN } = process.env;

// bot initialization
const bot = new Bot(TELEGRAM_BOT_TOKEN);

// /ip — shows public IP address
bot.command('ip', async (ctx) => {
  try {
    const currentIP = await ip.getPublicIP();
    await ctx.reply(`Поточний IP: ${currentIP}`);
  } catch (err) {
    console.error('Помилка при отриманні IP:', err.message);
    await ctx.reply('Не вдалося отримати IP-адресу.');
  }
});

// /t — shows CPU temperature
bot.command('t', (ctx) => {
  const temp = temperature.getTemperature();
  if (temp !== null) {
    ctx.reply(`Температура CPU: ${temp}°C`);
  } else {
    ctx.reply('Не вдалося зчитати температуру.');
  }
});

// /status — shows sites availability
bot.command('status', async (ctx) => {
  const sites = sitesFromJSON || [];

  if (!sites.length) {
    return ctx.reply('Немає сайтів для перевірки.');
  }

  try {
    const sitesInfo = await sitesMonitor.ping(sites);
    const statusDescription = [
      'No response',
      'Pending',
      'Success',
      'Redirect',
      'Client Error',
      'Server Error',
    ];

    let msg = '';

    for (const { site, status, ok } of sitesInfo) {
      const statusInd = (typeof status === 'number') ? Math.floor(status / 100) : 0;
      const statusText = `${status ?? 'N/A'} : ${statusDescription[statusInd] || 'Unknown'}`;

      msg += `${site} | status: ${statusText} | ${ok ? '🟢 OK' : '🔴 Alert!'}\n`
    }

    await ctx.reply(msg);
  } catch (err) {
    console.error('Помилка при перевірці статусу сайтів:', err.message);

    await ctx.reply('❌ Не вдалося перевірити статус сайтів.');
  }
});

bot.start();