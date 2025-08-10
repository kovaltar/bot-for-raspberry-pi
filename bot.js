import 'dotenv/config';
import { Bot } from 'grammy';
import { ip } from './modules/ip.js';
import { temperature } from './modules/temperature.js';

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

bot.start();