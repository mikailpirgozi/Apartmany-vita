#!/usr/bin/env node

/**
 * 🚨 PORT 3000 ENFORCEMENT SCRIPT
 * 
 * This script ensures that:
 * 1. Port 3000 is available
 * 2. If port 3000 is occupied, it kills the process using it
 * 3. Application ALWAYS runs on port 3000
 * 
 * Usage: node scripts/port-checker.js
 */

import { exec } from 'child_process';
import net from 'net';

const REQUIRED_PORT = 3000;

console.log(`🔍 Checking if port ${REQUIRED_PORT} is available...`);

// Function to check if port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(false); // Port is available
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(true); // Port is in use
    });
  });
}

// Function to kill process using port
function killProcessOnPort(port) {
  return new Promise((resolve) => {
    const command = process.platform === 'win32' 
      ? `netstat -ano | findstr :${port}`
      : `lsof -ti:${port}`;
    
    exec(command, (error, stdout) => {
      if (error) {
        console.log(`✅ Port ${port} is not in use by any process.`);
        resolve();
        return;
      }
      
      const lines = stdout.trim().split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        console.log(`✅ Port ${port} is not in use by any process.`);
        resolve();
        return;
      }
      
      console.log(`🚨 Port ${port} is occupied! Killing processes...`);
      
      if (process.platform === 'win32') {
        // Windows: Extract PID from netstat output
        const pids = lines.map(line => {
          const parts = line.trim().split(/\s+/);
          return parts[parts.length - 1];
        }).filter(pid => pid && !isNaN(pid));
        
        if (pids.length === 0) {
          console.log(`✅ No processes found using port ${port}.`);
          resolve();
          return;
        }
        
        const killCommand = `taskkill /F /PID ${pids.join(' /PID ')}`;
        exec(killCommand, (killError) => {
          if (killError) {
            console.log(`⚠️  Could not kill processes on port ${port}: ${killError.message}`);
          } else {
            console.log(`✅ Successfully killed processes using port ${port}.`);
          }
          resolve();
        });
      } else {
        // Unix/Linux/macOS: Use lsof output directly
        const pids = lines.map(line => line.trim()).filter(pid => pid && !isNaN(pid));
        
        if (pids.length === 0) {
          console.log(`✅ No processes found using port ${port}.`);
          resolve();
          return;
        }
        
        const killCommand = `kill -9 ${pids.join(' ')}`;
        exec(killCommand, (killError) => {
          if (killError) {
            console.log(`⚠️  Could not kill processes on port ${port}: ${killError.message}`);
          } else {
            console.log(`✅ Successfully killed processes using port ${port}.`);
          }
          resolve();
        });
      }
    });
  });
}

// Main function
async function enforcePort3000() {
  try {
    const portInUse = await isPortInUse(REQUIRED_PORT);
    
    if (portInUse) {
      console.log(`🚨 Port ${REQUIRED_PORT} is currently in use!`);
      await killProcessOnPort(REQUIRED_PORT);
      
      // Wait a moment for processes to be killed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check again
      const stillInUse = await isPortInUse(REQUIRED_PORT);
      if (stillInUse) {
        console.error(`❌ Failed to free port ${REQUIRED_PORT}. Please manually kill the process.`);
        process.exit(1);
      }
    }
    
    console.log(`✅ Port ${REQUIRED_PORT} is now available!`);
    console.log(`🚀 Application can now start on port ${REQUIRED_PORT}.`);
    
  } catch (error) {
    console.error(`❌ Error checking port ${REQUIRED_PORT}:`, error.message);
    process.exit(1);
  }
}

// Run the script
enforcePort3000();
