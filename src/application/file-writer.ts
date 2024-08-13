import * as fs from 'fs';
import * as path from 'path';
import { PageData } from '../core/shared/types';

export class FileWriter {
  static write(files: PageData[], outputDir: string, onWriteCallback: (file: PageData) => void) {
    files.forEach((file) => {
      const { filePath, content } = this.getTargetLocation(file, outputDir);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, content, 'utf8');
      onWriteCallback(file);
    });
  }

  private static getTargetLocation(file: PageData, outputDir: string): PageData {
    return {
      ...file,
      filePath: path.join(outputDir, file.filePath),
    };
  }
}
