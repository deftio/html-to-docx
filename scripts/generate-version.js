#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json
const packagePath = path.resolve(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Extract version info
const version = packageJson.version;
const name = packageJson.name;

// Generate version.js content
const versionContent = `// Auto-generated file - DO NOT EDIT
// Generated from package.json by scripts/generate-version.js

export const VERSION = '${version}';
export const LIBRARY_NAME = '${name}';
export const BUILD_DATE = '${new Date().toISOString()}';

const versionInfo = {
  version: VERSION,
  name: LIBRARY_NAME,
  buildDate: BUILD_DATE
};

export default versionInfo;
`;

// Write to src/version.js
const versionPath = path.resolve(__dirname, '../src/version.js');
fs.writeFileSync(versionPath, versionContent);

console.log(`✅ Generated version.js with version ${version}`);