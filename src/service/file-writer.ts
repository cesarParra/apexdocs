import * as fs from 'fs';
import * as path from 'path';
import { OutputFile } from '../model/outputFile';
import { Settings } from '../settings';

export class FileWriter {
  static write(files: OutputFile[], onWriteCallback: (fileName: string) => void) {
    const onBeforeFileWrite = (outputDir: string, fileName: string) =>
      Settings.getInstance().onBeforeFileWrite(outputDir, fileName);
    files.forEach((file) => {
      const { dir: dirPath, fileName } = this.getTargetLocation(file, onBeforeFileWrite);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const filePath = path.join(dirPath, fileName);
      fs.writeFileSync(filePath, file.body, 'utf8');
      onWriteCallback(filePath);
    });
  }

  private static getTargetLocation(file: OutputFile, onBeforeFileWrite: OnBeforeFileWrite): TargetLocation {
    const outputDir = path.join(Settings.getInstance().outputDir, file.dir);
    const fileName = `${file.fileName}${file.fileExtension()}`;
    return onBeforeFileWrite(outputDir, fileName);
  }
}

type OnBeforeFileWrite = (outputDir: string, fileName: string) => TargetLocation;

type TargetLocation = {
  dir: string;
  fileName: string;
};
