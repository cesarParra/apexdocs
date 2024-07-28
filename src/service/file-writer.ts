import * as fs from 'fs';
import * as path from 'path';
import { OutputFile } from '../core/outputFile';
import { OnBeforeFileWrite, Settings, TargetFile } from '../settings';

export class FileWriter {
  static write(files: OutputFile[], onWriteCallback: (file: TargetFile) => void) {
    const onBeforeFileWrite: OnBeforeFileWrite = (file: TargetFile) => Settings.getInstance().onBeforeFileWrite(file);
    files.forEach((file) => {
      const resolvedFile = this.getTargetLocation(file, onBeforeFileWrite);
      const fullDir = path.join(resolvedFile.dir.baseDir, resolvedFile.dir.fileDir);
      if (!fs.existsSync(fullDir)) {
        fs.mkdirSync(fullDir, { recursive: true });
      }

      const filePath = path.join(fullDir, `${resolvedFile.name}${resolvedFile.extension}`);
      fs.writeFileSync(filePath, file.body, 'utf8');
      onWriteCallback(resolvedFile);
    });
  }

  private static getTargetLocation(file: OutputFile, onBeforeFileWrite: OnBeforeFileWrite): TargetFile {
    const targetFile: TargetFile = {
      name: file.fileName,
      extension: file.fileExtension(),
      dir: {
        baseDir: Settings.getInstance().outputDir,
        fileDir: file.dir,
      },
    };

    return onBeforeFileWrite(targetFile);
  }
}
