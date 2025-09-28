#!/usr/bin/env node

/**
 * 🚨 PRE-COMMIT PORT 3000 ENFORCEMENT
 * 
 * This script runs before every commit to ensure:
 * 1. No environment files contain ports other than 3000
 * 2. Package.json scripts use port 3000
 * 3. Next.config.ts enforces port 3000
 * 
 * Usage: node scripts/pre-commit-port-check.js
 */

import fs from 'fs';

const REQUIRED_PORT = 3000;
const FORBIDDEN_PORTS = [3001, 3002, 3003, 4000, 5000, 8000, 8080];

console.log(`🔍 Pre-commit check: Ensuring port ${REQUIRED_PORT} enforcement...`);

// Files to check
const filesToCheck = [
  'package.json',
  'next.config.ts',
  '.env.example',
  'env.template'
];

// Check if file contains forbidden ports
function checkFileForForbiddenPorts(filePath) {
  if (!fs.existsSync(filePath)) {
    return { hasErrors: false, errors: [] };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const errors = [];
  
  FORBIDDEN_PORTS.forEach(port => {
    if (content.includes(`:${port}`) || content.includes(`PORT=${port}`) || content.includes(`--port ${port}`)) {
      errors.push(`File ${filePath} contains forbidden port ${port}`);
    }
  });
  
  return { hasErrors: errors.length > 0, errors };
}

// Check package.json scripts
function checkPackageJson() {
  const packagePath = 'package.json';
  if (!fs.existsSync(packagePath)) {
    return { hasErrors: false, errors: [] };
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const errors = [];
  
  Object.entries(packageJson.scripts || {}).forEach(([scriptName, scriptCommand]) => {
    if (typeof scriptCommand === 'string') {
      FORBIDDEN_PORTS.forEach(port => {
        if (scriptCommand.includes(`:${port}`) || scriptCommand.includes(`--port ${port}`)) {
          errors.push(`Script "${scriptName}" in package.json uses forbidden port ${port}`);
        }
      });
      
      // Check if dev/start scripts don't explicitly use port 3000
      // Exception: dev:safe script calls other scripts that already have port enforcement
      if ((scriptName.includes('dev') || scriptName.includes('start')) && 
          !scriptCommand.includes(`--port ${REQUIRED_PORT}`) && 
          !scriptCommand.includes(`PORT=${REQUIRED_PORT}`) &&
          !scriptName.includes('safe') && // dev:safe is allowed as it calls other scripts
          !scriptCommand.includes('port-check')) { // scripts that call port-check are allowed
        errors.push(`Script "${scriptName}" should explicitly use port ${REQUIRED_PORT}`);
      }
    }
  });
  
  return { hasErrors: errors.length > 0, errors };
}

// Main check function
function runPreCommitCheck() {
  let hasErrors = false;
  let allErrors = [];
  
  console.log('📋 Checking package.json scripts...');
  const packageCheck = checkPackageJson();
  if (packageCheck.hasErrors) {
    hasErrors = true;
    allErrors.push(...packageCheck.errors);
  }
  
  console.log('📋 Checking configuration files...');
  filesToCheck.forEach(file => {
    const check = checkFileForForbiddenPorts(file);
    if (check.hasErrors) {
      hasErrors = true;
      allErrors.push(...check.errors);
    }
  });
  
  if (hasErrors) {
    console.error('❌ PRE-COMMIT CHECK FAILED!');
    console.error('🚨 Found forbidden port configurations:');
    allErrors.forEach(error => console.error(`   - ${error}`));
    console.error('');
    console.error('🔧 To fix:');
    console.error(`   1. Ensure all scripts use --port ${REQUIRED_PORT}`);
    console.error(`   2. Set PORT=${REQUIRED_PORT} in environment files`);
    console.error(`   3. Remove any references to ports: ${FORBIDDEN_PORTS.join(', ')}`);
    process.exit(1);
  }
  
  console.log('✅ Pre-commit check passed!');
  console.log(`✅ All configurations enforce port ${REQUIRED_PORT}`);
}

// Run the check
runPreCommitCheck();
