import Manifest from '../manifest';
import { EnumMirror } from '@cparra/apex-reflection';

const sampleEnum: EnumMirror = {
  annotations: [],
  name: 'SampleEnum',
  type_name: 'enum',
  access_modifier: 'public',
};

it('holds a list of types', () => {
  const types = [sampleEnum];
  const manifest = new Manifest(types);
  expect(manifest.types).toBe(types);
});
