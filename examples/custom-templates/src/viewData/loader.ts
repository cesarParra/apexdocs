import { reflect, Type } from '@cparra/apex-reflection';
import { decorateType } from './transformer';
import { Data } from '../engine';
import * as fs from 'node:fs';
import * as path from 'path';

/**
 * This class loads data from the sfdx project directory (force-app). This structure must exist in
 * the existing codebase so this can mostly be ignored.
 */
export class Loader {
  private dir: string;

  constructor(dir: string) {
    this.dir = dir;
  }

  private retrieveApexFilePaths(dir: string): string[] {
    let results: string[] = [];

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        results = results.concat(this.retrieveApexFilePaths(fullPath));
      } else if (entry.isFile() && fullPath.endsWith('.cls')) {
        results.push(fullPath);
      }
    }

    return results;
  }

  /**
   * Passes data through transformer to yield result appropriate for templates
   * @returns Data structure expected by engine
   */
  public compileData(): Data {
    const apexData = this.retrieveApexFilePaths(this.dir)
      .map((filePath) => reflect(fs.readFileSync(filePath).toString()).typeMirror)
      .filter((t): t is Type => t !== undefined)
      .map((typeMirror) => decorateType(typeMirror));

    return { apex: apexData };
  }
}
