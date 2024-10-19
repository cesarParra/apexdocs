import { reflectSObjectSources } from '../reflect-sobject-source';
import { UnparsedCustomObjectBundle } from '../../../shared/types';
import { assertEither } from '../../../test-helpers/assert-either';
import * as E from 'fp-ts/Either';

const sObjectContent = `
    <?xml version="1.0" encoding="UTF-8"?>
    <CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
        <deploymentStatus>Deployed</deploymentStatus>
        <description>test object for testing</description>
        <label>MyFirstObject</label>
        <pluralLabel>MyFirstObjects</pluralLabel>
        <visibility>Public</visibility>
    </CustomObject>`;

describe('when parsing SObject metadata', () => {
  test('the resulting type is "sobject"', async () => {
    const unparsed: UnparsedCustomObjectBundle = {
      type: 'sobject',
      name: 'MyFirstObject__c',
      filePath: 'src/object/MyFirstObject__c.object-meta.xml',
      content: sObjectContent,
    };

    const result = await reflectSObjectSources([unparsed])();

    assertEither(result, (data) => expect(data.length).toBe(1));
    assertEither(result, (data) => expect(data[0].source.type).toBe('sobject'));
    assertEither(result, (data) => expect(data[0].type.type_name).toBe('sobject'));
  });

  test('the resulting type contains the file path', async () => {
    const unparsed: UnparsedCustomObjectBundle = {
      type: 'sobject',
      name: 'MyFirstObject__c',
      filePath: 'src/object/MyFirstObject__c.object-meta.xml',
      content: sObjectContent,
    };

    const result = await reflectSObjectSources([unparsed])();

    assertEither(result, (data) => expect(data[0].source.filePath).toBe('src/object/MyFirstObject__c.object-meta.xml'));
  });

  test('the resulting type contains the correct label', async () => {
    const unparsed: UnparsedCustomObjectBundle = {
      type: 'sobject',
      name: 'MyFirstObject__c',
      filePath: 'src/object/MyFirstObject__c.object-meta.xml',
      content: sObjectContent,
    };

    const result = await reflectSObjectSources([unparsed])();

    assertEither(result, (data) => {
      expect(data[0].type.label).toBe('MyFirstObject');
    });
  });

  test('the resulting type contains the correct name', async () => {
    const unparsed: UnparsedCustomObjectBundle = {
      type: 'sobject',
      name: 'MyFirstObject__c',
      filePath: 'src/object/MyFirstObject__c.object-meta.xml',
      content: sObjectContent,
    };

    const result = await reflectSObjectSources([unparsed])();

    assertEither(result, (data) => {
      expect(data[0].type.name).toBe('MyFirstObject__c');
    });
  });

  test('the resulting type contains the deployment status', async () => {
    const unparsed: UnparsedCustomObjectBundle = {
      type: 'sobject',
      name: 'MyFirstObject__c',
      filePath: 'src/object/MyFirstObject__c.object-meta.xml',
      content: sObjectContent,
    };

    const result = await reflectSObjectSources([unparsed])();

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
      type: 'sobject',
      name: 'MyFirstObject__c',
      filePath: 'src/object/MyFirstObject__c.object-meta.xml',
      content: sObjectContent,
    };

    const result = await reflectSObjectSources([unparsed])();

    assertEither(result, (data) => {
      expect(data[0].type.deploymentStatus).toBe('Deployed');
    });
  });

  test('the resulting type contains the visibility', async () => {
    const unparsed: UnparsedCustomObjectBundle = {
      type: 'sobject',
      name: 'MyFirstObject__c',
      filePath: 'src/object/MyFirstObject__c.object-meta.xml',
      content: sObjectContent,
    };

    const result = await reflectSObjectSources([unparsed])();

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
      type: 'sobject',
      name: 'MyFirstObject__c',
      filePath: 'src/object/MyFirstObject__c.object-meta.xml',
      content: sObjectContent,
    };

    const result = await reflectSObjectSources([unparsed])();

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
      type: 'sobject',
      name: 'MyFirstObject__c',
      filePath: 'src/object/MyFirstObject__c.object-meta.xml',
      content: sObjectContent,
    };

    const result = await reflectSObjectSources([unparsed])();

    expect(E.isLeft(result)).toBe(true);
  });

  test('an error is thrown when the label is missing', async () => {
    const sObjectContent = `
    <?xml version="1.0" encoding="UTF-8"?>
    <CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
        <deploymentStatus>Deployed</deploymentStatus>
        <description>test object for testing</description>
        <pluralLabel>MyFirstObjects</pluralLabel>
        <visibility>Public</visibility>
    </CustomObject>`;

    const unparsed: UnparsedCustomObjectBundle = {
      type: 'sobject',
      name: 'MyFirstObject__c',
      filePath: 'src/object/MyFirstObject__c.object-meta.xml',
      content: sObjectContent,
    };

    const result = await reflectSObjectSources([unparsed])();

    expect(E.isLeft(result)).toBe(true);
  });
});
