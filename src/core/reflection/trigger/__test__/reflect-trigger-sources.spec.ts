import { UnparsedTriggerBundle } from 'src/core/shared/types';
import { assertEither } from '../../../test-helpers/assert-either';
import { TriggerBuilder } from '../../../test-helpers/test-data-builders/trigger-builder';
import { reflectTriggerSource } from '../reflect-trigger-source';
import { isInSource } from '../../../shared/utils';

describe('when parsing Triggers', () => {
  test('the resulting type contains the file path', async () => {
    const unparsed: UnparsedTriggerBundle = {
      type: 'trigger',
      name: 'MyFirstTrigger',
      filePath: 'src/triggers/MyFirstTrigger.trigger',
      content: new TriggerBuilder().build(),
    };

    const result = await reflectTriggerSource([unparsed])();

    assertEither(result, (data) => {
      if (isInSource(data[0].source)) {
        expect(data[0].source.filePath).toBe('src/triggers/MyFirstTrigger.trigger');
      } else {
        fail('Expected the source to be in the source');
      }
    });
  });

  test('the resulting type contains the correct name', async () => {
    const unparsed: UnparsedTriggerBundle = {
      type: 'trigger',
      name: 'MyFirstTrigger',
      filePath: 'src/triggers/MyFirstTrigger.trigger',
      content: new TriggerBuilder().build(),
    };

    const result = await reflectTriggerSource([unparsed])();

    assertEither(result, (data) => {
      expect(data[0].type.name).toBe('MyFirstTrigger');
    });
  });

  test('the resulting type contains the object name', async () => {
    const unparsed: UnparsedTriggerBundle = {
      type: 'trigger',
      name: 'MyFirstTrigger',
      filePath: 'src/triggers/MyFirstTrigger.trigger',
      content: new TriggerBuilder().withObjectName('Account').build(),
    };

    const result = await reflectTriggerSource([unparsed])();

    assertEither(result, (data) => {
      expect(data[0].type.object_name).toBe('Account');
    });
  });

  test('the resulting type contains the correct events', async () => {
    const unparsed: UnparsedTriggerBundle = {
      type: 'trigger',
      name: 'MyFirstTrigger',
      filePath: 'src/triggers/MyFirstTrigger.trigger',
      content: new TriggerBuilder().withEvents(['before insert']).build(),
    };

    const result = await reflectTriggerSource([unparsed])();

    assertEither(result, (data) => {
      expect(data[0].type.events).toEqual(['beforeinsert']);
    });
  });
});
