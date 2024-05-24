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
  return render(tree);
}

function render(node: RenderableTreeNodes): string {
  if (typeof node === 'string' || typeof node === 'number') {
    // Empy strings should be represented as blank lines (\n)
    if (node === ' ') {
      return '\n';
    }
    return String(node);
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
      return '> ' + render(children);
    }
    default: {
      throw new Error(`Unknown tag: ${name}`);
    }
  }
}
