import * as fs from 'fs';
import * as path from 'path';
import { PageData } from '../core/shared/types';

export class FileWriter {
  static write(files: PageData[], outputDir: string, onWriteCallback: (file: PageData) => void) {
    files.forEach((file) => {
      const resolvedFile = this.getTargetLocation(file, outputDir);
      if (!fs.existsSync(resolvedFile.directory)) {
        fs.mkdirSync(resolvedFile.directory, { recursive: true });
      }

      const filePath = path.join(resolvedFile.directory, `${resolvedFile.fileName}.${resolvedFile.fileExtension}`);
      fs.writeFileSync(filePath, resolvedFile.content, 'utf8');
      onWriteCallback(resolvedFile);
    });
  }

  private static getTargetLocation(file: PageData, outputDir: string): PageData {
    return {
      ...file,
      directory: path.join(outputDir, file.directory),
    };
  }
}
