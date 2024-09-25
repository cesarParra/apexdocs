import { ChangeLog } from '../process-change-log';
import { convertToRenderableChangeLog } from '../renderable-change-log';
import { ClassMirrorBuilder } from '../../../test-helpers/ClassMirrorBuilder';
import { InterfaceMirrorBuilder } from '../../../test-helpers/InterfaceMirrorBuilder';
import { EnumMirrorBuilder } from '../../../test-helpers/EnumMirrorBuilder';

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

    expect(renderable.newClasses).not.toBeNull();
  });

  it('does not include the New Interfaces section if there are none', () => {
    const changeLog: ChangeLog = {
      newTypes: [],
      removedTypes: [],
      newOrModifiedMembers: [],
    };

    const renderable = convertToRenderableChangeLog(changeLog, []);

    expect(renderable.newInterfaces).toBeNull();
  });

  it('includes the New Interfaces section if there are any', () => {
    const newInterfaces = [new InterfaceMirrorBuilder().withName('MyInterface').build()];
    const changeLog: ChangeLog = {
      newTypes: ['MyInterface'],
      removedTypes: [],
      newOrModifiedMembers: [],
    };

    const renderable = convertToRenderableChangeLog(changeLog, newInterfaces);

    expect(renderable.newInterfaces).not.toBeNull();
  });

  it('does not include the New Enums section if there are none', () => {
    const changeLog: ChangeLog = {
      newTypes: [],
      removedTypes: [],
      newOrModifiedMembers: [],
    };

    const renderable = convertToRenderableChangeLog(changeLog, []);

    expect(renderable.newEnums).toBeNull();
  });

  it('includes the New Enums section if there are any', () => {
    const newEnums = [new EnumMirrorBuilder().withName('MyEnum').build()];
    const changeLog: ChangeLog = {
      newTypes: ['MyEnum'],
      removedTypes: [],
      newOrModifiedMembers: [],
    };

    const renderable = convertToRenderableChangeLog(changeLog, newEnums);

    expect(renderable.newEnums).not.toBeNull();
  });
});
