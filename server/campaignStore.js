import fs from 'node:fs/promises';
import path from 'node:path';

const defaultCampaign = {
  schemaVersion: '1.0',
  catalog: [],
  locations: [],
};

const dataDir = path.resolve(process.cwd(), 'server', 'data');
const dataFile = path.resolve(dataDir, 'campaign.json');

async function ensureDataFile() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, JSON.stringify(defaultCampaign, null, 2), 'utf8');
  }
}

export async function readCampaign() {
  await ensureDataFile();
  const raw = await fs.readFile(dataFile, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return defaultCampaign;
    }
    return {
      schemaVersion: parsed.schemaVersion ?? '1.0',
      catalog: Array.isArray(parsed.catalog) ? parsed.catalog : [],
      locations: Array.isArray(parsed.locations) ? parsed.locations : [],
    };
  } catch {
    return defaultCampaign;
  }
}

export async function writeCampaign(campaign) {
  await ensureDataFile();
  await fs.writeFile(dataFile, JSON.stringify(campaign, null, 2), 'utf8');
}
