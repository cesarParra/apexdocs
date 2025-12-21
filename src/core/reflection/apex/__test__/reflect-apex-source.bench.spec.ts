import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { execSync } from 'node:child_process';

type Mode = 'sequential' | 'parallel';

type RunResult = {
  mode: Mode;
  files: number;
  methodsPerClass: number;
  iterations: number;
  warmup: number;
  msTotal: number;
  msPerIteration: number;
  msPerFile: number;
  stdout: string;
};

function nowMs(): number {
  // Prefer high-resolution time when available.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const perf = (globalThis as any).performance;
  if (perf && typeof perf.now === 'function') {
    return perf.now();
  }
  return Date.now();
}

function formatMs(n: number): string {
  return `${n.toFixed(2)}ms`;
}

function formatRatio(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function buildApexClassSource(index: number, methods: number): string {
  const lines: string[] = [];
  lines.push('/**');
  lines.push(` * Bench class ${index}`);
  lines.push(' * @description Benchmark reflection sequential vs parallel');
  lines.push(' */');
  lines.push(`public class BenchClass_${index} {`);
  for (let i = 0; i < methods; i++) {
    lines.push('  /**');
    lines.push(`   * Method ${i}`);
    lines.push('   */');
    lines.push(`  public static Integer m${i}(Integer a) {`);
    lines.push('    Integer x = a;');
    // Add a bit of parsing weight (loops + arithmetic)
    lines.push('    for (Integer j = 0; j < 10; j++) { x += j; }');
    lines.push('    return x;');
    lines.push('  }');
  }
  lines.push('}');
  return lines.join('\n');
}

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath: string, value: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
}

function createBenchProject(tempRoot: string, files: number, methodsPerClass: number): string {
  const projectDir = fs.mkdtempSync(path.join(tempRoot, 'apexdocs-bench-'));

  // Minimal SFDX structure expected by SDR component discovery:
  // force-app/main/default/classes/*.cls
  const classesDir = path.join(projectDir, 'force-app', 'main', 'default', 'classes');
  ensureDir(classesDir);

  for (let i = 1; i <= files; i++) {
    const clsName = `BenchClass_${i}`;
    fs.writeFileSync(path.join(classesDir, `${clsName}.cls`), buildApexClassSource(i, methodsPerClass), 'utf8');
  }

  // Minimal sfdx-project.json so --useSfdxProjectJson works even if we decide to later
  // switch the command invocation.
  writeJson(path.join(projectDir, 'sfdx-project.json'), {
    packageDirectories: [{ path: 'force-app' }],
    namespace: '',
    sourceApiVersion: '59.0',
  });

  return projectDir;
}

function resolveDistCliPath(): string {
  // This test is dist-based by design.
  // When running under jest, __dirname points to:
  //   <repo>/src/core/reflection/apex/__test__
  // CLI is at:
  //   <repo>/dist/cli/generate.js
  const candidate = path.resolve(__dirname, '../../../../../dist/cli/generate.js');
  if (!fs.existsSync(candidate)) {
    throw new Error(
      `dist CLI not found at ${candidate}. This perf test requires a built dist output. Run "npm run build" first.`,
    );
  }
  return candidate;
}

function baseCommand(cliPath: string, mode: Mode): string {
  const args: string[] = [];
  args.push('node');
  args.push(JSON.stringify(cliPath));
  args.push('markdown');

  // Use explicit sourceDir so we can run from a temp cwd without depending on repo examples.
  args.push('--sourceDir');
  args.push('force-app');

  // Avoid disk-heavy output. Still writes, but small.
  args.push('--targetDir');
  args.push('./docs');

  // Keep scope small-ish and deterministic.
  args.push('--scope');
  args.push('public');

  // Make reflection mode explicit and comparable.
  args.push('--parallelReflection');
  args.push(mode === 'parallel' ? 'true' : 'false');

  // Keep the benchmark stable: no LWC, no metadata.
  args.push('--includeMetadata');
  args.push('false');
  args.push('--experimentalLwcSupport');
  args.push('false');

  // Keep worker count configurable via env for tuning CI.
  const maxWorkersRaw = process.env.APEXDOCS_BENCH_MAX_WORKERS;
  if (mode === 'parallel' && maxWorkersRaw && maxWorkersRaw.trim().length > 0) {
    args.push('--parallelReflectionMaxWorkers');
    args.push(String(Number(maxWorkersRaw)));
  }

  return args.join(' ');
}

function runOnce(cliPath: string, cwd: string, mode: Mode): string {
  const cmd = baseCommand(cliPath, mode);
  return execSync(cmd, {
    cwd,
    encoding: 'utf8',
    stdio: 'pipe',
  });
}

