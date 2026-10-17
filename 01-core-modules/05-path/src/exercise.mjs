import path from 'node:path';

// SOAL 1
function parseFileComponents(filePath) {
  const parsedFilePath = path.parse(filePath);

  return {
    base: parsedFilePath.base,
    name: parsedFilePath.name,
    ext: parsedFilePath.ext.toLowerCase(),
    dir: parsedFilePath.dir,
  };
}

console.log(parseFileComponents('/var/log/audit/SERVER-PROD.LOG'));

// SOAL 2
function changeFileExtension(oldPath, newExtension) {
  const parsedPath = path.parse(oldPath);
  const safeExt = newExtension.startsWith('.')
    ? newExtension
    : `.${newExtension}`;

  return path.format({
    ...parsedPath,
    base: undefined,
    ext: safeExt,
  });
}

console.log(changeFileExtension('/assets/images/banner.png', '.webp'));

// SOAL 3
function validateDownloadAccess(rootDir, userInput, allowedExtensions) {
  const ROOT_DIR = path.resolve(rootDir);

  // Benar:
  if (typeof userInput !== 'string' || userInput.trim() === '') {
    return {
      allowed: false,
      statusCode: 400,
      message: 'Invalid file name',
    };
  }

  const absolutePath = path.resolve(ROOT_DIR, '.' + path.sep + userInput);
  const safeRootDir = ROOT_DIR.endsWith(path.sep)
    ? ROOT_DIR
    : ROOT_DIR + path.sep;
  if (!absolutePath.startsWith(safeRootDir)) {
    return {
      allowed: false,
      statusCode: 403,
      message: 'Directory access denied',
    };
  }

  const ext = path.extname(userInput).toLowerCase();
  const normalizedAllowed = allowedExtensions.map((e) => e.toLowerCase());
  if (!normalizedAllowed.includes(ext)) {
    return {
      allowed: false,
      statusCode: 415,
      message: 'Unsupported file type',
    };
  }

  return {
    allowed: true,
    statusCode: 200,
    absolutePath,
  };
}

console.log(
  validateDownloadAccess('/var/public', 'reports/financial.pdf', [
    '.pdf',
    '.xlsx',
  ]),
);
console.log(
  validateDownloadAccess('/var/public', '../../etc/shadow', ['.pdf']),
);
console.log(
  validateDownloadAccess('/var/public', 'data.exe', ['.pdf', '.xlsx']),
);
