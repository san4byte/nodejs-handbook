import os from 'node:os';

// SOAL 1
function calculateRamStatus() {
  const total = os.totalmem();
  const free = os.freemem();

  const totalGb = Number((total / 1024 ** 3).toFixed(2));
  const freeGb = Number((free / 1024 ** 3).toFixed(2));
  const usedPercentage = Number((((total - free) / total) * 100).toFixed(2));
  return {
    totalGb,
    freeGb,
    usedPercentage,
  };
}

console.log(calculateRamStatus());

// SOAL 2
function getActiveAdapters() {
  const network = os.networkInterfaces();
  const ip = [];

  for (const [key, value] of Object.entries(network)) {
    for (const val of value || []) {
      if (val.family === 'IPv4' && !val.internal) {
        ip.push({
          name: key,
          ip: val.address,
          mac: val.mac,
        });
      }
    }
  }

  return ip;
}

console.log(getActiveAdapters());

// SOAL 3
function evaluateServerLoad(loadThresholdPercentage) {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const coreQuota = os.availableParallelism();
  const platformName = os.platform();
  const freeRamPercentage = Number(((freeMem / totalMem) * 100).toFixed(2));

  if (freeRamPercentage < 10) {
    return { acceptTask: false, reason: 'Critical RAM capacity' };
  }

  let cpuStatus;
  let cpuUsagePercentage = null;

  if (platformName === 'win32') {
    cpuStatus = 'UNAVAILABLE';
  } else {
    const [load1m] = os.loadavg();

    cpuUsagePercentage = Number(((load1m / coreQuota) * 100).toFixed(2));
    cpuStatus = 'AVAILABLE';

    if (cpuUsagePercentage > loadThresholdPercentage) {
      return { acceptTask: false, reason: 'CPU overloaded' };
    }
  }

  return {
    acceptTask: true,
    cpuStatus,
    cpuUsagePercentage,
    freeRamPercentage,
  };
}

console.log(evaluateServerLoad(80));
