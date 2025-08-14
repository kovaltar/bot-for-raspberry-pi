import path from 'path';
import { fileURLToPath } from 'url';

export function getFilePath(relPath, baseUrl) {
  const __filename = fileURLToPath(baseUrl);
  const __dirname = path.dirname(__filename);

  return path.join(__dirname, relPath);
}