import { builtinModules, isBuiltin } from 'node:module';

// SOAL 1
function isNativeModule(moduleName) {
  return isBuiltin(moduleName);
}

console.log(isNativeModule('node:url')); // true
console.log(isNativeModule('kiw-kiw')); // false

// SOAL 2
function categorizeModules(moduleList) {
  const builtins = [];
  const thirdParty = [];

  for (const module of moduleList) {
    if (isBuiltin(module)) {
      if (module.startsWith('node:')) {
        builtins.push(module);
      } else {
        builtins.push(`node:${module}`);
      }
    } else {
      thirdParty.push(module);
    }
  }

  return {
    builtins,
    thirdParty,
  };
}

console.log(categorizeModules(['module', 'node:module', 'axios', 'dotenv']));

// SOAL 3
function auditModuleRegistry(specifiers) {
  const defaultBuiltins = new Set(builtinModules);

  const report = {
    securedBuiltins: [],
    unprefixedBuiltins: [],
    invalidBuiltins: [],
    externalPackages: [],
    complianceScore: 100,
  };

  for (const specifier of specifiers) {
    if (specifier.startsWith('node:')) {
      const moduleName = specifier.slice(5);
      if (defaultBuiltins.has(moduleName)) {
        report.securedBuiltins.push(specifier);
      } else {
        report.invalidBuiltins.push(specifier);
      }
    } else if (isBuiltin(specifier)) {
      report.unprefixedBuiltins.push({ specifier, fix: `node:${specifier}` });
    } else {
      report.externalPackages.push(specifier);
    }
  }

  const totalBuiltins =
    report.securedBuiltins.length + report.unprefixedBuiltins.length;

  report.complianceScore =
    totalBuiltins === 0
      ? 100
      : Number(
          ((report.securedBuiltins.length / totalBuiltins) * 100).toFixed(1),
        );

  return report;
}

const testImport = [
  'node:module',
  'module',
  'node:fake_system',
  'express',
  'react',
];

console.log(auditModuleRegistry(testImport));
