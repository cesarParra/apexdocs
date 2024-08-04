import * as fs from 'fs';
import * as path from 'path';
import { Settings } from '../core/settings';
import { PageData } from '../core/shared/types';

export class FileWriter {
  static write(files: PageData[], onWriteCallback: (file: PageData) => void) {
    files.forEach((file) => {
      const resolvedFile = this.getTargetLocation(file);
      if (!fs.existsSync(resolvedFile.directory)) {
        fs.mkdirSync(resolvedFile.directory, { recursive: true });
      }

      const filePath = path.join(resolvedFile.directory, `${resolvedFile.fileName}.${resolvedFile.fileExtension}`);
      fs.writeFileSync(filePath, resolvedFile.content, 'utf8');
      onWriteCallback(resolvedFile);
    });
  }

  private static getTargetLocation(file: PageData): PageData {
    return {
      ...file,
      directory: path.join(Settings.getInstance().outputDir, file.directory),
    };
  }
}
