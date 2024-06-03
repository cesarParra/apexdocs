import Markdoc, { Config, RenderableTreeNodes, Tag } from '@cparra/markdoc';
import tableOfContents from './table-of-contents';
import { Manifest } from './types';

const config: Config = {
  nodes: {
    heading: {
      render: 'Heading',
      attributes: {
        id: { type: String },
        level: { type: Number },
      },
    },
    paragraph: {
      render: 'Paragraph',
    },
    fence: {
      render: 'Fence',
      attributes: {
        language: { type: String },
        content: { type: String },
      },
    },
    list: {
      render: 'List',
      attributes: {
        ordered: { type: Boolean },
      },
      transform(node, config) {
        return new Tag(
          node.attributes.ordered ? 'ordered-list' : 'unordered-list',
          node.transformAttributes(config),
          node.transformChildren(config),
        );
      },
    },
  },
  tags: {
    'table-of-contents': {
      render: 'TableOfContents',
    },
  },
};

/**
 * Takes a markdown string and returns a parsed and rendered markdown back.
 * @param markdown
 * @param sourceManifest
 */
export default function parse(markdown: string, sourceManifest: Manifest = { files: [] }): string {
  const ast = Markdoc.parse(markdown);
  const tree = Markdoc.transform(ast, config);
  return removeTrailingNewline(render(tree, sourceManifest));
}

function removeTrailingNewline(str: string): string {
  return str.replace(/\n$/, '');
}

function render(node: RenderableTreeNodes, sourceManifest: Manifest): string {
  if (typeof node === 'string' || typeof node === 'number') {
    if (node === ' ') {
      return '';
    }
    return String(node) + '\n';
  }

  if (Array.isArray(node)) {
    return node.map((current) => render(current, sourceManifest)).join('');
  }

  if (node === null || typeof node !== 'object' || !Tag.isTag(node)) {
    return '';
  }

  const { name, attributes, children } = node;

  switch (name) {
    case 'article': {
      return render(children, sourceManifest);
    }
    case 'Heading': {
      return Array.from({ length: attributes.level }, () => '#').join('') + ' ' + render(children, sourceManifest);
    }
    case 'Paragraph': {
      return render(children, sourceManifest);
    }
    case 'hr': {
      return '---';
    }
    case 'blockquote': {
      return render(children, sourceManifest)
        .split('\n')
        .map((line) => (line === '' ? '' : '> ' + line))
        .join('\n');
    }
    case 'Fence': {
      return '```' + attributes.language + '\n' + attributes.content + '```';
    }
    case 'unordered-list': {
      return children.map((child) => `- ${render(child, sourceManifest)}`).join('\n');
    }
    case 'ordered-list': {
      return children.map((child, index) => `${index + 1}. ${render(child, sourceManifest)}`).join('\n');
    }
    case 'li': {
      return render(children, sourceManifest).trim();
    }
    case 'TableOfContents': {
      return tableOfContents(sourceManifest);
    }
    default: {
      throw new Error(`Unknown tag: ${name}`);
    }
  }
}
