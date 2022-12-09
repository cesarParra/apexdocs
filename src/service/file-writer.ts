import * as fs from 'fs';
import * as path from 'path';
import { OutputFile } from '../model/outputFile';
import { Settings } from '../settings';

export class FileWriter {
  static write(files: OutputFile[], onWriteCallback: (fileName: string) => void) {
    const outputDir = Settings.getInstance().outputDir;
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    files.forEach((file) => {
      const dirPath = path.join(outputDir, file.dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
      }

      const filePath = path.join(dirPath, `${file.fileName}${file.fileExtension()}`);
      fs.writeFile(filePath, file.body, 'utf8', () => {
        onWriteCallback(file.fileName);
      });
    });
  }
}
