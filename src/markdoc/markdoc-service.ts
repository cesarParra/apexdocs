import Markdoc, { Config, RenderableTreeNodes, Tag } from '@cparra/markdoc';

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
  },
};

export default function parse(markdown: string) {
  const ast = Markdoc.parse(markdown);
  const tree = Markdoc.transform(ast, config);
  return removeTrailingNewline(render(tree));
}

function removeTrailingNewline(str: string): string {
  return str.replace(/\n$/, '');
}

function render(node: RenderableTreeNodes): string {
  if (typeof node === 'string' || typeof node === 'number') {
    if (node === ' ') {
      return '';
    }
    return String(node) + '\n';
  }

  if (Array.isArray(node)) {
    return node.map(render).join('');
  }

  if (node === null || typeof node !== 'object' || !Tag.isTag(node)) {
    return '';
  }

  const { name, attributes, children } = node;

  switch (name) {
    case 'article': {
      return render(children);
    }
    case 'Heading': {
      return Array.from({ length: attributes.level }, () => '#').join('') + ' ' + render(children);
    }
    case 'Paragraph': {
      return render(children);
    }
    case 'hr': {
      return '---';
    }
    case 'blockquote': {
      return render(children)
        .split('\n')
        .map((line) => (line === '' ? '' : '> ' + line))
        .join('\n');
    }
    default: {
      throw new Error(`Unknown tag: ${name}`);
    }
  }
}
