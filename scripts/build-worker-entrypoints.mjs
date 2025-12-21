#!/usr/bin/env node
/**
 * Emits the Apex reflection worker entrypoint into the bundled `dist/` output,
 * and also copies it to `dist/apex-reflection.worker.js` for compatibility with
 * runtimes that expect it at the dist root.
 *
 * Why this exists:
 * - Our bundler (pkgroll) produces a single bundle, but Worker threads require a real JS file.
 * - We therefore transpile the worker TS file separately and place it into dist.
 * - Some install/bundle layouts have looked for the worker at `dist/apex-reflection.worker.js`,
 *   so we also maintain that copy.
 *
 * This is the ESM version of the script. You can invoke it with:
 *   node ./scripts/build-worker-entrypoints.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function fail(message) {
  const error = new Error(message);
  error.code = 'APEXDOCS_BUILD_WORKER_ENTRYPOINTS_FAILED';
  throw error;
}

function walk(dirPath, predicate) {
  const results = [];

  /** @param {string} currentDir */
  function recurse(currentDir) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const entryPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        recurse(entryPath);
        continue;
      }
      if (entry.isFile()) {
        if (!predicate || predicate(entryPath, entry)) {
          results.push(entryPath);
        }
      }
    }
  }

  recurse(dirPath);
  return results;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function getProjectRoot() {
  // scripts/build-worker-entrypoints.mjs -> scripts -> project root
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return path.resolve(__dirname, '..');
}

async function main() {
  const projectRoot = getProjectRoot();
  const distRoot = path.join(projectRoot, 'dist');

  if (!fs.existsSync(distRoot)) {
    fail(`Expected "${distRoot}" to exist. Run the bundler/build step before this script.`);
  }

  // We derive where to place the worker based on where the CLI bundle is emitted.
  // This keeps the worker location stable even if bundler output layout changes.
  const distGenerateCandidates = walk(distRoot, (entryPath) => path.basename(entryPath) === 'generate.js');
  if (!distGenerateCandidates.length) {
    fail(
      `Could not locate dist bundle entry "generate.js" under "${distRoot}". ` +
        `Cannot determine where to emit the worker entrypoint.`,
    );
  }

  const distGenerateJsPath = distGenerateCandidates[0];

  const workerSourceTsPath = path.join(
    projectRoot,
    'src',
    'core',
    'reflection',
    'apex',
    'apex-reflection.worker.ts',
  );

  if (!fs.existsSync(workerSourceTsPath)) {
    fail(`Worker source TS not found at "${workerSourceTsPath}".`);
  }

  // Emit location inside dist should be:
  //   dist/core/reflection/apex/apex-reflection.worker.js
  // but we compute it relative to the CLI bundle's folder.
  const distCliDir = path.dirname(distGenerateJsPath); // dist/cli
  const workerDistDir = path.join(distCliDir, '..', 'core', 'reflection', 'apex');
  ensureDir(workerDistDir);

  const workerDistPath = path.join(workerDistDir, 'apex-reflection.worker.js');
  const workerDistRootPath = path.join(distRoot, 'apex-reflection.worker.js');

  // Transpile worker TS to CJS JS.
  // We keep this output CJS because the worker is spawned from a CJS bundle today.
  let ts;
  try {
    ts = await import('typescript');
  } catch (error) {
    const details = error && typeof error === 'object' && 'message' in error ? ` ${(error).message}` : '';
    fail(
      `Could not import "typescript". Ensure devDependencies are installed before running this script.${details}`,
    );
  }

  const workerTsSource = fs.readFileSync(workerSourceTsPath, 'utf8');

  const transpiled = ts.transpileModule(workerTsSource, {
    compilerOptions: {
      // Worker is spawned with `new Worker(path)` in a CJS bundle, so output CJS.
      module: ts.ModuleKind.CommonJS,
      // Keep this reasonably modern; we're already targeting Node 18 in the bundle step.
      target: ts.ScriptTarget.ES2018,
      esModuleInterop: true,
    },
    fileName: path.basename(workerSourceTsPath),
  });

  fs.writeFileSync(workerDistPath, transpiled.outputText, 'utf8');

  if (!fs.existsSync(workerDistPath)) {
    fail(`Failed to write worker entrypoint to "${workerDistPath}".`);
  }

  // Compatibility copy: dist root.
  fs.copyFileSync(workerDistPath, workerDistRootPath);

  if (!fs.existsSync(workerDistRootPath)) {
    fail(`Failed to copy worker entrypoint to "${workerDistRootPath}".`);
  }

  // Minimal success log (stdout) so CI users can see what happened.
  process.stdout.write(
    [
      '[apexdocs] worker entrypoint emitted',
      `- ${path.relative(projectRoot, workerDistPath)}`,
      `- ${path.relative(projectRoot, workerDistRootPath)}`,
      '',
    ].join('\n'),
  );
}

await main();
