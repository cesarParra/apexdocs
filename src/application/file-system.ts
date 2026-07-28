import * as fs from 'fs';
import * as nodePath from 'path';
import { SourceComponentAdapter } from './source-code-file-reader';
import { ForceIgnore } from './force-ignore';
import { classify } from './metadata-registry';

export interface FileSystem {
  getComponents(path: string): SourceComponentAdapter[];
  readFile: (path: string) => string | null;
}

export class DefaultFileSystem implements FileSystem {
  getComponents(path: string): SourceComponentAdapter[] {
    const forceIgnore = ForceIgnore.findAndCreate(path);
    const files = walk(path, forceIgnore);
    const fileSet = new Set(files);
    const ctx = { has: (p: string) => fileSet.has(p) };

    return files
      .map((file) => classify(file, ctx))
      .filter((component): component is SourceComponentAdapter => component !== null);
  }

  readFile(pathToRead: string): string | null {
    try {
      return fs.readFileSync(pathToRead, 'utf8');
    } catch {
      return null;
    }
  }
}

/**
 * Recursively collects all files under `root`, skipping anything excluded by .forceignore.
 * Ignored directories are pruned so their contents are excluded too.
 */
function walk(root: string, forceIgnore: ForceIgnore): string[] {
  if (!fs.existsSync(root)) {
    return [];
  }
  if (fs.statSync(root).isFile()) {
    return forceIgnore.denies(root) ? [] : [root];
  }

  const files: string[] = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = nodePath.join(root, entry.name);
    if (forceIgnore.denies(fullPath)) {
      continue;
    }
    if (entry.isDirectory()) {
      files.push(...walk(fullPath, forceIgnore));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}
