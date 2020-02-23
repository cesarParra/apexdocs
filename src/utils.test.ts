import * as utils from './utils';

test('findPreviousWord correctly returns word', () => {
  const testString = 'public static void testMethod(';
  const startPotition = testString.indexOf('(');
  expect(utils.findPreviousWord(testString, startPotition)).toBe('testMethod');
});

test('findPreviousWord correctly returns word when there are spaces in between method name and parenthesis', () => {
  const testString = 'public static void testMethod (';
  const startPotition = testString.indexOf('(');
  expect(utils.findPreviousWord(testString, startPotition)).toBe('testMethod');
});

test('findPreviousWord correctly returns null when the starting position is longer than the string', () => {
  const testString = 'public static void testMethod(';
  const startPotition = testString.length;
  expect(utils.findPreviousWord(testString, startPotition)).toBeNull();
});

test('findPreviousWord returns null when there are no spaces backwards', () => {
  const testString = 'abc(';
  const startPotition = testString.indexOf('(');
  expect(utils.findPreviousWord(testString, startPotition)).toBeNull();
});

test('peek returns null when the passed array is null', () => {
  const testArray = null;
  expect(utils.peek(testArray)).toBeNull();
});

test('peek returns null when the passed array is empty', () => {
  const testArray: string[] = [];
  expect(utils.peek(testArray)).toBeNull();
});

test('peek returns last element of array', () => {
  const testArray = ['a', 'b', 'c'];
  expect(utils.peek(testArray)).toBe('c');
});
