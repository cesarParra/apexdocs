import { UnparsedSourceFile } from '../../shared/types';
import { generateChangeLog } from '../generate-change-log';
import { assertEither } from '../../test-helpers/assert-either';

const config = {
  fileName: 'changelog',
  targetDir: '',
  currentVersionDir: '',
  previousVersionDir: '',
};

describe('when generating a changelog', () => {
  it('should return a file path', async () => {
    const result = await generateChangeLog([], [], config)();

    assertEither(result, (data) => expect(data.outputDocPath).toContain('changelog.md'));
  });

  describe('that does not include new classes', () => {
    it('should not have a section for new classes', async () => {
      const oldBundle: UnparsedSourceFile[] = [];
      const newBundle: UnparsedSourceFile[] = [];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect(data.content).not.toContain('## New Classes'));
    });
  });

  describe('that includes new classes', () => {
    it('should include a section for new classes', async () => {
      const newClassSource = 'class Test {}';

      const oldBundle: UnparsedSourceFile[] = [];
      const newBundle: UnparsedSourceFile[] = [
        { content: newClassSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect(data.content).toContain('## New Classes'));
    });
  });
});
