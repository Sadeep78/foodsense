import { spawn } from 'child_process';
import path from 'path';

console.log('====================================================');
console.log('  FoodSense — Demand & Food Waste Analytics System');
console.log('====================================================');

const isWindows = process.platform === 'win32';
const backendCmd = 'python';
const backendArgs = ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '8000', '--reload'];

console.log('[Runner] Starting Backend on http://localhost:8000 ...');
const backend = spawn(backendCmd, backendArgs, {
  cwd: path.resolve('backend'),
  stdio: 'inherit',
  shell: isWindows,
});

const npmCmd = isWindows ? 'npm.cmd' : 'npm';
console.log('[Runner] Starting Frontend on http://localhost:5173 ...');
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.resolve('frontend'),
  stdio: 'inherit',
  shell: isWindows,
});

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
