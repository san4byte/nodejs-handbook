import process from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Konfigurasi diagnostic report otomatis saat terjadi crash
process.report.reportOnUncaughtException = true;
process.report.reportOnFatalError = true;
process.report.reportOnSignal = true;
process.report.filename = path.join(__dirname, 'data', 'report-error.json');

function triggerCrash() {
  throw new Error('Simulasi galat fatal tak tertangani!');
}

try {
  triggerCrash();
} catch (err) {
  console.log(
    'Menuliskan laporan diagnosa Node.js secara manual via process.report.writeReport()...',
  );
  process.report.writeReport();
  console.log('Laporan diagnosa berhasil disimpan ke report-error.json');
}
