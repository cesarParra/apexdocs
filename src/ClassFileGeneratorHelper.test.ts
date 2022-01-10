import ClassFileGeneratorHelper from './ClassFileGeneratorHelper';
import ClassModel from './Model/ClassModel';
import Settings from './Settings';

test('that getSanitizedGroup returns the same string when there is nothing to sanitize', () => {
  const testClass = new ClassModel();
  testClass.setClassGroup('GroupName');

  expect(ClassFileGeneratorHelper.getSanitizedGroup(testClass)).toBe('GroupName');
});

test('that getSanitizedGroup replaces spaces with dashes', () => {
  const testClass = new ClassModel();
  testClass.setClassGroup('Group Name');

  expect(ClassFileGeneratorHelper.getSanitizedGroup(testClass)).toBe('Group-Name');
});

test('that getSanitizedGroup removes dots', () => {
  const testClass = new ClassModel();
  testClass.setClassGroup('Group Na.me');

  expect(ClassFileGeneratorHelper.getSanitizedGroup(testClass)).toBe('Group-Name');
});

test('that getFileLink returns the correct string when grouping is off', () => {
  Settings.getInstance().setShouldGroup(false);

  const testClass = new ClassModel();
  testClass.setClassName('MyTestClassName');

  expect(ClassFileGeneratorHelper.getFileLink(testClass)).toBe('[MyTestClassName](/MyTestClassName.md)');
});

test('that getFileLink returns the correct string when grouping is on', () => {
  Settings.getInstance().setShouldGroup(true);

  const testClass = new ClassModel();
  testClass.setClassName('MyTestClassName');

  expect(ClassFileGeneratorHelper.getFileLink(testClass)).toBe(
    `[MyTestClassName](/${ClassFileGeneratorHelper.getSanitizedGroup(testClass)}/MyTestClassName.md)`,
  );
});
