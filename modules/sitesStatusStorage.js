import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FILE = path.join(__dirname, '../data/sites-status.json');

async function read() {
  try {
    const data = await fs.readFile(FILE, 'utf8');

    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function write(results) {
  const statusMap = {};

  for (const { site, ok, status } of results) {
    statusMap[site] = { ok, status };
  }

  await fs.writeFile(FILE, JSON.stringify(statusMap, null, 2), 'utf8');
}

export const statusStorage = {
  read,
  write,
};
