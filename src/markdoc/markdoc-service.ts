import Markdoc, { Config, RenderableTreeNodes, Tag } from '@cparra/markdoc';
import tableOfContents from './table-of-contents';
import { Manifest, SourceFile } from './types';

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
      attributes: {
        'default-group-name': {
          type: String,
          default: 'Miscellaneous',
          required: false,
        },
        'disable-grouping': {
          type: Boolean,
          default: false,
          required: false,
        },
      },
    },

    // Tags related to a single source file
    name: {
      render: 'Name',
    },
  },
};

/**
 * Takes a markdown string and returns a parsed and rendered markdown back.
 * @param markdown
 * @param source
 */
export default function parse(markdown: string, source?: Manifest | SourceFile): string {
  const ast = Markdoc.parse(markdown);
  const tree = Markdoc.transform(ast, config);
  return removeTrailingNewline(render(tree, source));
}

function removeTrailingNewline(str: string): string {
  return str.replace(/\n$/, '');
}

function render(node: RenderableTreeNodes, source?: Manifest | SourceFile): string {
  if (typeof node === 'string' || typeof node === 'number') {
    if (node === ' ') {
      return '';
    }
    return String(node) + '\n';
  }

  if (Array.isArray(node)) {
    return node.map((current) => render(current, source)).join('');
  }

  if (node === null || typeof node !== 'object' || !Tag.isTag(node)) {
    return '';
  }

  const { name, attributes, children } = node;

  switch (name) {
    case 'article': {
      return render(children, source);
    }
    case 'Heading': {
      return Array.from({ length: attributes.level }, () => '#').join('') + ' ' + render(children, source);
    }
    case 'Paragraph': {
      return render(children, source);
    }
    case 'hr': {
      return '---';
    }
    case 'blockquote': {
      return render(children, source)
        .split('\n')
        .map((line) => (line === '' ? '' : '> ' + line))
        .join('\n');
    }
    case 'Fence': {
      return '```' + attributes.language + '\n' + attributes.content + '```';
    }
    case 'unordered-list': {
      return children.map((child) => `- ${render(child, source)}`).join('\n');
    }
    case 'ordered-list': {
      return children.map((child, index) => `${index + 1}. ${render(child, source)}`).join('\n');
    }
    case 'li': {
      return render(children, source).trim();
    }
    case 'TableOfContents': {
      if (!source || !isManifest(source)) {
        throw new Error('Source is required for table-of-contents tag');
      }
      return tableOfContents(source, attributes['default-group-name'], attributes['disable-grouping']);
    }
    case 'Name': {
      if (!source || !isSourceFile(source)) {
        throw new Error('Source is required for name tag');
      }
      return source.name;
    }
    default: {
      throw new Error(`Unknown tag: ${name}`);
    }
  }
}

function isManifest(source: Manifest | SourceFile): source is Manifest {
  return (source as Manifest).files !== undefined;
}

function isSourceFile(source: Manifest | SourceFile): source is SourceFile {
  return (source as SourceFile).name !== undefined;
}
