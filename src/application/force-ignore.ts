import * as fs from 'fs';
import * as nodePath from 'path';

// ponytail: hand-rolled subset of gitignore semantics, replacing the `ignore` npm
// package that @salesforce/source-deploy-retrieve used for .forceignore support.
// FLAG FOR MANUAL REVIEW: gitignore has more corners than this (see limitations below).
// Deliberately lenient: when a pattern is ambiguous we prefer NOT to ignore, so the
// tool documents more rather than silently dropping metadata.
//
// Supported: comments (#), blank lines, negation (!), root-anchored patterns
// (leading or embedded '/'), floating basename patterns (no '/'), '**', '*', '?',
// trailing-slash "directory" patterns. Matching a path also matches everything under it.
//
// NOT supported (known ceiling — upgrade to a real matcher if these ever matter for docs):
// escaped metacharacters (\#, \!, trailing-space escapes), character classes ([a-z]),
// and the full "can't re-include under an ignored directory" precedence rule.

// Only the defaults that matter for documentation output. Dotfiles (.DS_Store,
// .eslintrc.json, .forceignore itself) and .dup files should never surface as metadata.
const DEFAULT_IGNORE = ['**/.*', '**/*.dup'];

type Rule = { negate: boolean; re: RegExp };

function patternToRule(rawLine: string): Rule | null {
  let pattern = rawLine.trimEnd();
  if (pattern === '' || pattern.startsWith('#')) {
    return null;
  }

  let negate = false;
  if (pattern.startsWith('!')) {
    negate = true;
    pattern = pattern.slice(1);
  }

  // Trailing slash = directory-only in gitignore. We only ever test file paths, and a
  // "match this path and everything under it" already covers directories, so we just strip it.
  if (pattern.endsWith('/')) {
    pattern = pattern.slice(0, -1);
  }

  // A leading or embedded slash anchors the pattern to the .forceignore's directory.
  // Otherwise, it floats and matches at any depth (basename-style).
  let anchored = pattern.includes('/');
  if (pattern.startsWith('/')) {
    pattern = pattern.slice(1);
    anchored = true;
  }

  let body = '';
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    if (c === '*') {
      if (pattern[i + 1] === '*') {
        // '**/' matches zero or more directories; bare '**' matches anything.
        if (pattern[i + 2] === '/') {
          body += '(?:.*/)?';
          i += 2;
        } else {
          body += '.*';
          i += 1;
        }
      } else {
        body += '[^/]*';
      }
    } else if (c === '?') {
      body += '[^/]';
    } else {
      body += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
  }

  const prefix = anchored ? '^' : '^(?:.*/)?';
  // Match the named path itself, or anything nested beneath it.
  const suffix = '(?:/.*)?$';
  return { negate, re: new RegExp(prefix + body + suffix) };
}

export class ForceIgnore {
  private readonly rules: Rule[];
  private readonly root: string;

  constructor(forceIgnorePath?: string, fallbackRoot?: string) {
    let contents = '';
    if (forceIgnorePath) {
      try {
        contents = fs.readFileSync(forceIgnorePath, 'utf-8');
      } catch {
        // No readable .forceignore — defaults still apply below.
      }
    }
    this.root = forceIgnorePath ? nodePath.dirname(forceIgnorePath) : (fallbackRoot ?? process.cwd());
    this.rules = [...DEFAULT_IGNORE, ...contents.split(/\r?\n/)]
      .map(patternToRule)
      .filter((rule): rule is Rule => rule !== null);
  }

  /**
   * Performs an upward search for a .forceignore file starting at `seed`, and returns a
   * ForceIgnore. If none is found, only the default patterns apply.
   */
  static findAndCreate(seed: string): ForceIgnore {
    const seedDir =
      fs.existsSync(seed) && fs.statSync(seed).isFile() ? nodePath.dirname(nodePath.resolve(seed)) : nodePath.resolve(seed);

    let dir = seedDir;
    while (true) {
      const candidate = nodePath.join(dir, '.forceignore');
      if (fs.existsSync(candidate)) {
        return new ForceIgnore(candidate);
      }
      const parent = nodePath.dirname(dir);
      if (parent === dir) {
        break;
      }
      dir = parent;
    }
    // No .forceignore anywhere up the tree — apply defaults relative to the walk root.
    return new ForceIgnore(undefined, seedDir);
  }

  /**
   * Returns true if the given path is excluded by the .forceignore rules (or defaults).
   * Last matching rule wins, so a later negation (!) can re-include an earlier match.
   */
  denies(fsPath: string): boolean {
    const relative = nodePath.relative(this.root, nodePath.resolve(fsPath)).split(nodePath.sep).join('/');
    let ignored = false;
    for (const rule of this.rules) {
      if (rule.re.test(relative)) {
        ignored = !rule.negate;
      }
    }
    return ignored;
  }
}
