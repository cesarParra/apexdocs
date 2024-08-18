import * as fs from 'fs';
import * as path from 'path';
import { PageData } from '../core/shared/types';

export class FileWriter {
  static write(files: PageData[], outputDir: string, onWriteCallback: (file: PageData) => void) {
    files.forEach((file) => {
      const { outputDocPath, content } = this.getTargetLocation(file, outputDir);
      fs.mkdirSync(path.dirname(outputDocPath), { recursive: true });
      fs.writeFileSync(outputDocPath, content, 'utf8');
      onWriteCallback(file);
    });
  }

  private static getTargetLocation(file: PageData, outputDir: string): PageData {
    return {
      ...file,
      outputDocPath: path.join(outputDir, file.outputDocPath),
    };
  }
}
