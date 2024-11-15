import { reflectCustomObjectSources } from '../reflect-custom-object-sources';
import { UnparsedCustomObjectBundle } from '../../../shared/types';
import { assertEither } from '../../../test-helpers/assert-either';
import * as E from 'fp-ts/Either';
import {
  CustomObjectXmlBuilder,
  InlineFieldBuilder,
} from '../../../test-helpers/test-data-builders/custom-object-xml-builder';
import { isInSource } from '../../../shared/utils';

describe('when parsing SObject metadata', () => {
  test('the resulting type contains the file path', async () => {
    const unparsed: UnparsedCustomObjectBundle = {
      type: 'customobject',
      name: 'MyFirstObject__c',
      filePath: 'src/object/MyFirstObject__c.object-meta.xml',
      content: new CustomObjectXmlBuilder().build(),
    };

    const result = await reflectCustomObjectSources([unparsed])();

    assertEither(result, (data) => {
      if (isInSource(data[0].source)) {
        expect(data[0].source.filePath).toBe('src/object/MyFirstObject__c.object-meta.xml');
      } else {
        fail('Expected the source to be in the source');
      }
    });
  });

  test('the resulting type contains the correct label', async () => {
    const unparsed: UnparsedCustomObjectBundle = {
      type: 'customobject',
      name: 'MyFirstObject__c',
      filePath: 'src/object/MyFirstObject__c.object-meta.xml',
      content: new CustomObjectXmlBuilder().withLabel('MyFirstObject').build(),
    };

    const result = await reflectCustomObjectSources([unparsed])();

    assertEither(result, (data) => {
      expect(data[0].type.label).toBe('MyFirstObject');
    });
  });

  test('the resulting type contains the correct name', async () => {
    const unparsed: UnparsedCustomObjectBundle = {
      type: 'customobject',
      name: 'MyFirstObject__c',
      filePath: 'src/object/MyFirstObject__c.object-meta.xml',
      content: new CustomObjectXmlBuilder().build(),
    };

    const result = await reflectCustomObjectSources([unparsed])();

    assertEither(result, (data) => {
      expect(data[0].type.name).toBe('MyFirstObject__c');
    });
  });

  test('the resulting type contains the deployment status', async () => {
    const unparsed: UnparsedCustomObjectBundle = {
      type: 'customobject',
      name: 'MyFirstObject__c',
      filePath: 'src/object/MyFirstObject__c.object-meta.xml',
      content: new CustomObjectXmlBuilder().build(),
    };

    const result = await reflectCustomObjectSources([unparsed])();

    assertEither(result, (data) => {
      expect(data[0].type.deploymentStatus).toBe('Deployed');
    });
  });

  test('the deployment status is "Deployed" by default', async () => {
    const sObjectContent = `
    <?xml version="1.0" encoding="UTF-8"?>
    <CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
        <description>test object for testing</description>
        <label>MyFirstObject</label>
        <pluralLabel>MyFirstObjects</pluralLabel>
    </CustomObject>`;

    const unparsed: UnparsedCustomObjectBundle = {
      type: 'customobject',
      name: 'MyFirstObject__c',
      filePath: 'src/object/MyFirstObject__c.object-meta.xml',
      content: sObjectContent,
    };

    const result = await reflectCustomObjectSources([unparsed])();

    assertEither(result, (data) => {
      expect(data[0].type.deploymentStatus).toBe('Deployed');
    });
  });

  test('the resulting type contains the visibility', async () => {
    const unparsed: UnparsedCustomObjectBundle = {
      type: 'customobject',
      name: 'MyFirstObject__c',
      filePath: 'src/object/MyFirstObject__c.object-meta.xml',
      content: new CustomObjectXmlBuilder().build(),
    };

    const result = await reflectCustomObjectSources([unparsed])();

    assertEither(result, (data) => {
      expect(data[0].type.visibility).toBe('Public');
    });
  });

  test('the visibility is "Public" by default', async () => {
    const sObjectContent = `
    <?xml version="1.0" encoding="UTF-8"?>
    <CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
        <deploymentStatus>Deployed</deploymentStatus>
        <description>test object for testing</description>
        <label>MyFirstObject</label>
        <pluralLabel>MyFirstObjects</pluralLabel>
    </CustomObject>`;

    const unparsed: UnparsedCustomObjectBundle = {
      type: 'customobject',
      name: 'MyFirstObject__c',
      filePath: 'src/object/MyFirstObject__c.object-meta.xml',
      content: sObjectContent,
    };

    const result = await reflectCustomObjectSources([unparsed])();

    assertEither(result, (data) => {
      expect(data[0].type.visibility).toBe('Public');
    });
  });

  test('an error is thrown when the XML is in an invalid format', async () => {
    const sObjectContent = `
    <?xml version="1.0" encoding="UTF-8"?>
    <SomethingInvalid xmlns="http://soap.sforce.com/2006/04/metadata">
        <deploymentStatus>Deployed</deploymentStatus>
        <description>test object for testing</description>
        <label>MyFirstObject</label>
        <pluralLabel>MyFirstObjects</pluralLabel>
        <visibility>Public</visibility>
    </SomethingInvalid>`;

    const unparsed: UnparsedCustomObjectBundle = {
      type: 'customobject',
      name: 'MyFirstObject__c',
      filePath: 'src/object/MyFirstObject__c.object-meta.xml',
      content: sObjectContent,
    };

    const result = await reflectCustomObjectSources([unparsed])();

    expect(E.isLeft(result)).toBe(true);
  });

  test('has no fields when there are no fields in the XML', async () => {
    const sObjectContent = `
    <?xml version="1.0" encoding="UTF-8"?>
    <CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
        <deploymentStatus>Deployed</deploymentStatus>
        <description>test object for testing</description>
        <label>MyFirstObject</label>
        <pluralLabel>MyFirstObjects</pluralLabel>
        <visibility>Public</visibility>
    </CustomObject>`;

    const unparsed: UnparsedCustomObjectBundle = {
      type: 'customobject',
      name: 'MyFirstObject__c',
      filePath: 'src/object/MyFirstObject__c.object-meta.xml',
      content: sObjectContent,
    };

    const result = await reflectCustomObjectSources([unparsed])();

    assertEither(result, (data) => {
      expect(data[0].type.fields).toEqual([]);
    });
  });

  test('has a field when one is present in the XML', async () => {
    const unparsed: UnparsedCustomObjectBundle = {
      type: 'customobject',
      name: 'MyFirstObject__c',
      filePath: 'src/object/MyFirstObject__c.object-meta.xml',
      content: new CustomObjectXmlBuilder().withFields([new InlineFieldBuilder().withFullName('TestField__c')]).build(),
    };

    const result = await reflectCustomObjectSources([unparsed])();

    assertEither(result, (data) => {
      expect(data[0].type.fields).toHaveLength(1);
      expect(data[0].type.fields[0].name).toBe('TestField__c');
    });
  });

  test('has fields when multiple fields are present in the XML', async () => {
    const unparsed: UnparsedCustomObjectBundle = {
      type: 'customobject',
      name: 'MyFirstObject__c',
      filePath: 'src/object/MyFirstObject__c.object-meta.xml',
      content: new CustomObjectXmlBuilder()
        .withFields([
          new InlineFieldBuilder().withFullName('TestField1__c'),
          new InlineFieldBuilder().withFullName('TestField2__c'),
        ])
        .build(),
    };

    const result = await reflectCustomObjectSources([unparsed])();

    assertEither(result, (data) => {
      expect(data[0].type.fields).toHaveLength(2);
      expect(data[0].type.fields[0].name).toBe('TestField1__c');
      expect(data[0].type.fields[1].name).toBe('TestField2__c');
    });
  });
});
