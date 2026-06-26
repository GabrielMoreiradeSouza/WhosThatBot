const fs = require('fs');
const path = require('path');

const SCORES_FILE = path.resolve('data/scores.json');
let mutex = Promise.resolve();

function withMutex(fn) {
  return mutex = mutex.then(fn, fn);
}

function ensureDir() {
  const dir = path.dirname(SCORES_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadScores() {
  ensureDir();
  try {
    const raw = fs.readFileSync(SCORES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveScores(scores) {
  ensureDir();
  fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));
}

async function awardPoints(guildId, userId, username) {
  return withMutex(() => {
    const scores = loadScores();
    if (!scores[guildId]) scores[guildId] = {};
    if (!scores[guildId][userId]) {
      scores[guildId][userId] = { username, totalPoints: 0, totalHits: 0 };
    }
    const entry = scores[guildId][userId];
    entry.username = username;
    entry.totalPoints += 1;
    entry.totalHits += 1;
    saveScores(scores);
    return { totalHits: entry.totalHits };
  });
}

module.exports = { loadScores, saveScores, awardPoints };
