import { createManifest } from '../manifest-factory';
import { Type } from '@cparra/apex-reflection';
import { TypeParser } from '../parser';
import ApexBundle from '../../model/apex-bundle';

class TestParser implements TypeParser {
  parse(): Type[] {
    return [];
  }
}

it('creates a manifest from the result of a type parser', () => {
  const manifest = createManifest(new TestParser(), (bundle: ApexBundle) => {
    return {};
  });
  expect(manifest.types.length).toBe(0);
});
