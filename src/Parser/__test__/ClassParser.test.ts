import ClassParser from '../ClassParser';

const nameLine = 'public with sharing class Test {';
const commentLines = [
  '/**',
  ' * @description This is my class description.',
  ' * @author John Doe',
  ' * @author Jane Doe',
  ' * @date 1/1/2020',
  ' * @date 2/2/2021',
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

  expect(builtClassModel.getAuthors()).toHaveLength(2);
  expect(builtClassModel.getAuthors()[0]).toBe('John Doe');
  expect(builtClassModel.getAuthors()[1]).toBe('Jane Doe');
});

test('that date was set correctly', () => {
  const builtClassModel = new ClassParser().getClass(nameLine, commentLines, 4);

  expect(builtClassModel.getDates()).toHaveLength(2);
  expect(builtClassModel.getDates()[0]).toBe('1/1/2020');
  expect(builtClassModel.getDates()[1]).toBe('2/2/2021');
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
