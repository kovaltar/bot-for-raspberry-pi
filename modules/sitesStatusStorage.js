import { getFilePath } from "../utils/getFilePath.js";
import fs from "fs/promises";

const sitesStatusFilePath = getFilePath(
  "../data/sites-status.json",
  import.meta.url
);

async function readStatuses() {
  try {
    const data = await fs.readFile(sitesStatusFilePath, "utf8");

    return JSON.parse(data);
  } catch {
    console.error(
      "❌ An error occurred while reading data/sites-status.json file:",
      err.message
    );
  }
}

async function writeStatuses(results) {
  const statusMap = {};

  for (const { site, ok, status } of results) {
    statusMap[site] = { ok, status };
  }

  await fs.writeFile(
    sitesStatusFilePath,
    JSON.stringify(statusMap, null, 2),
    "utf8"
  );
}

export const statusStorage = {
  readStatuses,
  writeStatuses,
};
