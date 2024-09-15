import { createManifest } from '../manifest-factory';
import { Type } from '@cparra/apex-reflection';
import { TypeParser } from '../parser';

class TestParser implements TypeParser {
  parse(): Type[] {
    return [];
  }
}

it('creates a manifest from the result of a type parser', () => {
  const manifest = createManifest(new TestParser(), () => {
    return {};
  });
  expect(manifest.types.length).toBe(0);
});
