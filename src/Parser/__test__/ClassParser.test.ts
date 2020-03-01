import ClassModel from '../../model/ClassModel';
import ClassParser from '../ClassParser';

const nameLine = 'public with sharing class Test {';
const commentLines = [
  '/**',
  ' * @description This is my class description.',
  ' * @author John Doe',
  ' * @date 1/1/2020',
  ' * @group API',
  ' * @group-content /example.html',
  ' */',
];

test('name line is set correctly', () => {
  const builtClassModel = new ClassParser().getClass(nameLine, commentLines, 4);

  expect(builtClassModel.getNameLine()).toBe(nameLine);
});

test('whether if class is interface was set correctly', () => {
  const builtClassModel = new ClassParser().getClass(nameLine, commentLines, 4);

  expect(builtClassModel.getIsInterface()).toBe(false);
});

test('that author was set correctly', () => {
  const builtClassModel = new ClassParser().getClass(nameLine, commentLines, 4);

  expect(builtClassModel.getAuthor()).toBe('John Doe');
});

test('that date was set correctly', () => {
  const builtClassModel = new ClassParser().getClass(nameLine, commentLines, 4);

  expect(builtClassModel.getDate()).toBe('1/1/2020');
});

test('that group was set correctly', () => {
  const builtClassModel = new ClassParser().getClass(nameLine, commentLines, 4);

  expect(builtClassModel.getClassGroup()).toBe('API');
});

test('that group content was set correctly', () => {
  const builtClassModel = new ClassParser().getClass(nameLine, commentLines, 4);

  expect(builtClassModel.getClassGroupContent()).toBe('/example.html');
});

test('that description content was set correctly', () => {
  const builtClassModel = new ClassParser().getClass(nameLine, commentLines, 4);

  expect(builtClassModel.getDescription()).toBe('This is my class description.');
});

test('that description content was set correctly when there are multiple description line', () => {
  const multiLineDescriptionComment = [
    '/**',
    ' * @description This is my class description.',
    ' The class description continues here.',
    'And keeps going.',
    ' */',
  ];

  const builtClassModel = new ClassParser().getClass(nameLine, multiLineDescriptionComment, 4);

  expect(builtClassModel.getDescription()).toBe(
    'This is my class description. The class description continues here. And keeps going. /',
  );
});
