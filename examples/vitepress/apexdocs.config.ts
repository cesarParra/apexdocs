import { defineMarkdownConfig, DocPageData, DocPageReference } from '../../src';
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

function writeFileAsync(filePath: string, data: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export default defineMarkdownConfig({
  sourceDir: 'force-app',
  scope: ['global', 'public', 'protected', 'private', 'namespaceaccessible'],
  namespace: 'apexdocs',
  transformReference: (reference: DocPageReference) => {
    return {
      ...reference,
      pathFromRoot: `${reference.source.name}/page.md`,
    };
  },
  transformReferenceGuide: async (referenceGuide) => {
    const frontMatter = await loadFileAsync('./docs/index-frontmatter.md');
    return {
      ...referenceGuide,
      frontmatter: frontMatter,
    };
  },
  transformDocs: async (docs) => {
    // Update sidebar
    const sidebar = [
      {
        text: 'API Reference',
        items: [
          {
            text: 'Grouped By Type',
            items: [
              {
                text: 'Classes',
                items: docs.filter((doc) => doc.source.type === 'class').map(toSidebarLink),
              },
              {
                text: 'Interfaces',
                items: docs.filter((doc) => doc.source.type === 'interface').map(toSidebarLink),
              },
              {
                text: 'Enums',
                items: docs.filter((doc) => doc.source.type === 'enum').map(toSidebarLink),
              },
            ],
          },
          {
            text: 'Grouped by Group',
            items: Array.from(extractGroups(docs)).map(([groupName, groupDocs]) => ({
              text: groupName,
              items: groupDocs.map(toSidebarLink),
            })),
          },
        ],
      },
    ];
    await writeFileAsync('./docs/.vitepress/sidebar.json', JSON.stringify(sidebar, null, 2));

    return docs;
  },
  transformDocPage: async (docPage) => {
    return {
      ...docPage,
      frontmatter: {
        title: docPage.source.name,
      },
    };
  },
});

function toSidebarLink(doc: DocPageData) {
  return {
    text: doc.source.name,
    link: doc.filePath,
  };
}

function extractGroups(docs: DocPageData[]) {
  const groups = new Map<string, DocPageData[]>();
  for (const doc of docs) {
    if (!doc.group) {
      continue;
    }

    const groupDocs = groups.get(doc.group) ?? [];
    groupDocs.push(doc);
    groups.set(doc.group, groupDocs);
  }

  return groups;
}
