import { UnparsedSourceFile } from '../../shared/types';
import { generateChangeLog } from '../generate-change-log';
import { assertEither } from '../../test-helpers/assert-either';

const config = {
  fileName: 'changelog',
  scope: ['global', 'public', 'private'],
  targetDir: '',
  currentVersionDir: '',
  previousVersionDir: '',
  exclude: [],
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

    it('should include the new class name', async () => {
      const newClassSource = 'class Test {}';

      const oldBundle: UnparsedSourceFile[] = [];
      const newBundle: UnparsedSourceFile[] = [
        { content: newClassSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect(data.content).toContain('### Test'));
    });

    it('should include the new class description', async () => {
      const newClassSource = `
        /**
         * This is a test class.
         */
        class Test {}
      `;

      const oldBundle: UnparsedSourceFile[] = [];
      const newBundle: UnparsedSourceFile[] = [
        { content: newClassSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect(data.content).toContain('This is a test class.'));
    });
  });

  describe('that include new interfaces', () => {
    it('should include a section for new interfaces', async () => {
      const newInterfaceSource = 'interface Test {}';

      const oldBundle: UnparsedSourceFile[] = [];
      const newBundle: UnparsedSourceFile[] = [
        { content: newInterfaceSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect(data.content).toContain('## New Interfaces'));
    });

    it('should include the new interface name', async () => {
      const newInterfaceSource = 'interface Test {}';

      const oldBundle: UnparsedSourceFile[] = [];
      const newBundle: UnparsedSourceFile[] = [
        { content: newInterfaceSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect(data.content).toContain('### Test'));
    });

    it('should include the new interface description', async () => {
      const newInterfaceSource = `
        /**
         * This is a test interface.
         */
        interface Test {}
      `;

      const oldBundle: UnparsedSourceFile[] = [];
      const newBundle: UnparsedSourceFile[] = [
        { content: newInterfaceSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect(data.content).toContain('This is a test interface.'));
    });
  });

  describe('that include new enums', () => {
    it('should include a section for new enums', async () => {
      const newEnumSource = 'enum Test {}';

      const oldBundle: UnparsedSourceFile[] = [];
      const newBundle: UnparsedSourceFile[] = [{ content: newEnumSource, filePath: 'Test.cls', metadataContent: null }];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect(data.content).toContain('## New Enums'));
    });

    it('should include the new enum name', async () => {
      const newEnumSource = 'enum Test {}';

      const oldBundle: UnparsedSourceFile[] = [];
      const newBundle: UnparsedSourceFile[] = [{ content: newEnumSource, filePath: 'Test.cls', metadataContent: null }];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect(data.content).toContain('### Test'));
    });

    it('should include the new enum description', async () => {
      const newEnumSource = `
        /**
         * This is a test enum.
         */
        enum Test {}
      `;

      const oldBundle: UnparsedSourceFile[] = [];
      const newBundle: UnparsedSourceFile[] = [{ content: newEnumSource, filePath: 'Test.cls', metadataContent: null }];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect(data.content).toContain('This is a test enum.'));
    });
  });

  describe('that includes new types out of scope', () => {
    it('should not include them', async () => {
      const newClassSource = 'class Test {}';

      const oldBundle: UnparsedSourceFile[] = [];
      const newBundle: UnparsedSourceFile[] = [
        { content: newClassSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const result = await generateChangeLog(oldBundle, newBundle, { ...config, scope: ['global'] })();

      assertEither(result, (data) => expect(data.content).not.toContain('## New Classes'));
    });
  });

  describe('that includes removed types', () => {
    it('should include a section for removed types', async () => {
      const oldClassSource = 'class Test {}';

      const oldBundle: UnparsedSourceFile[] = [
        { content: oldClassSource, filePath: 'Test.cls', metadataContent: null },
      ];
      const newBundle: UnparsedSourceFile[] = [];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect(data.content).toContain('## Removed Types'));
    });

    it('should include the removed type name', async () => {
      const oldClassSource = 'class Test {}';

      const oldBundle: UnparsedSourceFile[] = [
        { content: oldClassSource, filePath: 'Test.cls', metadataContent: null },
      ];
      const newBundle: UnparsedSourceFile[] = [];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect(data.content).toContain('- Test'));
    });
  });

  describe('that includes modifications to existing members', () => {
    it('should include a section for new or modified members', async () => {
      const oldClassSource = 'class Test {}';
      const newClassSource = 'class Test { void myMethod() {} }';

      const oldBundle: UnparsedSourceFile[] = [
        { content: oldClassSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const newBundle: UnparsedSourceFile[] = [
        { content: newClassSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect(data.content).toContain('## New or Modified Members in Existing Types'));
    });

    it('should include the new or modified type name', async () => {
      const oldClassSource = 'class Test {}';
      const newClassSource = 'class Test { void myMethod() {} }';

      const oldBundle: UnparsedSourceFile[] = [
        { content: oldClassSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const newBundle: UnparsedSourceFile[] = [
        { content: newClassSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect(data.content).toContain('### Test'));
    });

    it('should include the new or modified member name', async () => {
      const oldClassSource = 'class Test {}';
      const newClassSource = 'class Test { void myMethod() {} }';

      const oldBundle: UnparsedSourceFile[] = [
        { content: oldClassSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const newBundle: UnparsedSourceFile[] = [
        { content: newClassSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect(data.content).toContain('myMethod'));
    });
  });
});
