import { TargetFile } from './src/settings';

export default {
  onBeforeFileWrite: (file: TargetFile): TargetFile => {
    console.log('onBefore writing', file);
    return file;
  },
  onAfterProcess: (files: TargetFile[]) => {
    console.log('onAfterProcess files', files);
  },
};
