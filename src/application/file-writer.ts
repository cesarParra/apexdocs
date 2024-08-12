import * as fs from 'fs';
import * as path from 'path';
import { PageData } from '../core/shared/types';

export class FileWriter {
  static write(files: PageData[], outputDir: string, onWriteCallback: (file: PageData) => void) {
    files.forEach((file) => {
      const resolvedFile = this.getTargetLocation(file, outputDir);
      console.log('output dir', outputDir, path.join(outputDir, file.filePath));
      console.log('dir name', path.dirname(resolvedFile.filePath));
      console.log('full path', resolvedFile.filePath);
      fs.mkdirSync(path.dirname(resolvedFile.filePath), { recursive: true });
      fs.writeFileSync(resolvedFile.filePath, resolvedFile.content, 'utf8');
      onWriteCallback(resolvedFile);
    });
  }

  private static getTargetLocation(file: PageData, outputDir: string): PageData {
    console.log('joining', outputDir, file.filePath, path.join(outputDir, file.filePath));
    return {
      ...file,
      filePath: path.join(outputDir, file.filePath),
    };
  }
}
