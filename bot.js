import "dotenv/config";
import { Bot } from "grammy";
import { ip } from "./modules/ip.js";
import { temperature } from "./modules/temperature.js";
import { sitesUtils } from "./modules/sitesUtils.js";

const { TG_BOT_TOKEN } = process.env;

// bot initialization
const bot = new Bot(TG_BOT_TOKEN);

// /ip — shows public IP address
bot.command("ip", async (ctx) => {
  try {
    const currentIP = await ip.getPublicIP();
    await ctx.reply(`Current IP: ${currentIP}`);
  } catch (err) {
    console.error("❌ An error occurred while getting an IP:", err.message);
    await ctx.reply("❌ Failed to get IP address.");
  }
});

// /t — shows CPU temperature
bot.command("t", (ctx) => {
  const temp = temperature.getTemperature();
  if (temp !== null) {
    ctx.reply(`CPU temperature: ${temp}°C`);
  } else {
    ctx.reply("❌ Failed to get temperature.");
  }
});

// /status — shows sites availability
bot.command("status", async (ctx) => {
  const sites = await sitesUtils.getSites();

  if (!sites.length) {
    return ctx.reply("❌ No sites to check.");
  }

  try {
    const sitesInfo = await sitesUtils.ping(sites);
    const statusDescription = [
      "No response",
      "Pending",
      "Success",
      "Redirect",
      "Client Error",
      "Server Error",
    ];

    let msg = "";

    for (const { site, status, ok } of sitesInfo) {
      const statusInd =
        typeof status === "number" ? Math.floor(status / 100) : 0;
      const statusText = `${status ?? "N/A"} : ${
        statusDescription[statusInd] || "Unknown"
      }`;

      msg += `${site} | status: ${statusText} | ${
        ok ? "🟢 OK" : "🔴 Alert!"
      }\n`;
    }

    await ctx.reply(msg);
  } catch (err) {
    console.error("❌ An error occurred while checking sites status:", err.message);

    await ctx.reply("❌ Failed to check sites status.");
  }
});

bot.start();
