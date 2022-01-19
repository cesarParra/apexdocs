import * as fs from 'fs';
import { generate } from '../Generate';
import FileParser from '../../Parser/FileParser';

jest.mock('fs');
jest.mock('../../Parser/FileParser');

beforeEach(() => {
  (FileParser as jest.Mock).mockClear();
});

it('returns an empty list when there are no files', () => {
  (fs.readdirSync as jest.Mock).mockReturnValue([]);

  const classes = generate(['src']);

  expect(classes.length).toBe(0);
});

it('returns an empty list when there are no files ending in .cls', () => {
  (fs.readdirSync as jest.Mock).mockReturnValue(['file.xml', 'README.md']);

  const classes = generate(['src'], false);

  expect(classes.length).toBe(0);
});

it('returns parsed files when there are .cls files', () => {
  (fs.readdirSync as jest.Mock).mockReturnValue(['TestClass.cls', 'README.md']);
  (fs.readFileSync as jest.Mock).mockReturnValue('Raw class data');

  generate(['src'], false);

  expect(FileParser).toHaveBeenCalledTimes(1);
  const mockFileParserInstance = (FileParser as jest.Mock).mock.instances[0];
  const mockParseFileContents = mockFileParserInstance.parseFileContents;
  expect(mockParseFileContents).toHaveBeenCalledTimes(1);
  expect(mockParseFileContents).toHaveBeenCalledWith('Raw class data');
});
