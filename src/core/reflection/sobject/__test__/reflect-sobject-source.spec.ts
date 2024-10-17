import { reflectSObjectSources } from '../reflect-sobject-source';
import { UnparsedSObjectBundle } from '../../../shared/types';
import { assertEither } from '../../../test-helpers/assert-either';

const sObjectContent = `
    <?xml version="1.0" encoding="UTF-8"?>
    <CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
        <deploymentStatus>Deployed</deploymentStatus>
        <description>test object for testing</description>
        <label>MyFirstObject</label>
        <pluralLabel>MyFirstObjects</pluralLabel>
    </CustomObject>`;

describe('when parsing SObject metadata', () => {
  test('the resulting type is "sobject"', async () => {
    const unparsed: UnparsedSObjectBundle = {
      type: 'sobject',
      filePath: 'src/object/MyFirstObject__c.object-meta.xml',
      content: sObjectContent,
    };

    const result = await reflectSObjectSources([unparsed])();

    assertEither(result, (data) => expect(data.length).toBe(1));
    assertEither(result, (data) => expect(data[0].source.type).toBe('sobject'));
  });
});

// TODO: Test that things are validated
