import parse from '../markdoc-service';
import { Manifest, SourceFile } from '../types';

describe('Rendering a single source file', () => {
  it('renders the source file name', () => {
    const content = '{% name /%}';
    const source: SourceFile = {
      name: 'AccountService',
      sourceType: 'class',
      url: 'https://example.com/account-service',
      descriptionNodes: ['Service for managing accounts'],
      group: 'Core',
    };

    const result = parse(content, source);

    const expected = 'AccountService';
    expect(result).toBe(expected);
  });
});