async function bench(
  cliPath: string,
  cwd: string,
  mode: Mode,
  iterations: number,
  warmup: number,
  files: number,
  methodsPerClass: number,
): Promise<RunResult> {
  // Warmup
  for (let i = 0; i < warmup; i++) {
    const out = runOnce(cliPath, cwd, mode);
    if (!out.includes('Documentation generated successfully')) {
      throw new Error(`Warmup run did not succeed. Output:\n${out}`);
    }
  }

  const start = nowMs();
  let lastOut = '';
  for (let i = 0; i < iterations; i++) {
    lastOut = runOnce(cliPath, cwd, mode);
    if (!lastOut.includes('Documentation generated successfully')) {
      throw new Error(`Benchmark run did not succeed. Output:\n${lastOut}`);
    }
  }
  const end = nowMs();

  const msTotal = end - start;
  const msPerIteration = msTotal / iterations;
  const msPerFile = msTotal / (iterations * files);

  return {
    mode,
    files,
    methodsPerClass,
    iterations,
    warmup,
    msTotal,
    msPerIteration,
    msPerFile,
    stdout: lastOut,
  };
}

/**
 * Dist-based perf check.
 *
 * Why dist-based?
 * - Worker threads require real JS entrypoints; ts-jest unit tests run source TS and do not ship worker JS.
 * - This compares actual CLI behavior that end users will run.
 *
 * Control via env:
 * - APEXDOCS_BENCH=true              -> enable this test (otherwise it is a no-op)
 * - APEXDOCS_BENCH_FILES=200         -> number of classes to generate
 * - APEXDOCS_BENCH_METHODS=40        -> methods per class
 * - APEXDOCS_BENCH_ITERS=3           -> iterations for timing
 * - APEXDOCS_BENCH_WARMUP=1          -> warmup iterations
 * - APEXDOCS_BENCH_MAX_WORKERS=8     -> override worker count for parallel mode
 * - APEXDOCS_BENCH_ENFORCE=true      -> enforce parallel not worse than sequential beyond tolerance
 * - APEXDOCS_BENCH_TOLERANCE=0.10    -> allowed regression ratio (default 0.15)
 */
describe('bench (dist): markdown reflection sequential vs parallel', () => {
  const SHOULD_RUN = process.env.APEXDOCS_BENCH === 'true';

  const FILES = Number(process.env.APEXDOCS_BENCH_FILES ?? '150');
  const METHODS = Number(process.env.APEXDOCS_BENCH_METHODS ?? '30');
  const ITERS = Number(process.env.APEXDOCS_BENCH_ITERS ?? '3');
  const WARMUP = Number(process.env.APEXDOCS_BENCH_WARMUP ?? '1');

  const ENFORCE = process.env.APEXDOCS_BENCH_ENFORCE === 'true';
  const TOLERANCE = Number(process.env.APEXDOCS_BENCH_TOLERANCE ?? '0.15');

  it('compares sequential vs parallel modes using built dist CLI', async () => {
    if (!SHOULD_RUN) {
      return;
    }

    const cliPath = resolveDistCliPath();
    const tempRoot = os.tmpdir();
    const projectDir = createBenchProject(tempRoot, FILES, METHODS);

    try {
      const sequential = await bench(cliPath, projectDir, 'sequential', ITERS, WARMUP, FILES, METHODS);
      const parallel = await bench(cliPath, projectDir, 'parallel', ITERS, WARMUP, FILES, METHODS);

      // eslint-disable-next-line no-console
      console.log(
        `[bench] sequential: files=${sequential.files} methods=${sequential.methodsPerClass} total=${formatMs(
          sequential.msTotal,
        )} perIter=${formatMs(sequential.msPerIteration)} perFile=${formatMs(sequential.msPerFile)}`,
      );
      // eslint-disable-next-line no-console
      console.log(
        `[bench] parallel:   files=${parallel.files} methods=${parallel.methodsPerClass} total=${formatMs(
          parallel.msTotal,
        )} perIter=${formatMs(parallel.msPerIteration)} perFile=${formatMs(parallel.msPerFile)}`,
      );

      const ratio = parallel.msPerFile / sequential.msPerFile;
      // eslint-disable-next-line no-console
      console.log(`[bench] parallel/sequential perFile ratio=${formatRatio(ratio)}`);

      if (ENFORCE) {
        // Enforce: parallel should not regress beyond tolerance.
        // Note: On single-core / constrained CI, it might not be faster, but it should not be meaningfully worse.
        const limit = 1 + (Number.isFinite(TOLERANCE) ? TOLERANCE : 0.15);
        expect(ratio).toBeLessThanOrEqual(limit);
      }
    } finally {
      // Cleanup temp project
      try {
        fs.rmSync(projectDir, { recursive: true, force: true });
      } catch {
        // ignore
      }
    }
  });
});
