import FileParser from './FileParser';
import { contents } from './testFileContents';

test('empty string returns null', () => {
  const parser = new FileParser();

  expect(parser.parseFileContents('')).toBe(null);
});

test('that class is parsed correctly', () => {
  const classModel = new FileParser().parseFileContents(contents);

  expect(classModel).toBeTruthy();
});
