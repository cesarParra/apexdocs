import { generateChangeLog } from '../generate-changelog';
import { reflect, Type } from '@cparra/apex-reflection';

function typeFromRawString(raw: string): Type {
  const result = reflect(raw);
  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.typeMirror!;
}

describe('when generating a change log', () => {
  it('results in an empty change log when both the old and new versions are empty', () => {
    const oldVersion = { types: [] };
    const newVersion = { types: [] };

    const changeLog = generateChangeLog(oldVersion, newVersion);

    expect(changeLog).toEqual({
      newTypes: [],
    });
  });

  it('results in an empty change log when both the old and new versions are the same', () => {
    const anyClassBody = 'public class AnyClass {}';
    const anyClass = typeFromRawString(anyClassBody);
    const oldVersion = { types: [anyClass] };
    const newVersion = { types: [anyClass] };

    const changeLog = generateChangeLog(oldVersion, newVersion);

    expect(changeLog).toEqual({
      newTypes: [],
    });
  });

  it('lists all new types', () => {
    const existingInBoth = 'public class ExistingInBoth {}';
    const existingClass = typeFromRawString(existingInBoth);
    const oldVersion = { types: [existingClass] };
    const newClassBody = 'public class NewClass {}';
    const newClass = typeFromRawString(newClassBody);
    const newVersion = { types: [existingClass, newClass] };

    const changeLog = generateChangeLog(oldVersion, newVersion);

    expect(changeLog).toEqual({
      newTypes: [newClass.name],
    });
  });
});
