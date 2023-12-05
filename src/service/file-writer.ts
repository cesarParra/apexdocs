import * as fs from 'fs';
import * as path from 'path';
import { OutputFile } from '../model/outputFile';
import { OnBeforeFileWrite, OutputDir, Settings, TargetLocation } from '../settings';

export class FileWriter {
  static write(files: OutputFile[], onWriteCallback: (file: TargetLocation) => void) {
    const onBeforeFileWrite = (outputDir: OutputDir, fileName: string) =>
      Settings.getInstance().onBeforeFileWrite(outputDir, fileName);
    files.forEach((file) => {
      const { dir: dirPath, fileName } = this.getTargetLocation(file, onBeforeFileWrite);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const filePath = path.join(dirPath, fileName);
      fs.writeFileSync(filePath, file.body, 'utf8');
      onWriteCallback({ dir: dirPath, fileName });
    });
  }

  private static getTargetLocation(file: OutputFile, onBeforeFileWrite: OnBeforeFileWrite): TargetLocation {
    const fileName = `${file.fileName}${file.fileExtension()}`;
    return onBeforeFileWrite(
      {
        baseDir: Settings.getInstance().outputDir,
        fileDir: file.dir,
      },
      fileName,
    );
  }
}
