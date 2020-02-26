import MethoModel from '../model/PropertyModel';
import PropertyParser from './PropertyParser';

const nameLine = 'public String TestPropery { get; set; }';
const commentLines = [
  '/**',
  ' * @description This is the property description.',
  ' * The description continues on this next line.',
  ' */',
];

test('that the description is correctly set', () => {
  const builtPropertyModes = new PropertyParser().getProperty(nameLine, commentLines, 1);

  expect(builtPropertyModes.getDescription()).toBe(
    'This is the property description. The description continues on this next line. /',
  );
});
