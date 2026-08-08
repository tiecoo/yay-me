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

const contents = `export const environment = {
  production: true,
  giphyApiKey: '${giphyApiKey}',
  gitSha: '${gitSha}',
  gitBranch: '${gitBranch}',
  buildDate: '${buildDate}'
};
`;

fs.writeFileSync(outputPath, contents, 'utf8');
console.log('Generated environment.ci.ts');
