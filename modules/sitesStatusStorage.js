import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sitesStatusFilePath = path.join(__dirname, '../data/sites-status.json');

async function readStatuses() {
  try {
    const data = await fs.readFile(sitesStatusFilePath, 'utf8');

    return JSON.parse(data);
  } catch {
    console.error("❌ An error occurred while reading data/sites-status.json file:", err.message);
  }
}

async function writeStatuses(results) {
  const statusMap = {};

  for (const { site, ok, status } of results) {
    statusMap[site] = { ok, status };
  }

  await fs.writeFile(sitesStatusFilePath, JSON.stringify(statusMap, null, 2), 'utf8');
}

export const statusStorage = {
  readStatuses,
  writeStatuses,
};
