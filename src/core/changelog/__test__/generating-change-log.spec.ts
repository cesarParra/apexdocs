import {
  ChangeLogPageData,
  UnparsedApexBundle,
  UnparsedCustomObjectBundle,
  UnparsedSourceBundle,
} from '../../shared/types';
import { generateChangeLog } from '../generate-change-log';
import { assertEither } from '../../test-helpers/assert-either';
import { isSkip } from '../../shared/utils';
import { unparsedFieldBundleFromRawString } from '../../test-helpers/test-data-builders';
import { CustomObjectXmlBuilder } from '../../test-helpers/test-data-builders/custom-object-xml-builder';
import { CustomFieldXmlBuilder } from '../../test-helpers/test-data-builders/custom-field-xml-builder';

const config = {
  fileName: 'changelog',
  scope: ['global', 'public', 'private'],
  targetDir: '',
  currentVersionDir: '',
  previousVersionDir: '',
  exclude: [],
  skipIfNoChanges: false,
};

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
      const newObjectSource = new CustomObjectXmlBuilder().build();

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

  describe('that includes removed custom objects', () => {
    it('should include a section for removed custom objects', async () => {
      const oldObjectSource = new CustomObjectXmlBuilder().build();

      const oldBundle: UnparsedCustomObjectBundle[] = [
        { type: 'customobject', name: 'MyTestObject', content: oldObjectSource, filePath: 'MyTestObject.object' },
      ];
      const newBundle: UnparsedCustomObjectBundle[] = [];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) =>
        expect((data as ChangeLogPageData).content).toContain('## Removed Custom Objects'),
      );
    });

    it('should include the removed custom object name', async () => {
      const oldObjectSource = new CustomObjectXmlBuilder().build();

      const oldBundle: UnparsedCustomObjectBundle[] = [
        { type: 'customobject', name: 'MyTestObject', content: oldObjectSource, filePath: 'MyTestObject.object' },
      ];
      const newBundle: UnparsedCustomObjectBundle[] = [];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect((data as ChangeLogPageData).content).toContain('- MyTestObject'));
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

  describe('that includes modifications to custom fields', () => {
    it('should include a section for new or removed custom fields', async () => {
      const oldObjectSource = new CustomObjectXmlBuilder().build();
      const newObjectSource = new CustomObjectXmlBuilder().build();

      const oldBundle: UnparsedSourceBundle[] = [
        { type: 'customobject', name: 'MyTestObject', content: oldObjectSource, filePath: 'MyTestObject.object' },
      ];
      const newBundle: UnparsedSourceBundle[] = [
        { type: 'customobject', name: 'MyTestObject', content: newObjectSource, filePath: 'MyTestObject.object' },
        unparsedFieldBundleFromRawString({
          filePath: 'MyTestObject__c.field-meta.xml',
          parentName: 'MyTestObject',
        }),
      ];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) =>
        expect((data as ChangeLogPageData).content).toContain(
          '## New or Removed Fields to Custom Objects or Standard Objects',
        ),
      );
    });

    it('should include new custom field names', async () => {
      const oldObjectSource = new CustomObjectXmlBuilder().build();
      const newObjectSource = new CustomObjectXmlBuilder().build();

      const oldBundle: UnparsedSourceBundle[] = [
        { type: 'customobject', name: 'MyTestObject', content: oldObjectSource, filePath: 'MyTestObject.object' },
      ];
      const newBundle: UnparsedSourceBundle[] = [
        { type: 'customobject', name: 'MyTestObject', content: newObjectSource, filePath: 'MyTestObject.object' },
        unparsedFieldBundleFromRawString({
          filePath: 'MyTestObject__c.field-meta.xml',
          parentName: 'MyTestObject',
        }),
      ];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect((data as ChangeLogPageData).content).toContain('New Field: TestField__c'));
    });

    it('should include removed custom field names', async () => {
      const oldObjectSource = new CustomObjectXmlBuilder().build();
      const newObjectSource = new CustomObjectXmlBuilder().build();

      const oldBundle: UnparsedSourceBundle[] = [
        { type: 'customobject', name: 'MyTestObject', content: oldObjectSource, filePath: 'MyTestObject.object' },
        unparsedFieldBundleFromRawString({
          filePath: 'MyTestObject__c.field-meta.xml',
          parentName: 'MyTestObject',
        }),
      ];
      const newBundle: UnparsedSourceBundle[] = [
        { type: 'customobject', name: 'MyTestObject', content: newObjectSource, filePath: 'MyTestObject.object' },
      ];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) =>
        expect((data as ChangeLogPageData).content).toContain('Removed Field: TestField__c'),
      );
    });
  });

  describe('that includes extension fields', () => {
    it('does not include the fields when they are in both versions', async () => {
      const fieldSource = new CustomFieldXmlBuilder().build();

      const oldBundle: UnparsedSourceBundle[] = [
        {
          type: 'customfield',
          name: 'PhotoUrl__c',
          content: fieldSource,
          filePath: 'PhotoUrl__c.field-meta.xml',
          parentName: 'MyTestObject',
        },
      ];
      const newBundle: UnparsedSourceBundle[] = [
        {
          type: 'customfield',
          name: 'PhotoUrl__c',
          content: fieldSource,
          filePath: 'PhotoUrl__c.field-meta.xml',
          parentName: 'MyTestObject',
        },
      ];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect((data as ChangeLogPageData).content).not.toContain('MyTestObject'));
      assertEither(result, (data) => expect((data as ChangeLogPageData).content).not.toContain('PhotoUrl__c'));
    });

    it('includes added fields when they are not in the old version', async () => {
      const fieldSource = new CustomFieldXmlBuilder().build();

      const oldBundle: UnparsedSourceBundle[] = [];
      const newBundle: UnparsedSourceBundle[] = [
        {
          type: 'customfield',
          name: 'PhotoUrl__c',
          content: fieldSource,
          filePath: 'PhotoUrl__c.field-meta.xml',
          parentName: 'MyTestObject',
        },
      ];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect((data as ChangeLogPageData).content).toContain('MyTestObject'));
      assertEither(result, (data) => expect((data as ChangeLogPageData).content).toContain('PhotoUrl__c'));
    });

    it('includes removed fields when they are not in the new version', async () => {
      const fieldSource = new CustomFieldXmlBuilder().build();

      const oldBundle: UnparsedSourceBundle[] = [
        {
          type: 'customfield',
          name: 'PhotoUrl__c',
          content: fieldSource,
          filePath: 'PhotoUrl__c.field-meta.xml',
          parentName: 'MyTestObject',
        },
      ];
      const newBundle: UnparsedSourceBundle[] = [];

      const result = await generateChangeLog(oldBundle, newBundle, config)();

      assertEither(result, (data) => expect((data as ChangeLogPageData).content).toContain('MyTestObject'));
      assertEither(result, (data) => expect((data as ChangeLogPageData).content).toContain('PhotoUrl__c'));
    });
  });

  describe('and a custom hook is provided to customize the frontmatter', () => {
    it('includes the custom frontmatter', async () => {
      const hook = () => ({
        frontmatter: '---\ntitle: Custom Title\n---',
      });

      const result = await generateChangeLog([], [], { ...config, transformChangeLogPage: hook })();

      assertEither(result, (data) => expect((data as ChangeLogPageData).frontmatter).toContain('title: Custom Title'));
    });
  });
});
