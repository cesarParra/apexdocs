import { ChangeLog } from '../process-change-log';
import { convertToRenderableChangeLog } from '../renderable-change-log';
import { ClassMirrorBuilder } from '../../../test-helpers/ClassMirrorBuilder';

describe('when converting a change log to a renderable change log', () => {
  it('does not include new classes if there are none', () => {
    const changeLog: ChangeLog = {
      newTypes: [],
      removedTypes: [],
      newOrModifiedMembers: [],
    };

    const renderable = convertToRenderableChangeLog(changeLog, []);

    expect(renderable.newClasses).toBeNull();
  });

  it('includes new classes if there are any', () => {
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
