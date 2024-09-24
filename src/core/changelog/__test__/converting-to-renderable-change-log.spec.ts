import { ChangeLog } from '../process-change-log';
import { convertToRenderableChangeLog } from '../renderable-change-log';
import { ClassMirrorBuilder } from '../../../test-helpers/ClassMirrorBuilder';

describe('when converting a changelog to a renderable changelog', () => {
  it('does not include the New Classes section if there are none', () => {
    const changeLog: ChangeLog = {
      newTypes: [],
      removedTypes: [],
      newOrModifiedMembers: [],
    };

    const renderable = convertToRenderableChangeLog(changeLog, []);

    expect(renderable.newClasses).toBeNull();
  });

  it('includes the New Classes section if there are any', () => {
    const newClasses = [new ClassMirrorBuilder().withName('MyClass').build()];
    const changeLog: ChangeLog = {
      newTypes: ['MyClass'],
      removedTypes: [],
      newOrModifiedMembers: [],
    };

    const renderable = convertToRenderableChangeLog(changeLog, newClasses);

    expect(renderable.newClasses).toEqual({
      __type: 'class',
      heading: 'New Classes',
      description: 'These classes are new.',
    });
  });
});
