import { UnparsedSourceFile } from '../../shared/types';
import { generateChangeLog } from '../generate-change-log';
// TODO: Move the assert either function to a shared place so we are not importing it from markdown
import { assertEither } from '../../markdown/__test__/expect-extensions';

describe('when generating a change log', () => {
  describe('that does not include new classes', () => {
    it('should not have a section for new classes', async () => {
      const oldBundle: UnparsedSourceFile[] = [];
      const newBundle: UnparsedSourceFile[] = [];

      const result = await generateChangeLog(oldBundle, newBundle)();

      assertEither(result, (data) => expect(data).not.toContain('## New Classes'));
    });
  });

  describe('that includes new classes', () => {
    it('should include a section for new classes', async () => {
      const newClassSource = 'class Test {}';

      const oldBundle: UnparsedSourceFile[] = [];
      const newBundle: UnparsedSourceFile[] = [
        { content: newClassSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const result = await generateChangeLog(oldBundle, newBundle)();

      assertEither(result, (data) => expect(data).toContain('## New Classes'));
    });
  });
});
