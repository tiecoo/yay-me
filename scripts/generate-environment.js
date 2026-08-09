const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const outputPath = path.join(__dirname, '..', 'src', 'environments', 'environment.ci.ts');

function getGitValue(command, fallback = '') {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch {
    return fallback;
  }
}

const gitSha = process.env.GIT_SHA || getGitValue('git rev-parse --short HEAD');
const gitBranch = process.env.GIT_BRANCH || getGitValue('git rev-parse --abbrev-ref HEAD');
const buildDate = process.env.BUILD_DATE || new Date().toISOString();
const giphyApiKey = process.env.GIPHY_API_KEY || '';

// read simple .env file fallback for NEW_RELIC_LICENSE_KEY
function getEnvVarFromDotEnv(key) {
  const envPath = path.join(__dirname, '..', '..', '.env');
  if (!fs.existsSync(envPath)) return '';
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const k = trimmed.slice(0, idx).trim();
    const v = trimmed.slice(idx + 1).trim();
    if (k === key) return v;
  }
  return '';
}

const newRelicLicenseKey = process.env.NEW_RELIC_LICENSE_KEY || getEnvVarFromDotEnv('NEW_RELIC_LICENSE_KEY') || '';
const newRelicApplicationId = process.env.NEW_RELIC_APPLICATION_ID || getEnvVarFromDotEnv('NEW_RELIC_APPLICATION_ID') || '';

const contents = `export const environment = {
  production: true,
  newRelicLicenseKey: '${newRelicLicenseKey}',
  newRelicApplicationId: '${newRelicApplicationId}',
  giphyApiKey: '${giphyApiKey}',
  gitSha: '${gitSha}',
  gitBranch: '${gitBranch}',
  buildDate: '${buildDate}'
};
`;

fs.writeFileSync(outputPath, contents, 'utf8');
console.log('Generated environment.ci.ts');
