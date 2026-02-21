import fs from 'node:fs/promises';
import path from 'node:path';

const dataDir = path.resolve(process.cwd(), 'server', 'data');
const dataFile = path.resolve(dataDir, 'campaign.json');

const defaultCampaign = {
  schemaVersion: '1.0',
  catalog: [],
  locations: [],
};

await fs.mkdir(dataDir, { recursive: true });

try {
  await fs.access(dataFile);
} catch {
  await fs.writeFile(dataFile, JSON.stringify(defaultCampaign, null, 2), 'utf8');
}

console.log('[server] data prepared:', dataFile);
