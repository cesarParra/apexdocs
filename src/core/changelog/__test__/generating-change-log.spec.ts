import { UnparsedApexBundle, UnparsedCustomObjectBundle } from '../../shared/types';
import { ChangeLogPageData, generateChangeLog } from '../generate-change-log';
import { assertEither } from '../../test-helpers/assert-either';
import { isSkip } from '../../shared/utils';

const config = {
  fileName: 'changelog',
  scope: ['global', 'public', 'private'],
  targetDir: '',
  currentVersionDir: '',
  previousVersionDir: '',
  exclude: [],
  skipIfNoChanges: false,
};

export function customObjectGenerator(
  config: { deploymentStatus: string; visibility: string } = { deploymentStatus: 'Deployed', visibility: 'Public' },
) {
  return `
    <?xml version="1.0" encoding="UTF-8"?>
    <CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
        <deploymentStatus>${config.deploymentStatus}</deploymentStatus>
        <description>test object for testing</description>
        <label>MyTestObject</label>
        <pluralLabel>MyFirstObjects</pluralLabel>
        <visibility>${config.visibility}</visibility>
    </CustomObject>`;
}

describe('when generating a changelog', () => {
  it('should not skip when skipIfNoChanges, even if there are no changes', async () => {
    const result = await generateChangeLog([], [], { ...config })();

    assertEither(result, (data) => expect(isSkip(data)).toBe(false));
  });

  it('should skip when there are no changes', async () => {
    const result = await generateChangeLog([], [], { ...config, skipIfNoChanges: true })();

    assertEither(result, (data) => expect(isSkip(data)).toBe(true));
  });

  it('should return a file path', async () => {
    const result = await generateChangeLog([], [], config)();

    assertEither(result, (data) => expect((data as ChangeLogPageData).outputDocPath).toContain('changelog.md'));
  });

  describe('that does not include new classes', () => {
    it('should not have a section for new classes', async () => {
      const oldBundle: UnparsedApexBundle[] = [];
      const newBundle: UnparsedApexBundle[] = [];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect((data as ChangeLogPageData).content).not.toContain('## New Classes'));
    });
  });

  describe('that includes new classes', () => {
    it('should include a section for new classes', async () => {
      const newClassSource = 'class Test {}';

      const oldBundle: UnparsedApexBundle[] = [];
      const newBundle: UnparsedApexBundle[] = [
        { type: 'apex', name: 'Test', content: newClassSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect((data as ChangeLogPageData).content).toContain('## New Classes'));
    });

    it('should include the new class name', async () => {
      const newClassSource = 'class Test {}';

      const oldBundle: UnparsedApexBundle[] = [];
      const newBundle: UnparsedApexBundle[] = [
        { type: 'apex', name: 'Test', content: newClassSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect((data as ChangeLogPageData).content).toContain('### Test'));
    });

    it('should include the new class description', async () => {
      const newClassSource = `
        /**
         * This is a test class.
         */
        class Test {}
      `;

      const oldBundle: UnparsedApexBundle[] = [];
      const newBundle: UnparsedApexBundle[] = [
        { type: 'apex', name: 'Test', content: newClassSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect((data as ChangeLogPageData).content).toContain('This is a test class.'));
    });
  });

  describe('that include new interfaces', () => {
    it('should include a section for new interfaces', async () => {
      const newInterfaceSource = 'interface Test {}';

      const oldBundle: UnparsedApexBundle[] = [];
      const newBundle: UnparsedApexBundle[] = [
        { type: 'apex', name: 'Test', content: newInterfaceSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect((data as ChangeLogPageData).content).toContain('## New Interfaces'));
    });

    it('should include the new interface name', async () => {
      const newInterfaceSource = 'interface Test {}';

      const oldBundle: UnparsedApexBundle[] = [];
      const newBundle: UnparsedApexBundle[] = [
        { type: 'apex', name: 'Test', content: newInterfaceSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect((data as ChangeLogPageData).content).toContain('### Test'));
    });

    it('should include the new interface description', async () => {
      const newInterfaceSource = `
        /**
         * This is a test interface.
         */
        interface Test {}
      `;

      const oldBundle: UnparsedApexBundle[] = [];
      const newBundle: UnparsedApexBundle[] = [
        { type: 'apex', name: 'Test', content: newInterfaceSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) =>
        expect((data as ChangeLogPageData).content).toContain('This is a test interface.'),
      );
    });
  });

  describe('that include new enums', () => {
    it('should include a section for new enums', async () => {
      const newEnumSource = 'enum Test {}';

      const oldBundle: UnparsedApexBundle[] = [];
      const newBundle: UnparsedApexBundle[] = [
        { type: 'apex', name: 'Test', content: newEnumSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect((data as ChangeLogPageData).content).toContain('## New Enums'));
    });

    it('should include the new enum name', async () => {
      const newEnumSource = 'enum Test {}';

      const oldBundle: UnparsedApexBundle[] = [];
      const newBundle: UnparsedApexBundle[] = [
        { type: 'apex', name: 'Test', content: newEnumSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect((data as ChangeLogPageData).content).toContain('### Test'));
    });

    it('should include the new enum description', async () => {
      const newEnumSource = `
        /**
         * This is a test enum.
         */
        enum Test {}
      `;

      const oldBundle: UnparsedApexBundle[] = [];
      const newBundle: UnparsedApexBundle[] = [
        { type: 'apex', name: 'Test', content: newEnumSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect((data as ChangeLogPageData).content).toContain('This is a test enum.'));
    });
  });

  describe('that include new custom objects', () => {
    it('should include a section for new custom objects', async () => {
      const newObjectSource = customObjectGenerator();

      const oldBundle: UnparsedCustomObjectBundle[] = [];
      const newBundle: UnparsedCustomObjectBundle[] = [
        { type: 'customobject', name: 'MyTestObject', content: newObjectSource, filePath: 'MyTestObject.object' },
      ];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect((data as ChangeLogPageData).content).toContain('## New Custom Objects'));
    });
  });

  describe('that includes new types out of scope', () => {
    it('should not include them', async () => {
      const newClassSource = 'class Test {}';

      const oldBundle: UnparsedApexBundle[] = [];
      const newBundle: UnparsedApexBundle[] = [
        { type: 'apex', name: 'Test', content: newClassSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const result = await generateChangeLog(oldBundle, newBundle, { ...config, scope: ['global'] })();

      assertEither(result, (data) => expect((data as ChangeLogPageData).content).not.toContain('## New Classes'));
    });
  });

  describe('that includes removed types', () => {
    it('should include a section for removed types', async () => {
      const oldClassSource = 'class Test {}';

      const oldBundle: UnparsedApexBundle[] = [
        { type: 'apex', name: 'Test', content: oldClassSource, filePath: 'Test.cls', metadataContent: null },
      ];
      const newBundle: UnparsedApexBundle[] = [];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect((data as ChangeLogPageData).content).toContain('## Removed Types'));
    });

    it('should include the removed type name', async () => {
      const oldClassSource = 'class Test {}';

      const oldBundle: UnparsedApexBundle[] = [
        { type: 'apex', name: 'Test', content: oldClassSource, filePath: 'Test.cls', metadataContent: null },
      ];
      const newBundle: UnparsedApexBundle[] = [];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect((data as ChangeLogPageData).content).toContain('- Test'));
    });
  });

  describe('that includes modifications to existing members', () => {
    it('should include a section for new or modified members', async () => {
      const oldClassSource = 'class Test {}';
      const newClassSource = 'class Test { void myMethod() {} }';

      const oldBundle: UnparsedApexBundle[] = [
        { type: 'apex', name: 'Test', content: oldClassSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const newBundle: UnparsedApexBundle[] = [
        { type: 'apex', name: 'Test', content: newClassSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) =>
        expect((data as ChangeLogPageData).content).toContain('## New or Modified Members in Existing Types'),
      );
    });

    it('should include the new or modified type name', async () => {
      const oldClassSource = 'class Test {}';
      const newClassSource = 'class Test { void myMethod() {} }';

      const oldBundle: UnparsedApexBundle[] = [
        { type: 'apex', name: 'Test', content: oldClassSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const newBundle: UnparsedApexBundle[] = [
        { type: 'apex', name: 'Test', content: newClassSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect((data as ChangeLogPageData).content).toContain('### Test'));
    });

    it('should include the new or modified member name', async () => {
      const oldClassSource = 'class Test {}';
      const newClassSource = 'class Test { void myMethod() {} }';

      const oldBundle: UnparsedApexBundle[] = [
        { type: 'apex', name: 'Test', content: oldClassSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const newBundle: UnparsedApexBundle[] = [
        { type: 'apex', name: 'Test', content: newClassSource, filePath: 'Test.cls', metadataContent: null },
      ];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect((data as ChangeLogPageData).content).toContain('myMethod'));
    });
  });
});
