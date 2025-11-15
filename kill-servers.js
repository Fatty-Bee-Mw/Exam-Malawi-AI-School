#!/usr/bin/env node

/**
 * Server Kill Script for Windows
 * Kills all running servers on common ports to ensure clean startup
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Common development ports
const PORTS = [
  3000, // Create React App default
  3001, // API server
  5000, // Flask/Express
  5173, // Vite
  4173, // Vite preview
  8000, // Python/Django
  8080, // Alternative HTTP
  8888, // Jupyter
];

const isWindows = process.platform === 'win32';

/**
 * Kill process on a specific port (Windows)
 */
async function killPortWindows(port) {
  try {
    // Find process using the port
    const { stdout } = await execPromise(`netstat -ano | findstr :${port}`);
    
    if (!stdout) {
      console.log(`✓ Port ${port} is free`);
      return;
    }

    // Extract PIDs from netstat output
    const lines = stdout.split('\n');
    const pids = new Set();
    
    lines.forEach(line => {
      const match = line.match(/\s+(\d+)\s*$/);
      if (match) {
        pids.add(match[1]);
      }
    });

    // Kill each PID
    for (const pid of pids) {
      try {
        await execPromise(`taskkill /F /PID ${pid}`);
        console.log(`✓ Killed process ${pid} on port ${port}`);
      } catch (error) {
        // Process might already be dead
        if (!error.message.includes('not found')) {
          console.warn(`⚠ Could not kill PID ${pid}: ${error.message}`);
        }
      }
    }
  } catch (error) {
    // Port is likely free
    if (!error.message.includes('not found')) {
      console.log(`✓ Port ${port} is free`);
    }
  }
}

/**
 * Kill process on a specific port (Unix/Mac)
 */
async function killPortUnix(port) {
  try {
    const { stdout } = await execPromise(`lsof -ti:${port}`);
    
    if (!stdout.trim()) {
      console.log(`✓ Port ${port} is free`);
      return;
    }

    const pids = stdout.trim().split('\n');
    
    for (const pid of pids) {
      try {
        await execPromise(`kill -9 ${pid}`);
        console.log(`✓ Killed process ${pid} on port ${port}`);
      } catch (error) {
        console.warn(`⚠ Could not kill PID ${pid}: ${error.message}`);
      }
    }
  } catch (error) {
    console.log(`✓ Port ${port} is free`);
  }
}

/**
 * Kill all Node.js processes (except current process)
 */
async function killAllNodeProcesses() {
  try {
    if (isWindows) {
      // Get current process ID to avoid killing ourselves during the script
      const currentPid = process.pid;
      
      // Try to kill node processes
      try {
        const { stdout } = await execPromise('tasklist /FI "IMAGENAME eq node.exe" /FO CSV /NH');
        
        if (stdout && stdout.includes('node.exe')) {
          // Parse and kill each node process except current one
          const lines = stdout.split('\n');
          let killedCount = 0;
          
          for (const line of lines) {
            const match = line.match(/"node\.exe","(\d+)"/);
            if (match) {
              const pid = match[1];
              if (parseInt(pid) !== currentPid) {
                try {
                  await execPromise(`taskkill /F /PID ${pid}`);
                  killedCount++;
                } catch (e) {
                  // Process might have already exited
                }
              }
            }
          }
          
          if (killedCount > 0) {
            console.log(`✓ Killed ${killedCount} Node.js process(es)`);
          } else {
            console.log('✓ No other Node.js processes to kill');
          }
        } else {
          console.log('✓ No Node.js processes to kill');
        }
      } catch (error) {
        console.log('✓ No Node.js processes to kill');
      }
    } else {
      await execPromise('pkill -9 node');
      console.log('✓ Killed all Node.js processes');
    }
  } catch (error) {
    // No Node processes running
    console.log('✓ No Node.js processes to kill');
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔄 Starting server cleanup...\n');
  
  const killPort = isWindows ? killPortWindows : killPortUnix;
  
  // Kill processes on specific ports
  for (const port of PORTS) {
    await killPort(port);
  }
  
  console.log('\n🔄 Killing all Node.js processes...\n');
  await killAllNodeProcesses();
  
  console.log('\n✅ Server cleanup complete!\n');
  
  // Always exit with success code so npm script chain continues
  process.exit(0);
}

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error during cleanup:', error);
    // Even on error, exit with 0 so npm scripts continue
    process.exit(0);
  });
}

module.exports = { killPortWindows, killPortUnix, killAllNodeProcesses };
