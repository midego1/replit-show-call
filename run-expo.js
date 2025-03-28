// This script is used to run the Expo app in Replit
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting Expo in web mode...');

try {
  // Change to mobile directory
  process.chdir(path.join(__dirname, 'mobile'));
  console.log('Changed to mobile directory');
  
  // Run Expo
  console.log('Running expo start --web...');
  execSync('npx expo start --web', { stdio: 'inherit' });
} catch (error) {
  console.error('Error running Expo:', error.message);
  process.exit(1);
}