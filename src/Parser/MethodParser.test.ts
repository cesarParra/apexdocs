import MethoModel from '../model/MethodModel';
import MethodParser from './MethodParser';

const nameLine = 'public static void testMethod() {';
const commentLines = [
  '/**',
  ' * @description This is my class description.',
  ' * @author John Doe',
  ' * @date 1/1/2020',
  ' * @return This method returns a string.',
  ' * @param param1 Param1 description',
  ' * @param param2 Param1 description',
  ' * @example',
  ' * Example code',
  ' */',
];

test('that name line is set correctly', () => {
  const builtMethodModel = new MethodParser().getMethod('ClassName', nameLine, commentLines, 4);

  expect(builtMethodModel.getNameLine()).toBe('public static void testMethod()');
});

test('that method is constructor when class name is the same as the method name', () => {
  const builtMethodModel = new MethodParser().getMethod('testMethod', nameLine, commentLines, 4);

  expect(builtMethodModel.getIsConstructor()).toBe(true);
});

test('that method is not constructor when class name is the not the same as the method name', () => {
  const builtMethodModel = new MethodParser().getMethod('ClassName', nameLine, commentLines, 4);

  expect(builtMethodModel.getIsConstructor()).toBe(false);
});

test('that author is set', () => {
  const builtMethodModel = new MethodParser().getMethod('ClassName', nameLine, commentLines, 4);

  expect(builtMethodModel.getAuthor()).toBe('John Doe');
});

test('that date is set', () => {
  const builtMethodModel = new MethodParser().getMethod('ClassName', nameLine, commentLines, 4);

  expect(builtMethodModel.getDate()).toBe('1/1/2020');
});

test('that return is set', () => {
  const builtMethodModel = new MethodParser().getMethod('ClassName', nameLine, commentLines, 4);

  expect(builtMethodModel.getReturns()).toBe('This method returns a string.');
});

test('that params are set', () => {
  const builtMethodModel = new MethodParser().getMethod('ClassName', nameLine, commentLines, 4);

  expect(builtMethodModel.getParams().length).toBe(2);
  expect(builtMethodModel.getParams()).toContain('param1 Param1 description');
  expect(builtMethodModel.getParams()).toContain('param2 Param1 description');
});

test('that description is set', () => {
  const builtMethodModel = new MethodParser().getMethod('ClassName', nameLine, commentLines, 4);

  expect(builtMethodModel.getDescription()).toBe('This is my class description.');
});

test('that muitiline description is set', () => {
  const multiLineDescriptionCommentLines = [
    '/**',
    ' * @description This is my class description.',
    ' The description continues here.',
    ' * @author John Doe',
    ' * @date 1/1/2020',
    ' * @return This method returns a string.',
    ' * @param param1 Param1 description',
    ' * @param param2 Param1 description',
    ' */',
  ];

  const builtMethodModel = new MethodParser().getMethod('ClassName', nameLine, multiLineDescriptionCommentLines, 4);

  expect(builtMethodModel.getDescription()).toBe('This is my class description. The description continues here.');
});

test('that example is set', () => {
  const builtMethodModel = new MethodParser().getMethod('ClassName', nameLine, commentLines, 4);

  expect(builtMethodModel.getExample()).toContain('Example code');
});
