import * as path from 'path';

type OutputDir = {
  baseDir: string;
  fileDir: string;
};

export default {
  onBeforeFileWrite: (dir: OutputDir, fileName: string) => {
    console.log('onBefore writing', dir, fileName);
    const defaultDir = path.join(dir.baseDir, dir.fileDir);
    return { dir: defaultDir, fileName };
  },
  onAfterProcess: (files: { dir: string; fileName: string }[]) => {
    console.log('onAfterProcess files', files);
  },
};
