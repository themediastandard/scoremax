import { execFileSync } from 'node:child_process';
import { realpathSync } from 'node:fs';

const mode = process.argv[2] === 'build' ? 'build' : 'dev';
const projectRoot = realpathSync(process.cwd());
const ports = [3000, 3001];

function run(command, args) {
  try {
    return execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

function listeningPids(port) {
  const output = run('lsof', [`-tiTCP:${port}`, '-sTCP:LISTEN']);
  return output ? output.split(/\s+/).filter(Boolean) : [];
}

function cwdForPid(pid) {
  const output = run('lsof', ['-a', '-p', pid, '-d', 'cwd', '-Fn']);
  const cwdLine = output.split('\n').find((line) => line.startsWith('n'));
  if (!cwdLine) return null;

  try {
    return realpathSync(cwdLine.slice(1));
  } catch {
    return cwdLine.slice(1);
  }
}

const conflicts = [];

for (const port of ports) {
  for (const pid of listeningPids(port)) {
    if (cwdForPid(pid) === projectRoot) {
      conflicts.push({ port, pid });
    }
  }
}

if (conflicts.length) {
  const list = conflicts.map(({ port, pid }) => `port ${port} pid ${pid}`).join(', ');
  const action = mode === 'build'
    ? 'Stop the dev server before building. Dev and build both write to .next.'
    : 'Stop the existing dev server before starting another one.';

  console.error(`Refusing to continue: ScoreMax already has a Next server running (${list}).`);
  console.error(action);
  process.exit(1);
}
