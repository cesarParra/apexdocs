import { defineMarkdownConfig } from '../../src';
import * as fs from 'node:fs';

function loadFileAsync(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

export default defineMarkdownConfig({
  sourceDir: 'force-app',
  scope: ['global', 'public', 'protected', 'private', 'namespaceaccessible'],
  transformReferenceGuide: async (referenceGuide) => {
    const frontMatter = await loadFileAsync('./docs/index-frontmatter.md');
    return {
      ...referenceGuide,
      frontmatter: frontMatter,
    };
  },
  transformDocPage: async (docPage) => {
    const frontMatter = 'masaca';
    return {
      ...docPage,
      frontmatter: frontMatter,
    };
  },
});
