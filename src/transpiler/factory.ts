import ProcessorTypeTranspiler from './processor-type-transpiler';
import { GeneratorChoices } from './generator-choices';
import { JekyllDocsProcessor } from './markdown/jekyll/jekyll-docsProcessor';
import DocsifyDocsProcessor from './markdown/docsify/docsify-docs-processor';
import { PlainMarkdownDocsProcessor } from './markdown/plain-markdown/plain-docsProcessor';
import { OpenApiDocsProcessor } from './openapi/open-api-docs-processor';

export class TypeTranspilerFactory {
  private static typeTranspilerCache?: ProcessorTypeTranspiler;

  public static get(generator: GeneratorChoices): ProcessorTypeTranspiler {
    if (this.typeTranspilerCache) {
      return this.typeTranspilerCache;
    }

    switch (generator) {
      case 'jekyll':
        this.typeTranspilerCache = new JekyllDocsProcessor();
        return this.typeTranspilerCache;
      case 'docsify':
        this.typeTranspilerCache = new DocsifyDocsProcessor();
        return this.typeTranspilerCache;
      case 'plain-markdown':
        this.typeTranspilerCache = new PlainMarkdownDocsProcessor();
        return this.typeTranspilerCache;
      case 'openapi':
        this.typeTranspilerCache = new OpenApiDocsProcessor();
        return this.typeTranspilerCache;
      default:
        throw Error('Invalid target generator');
    }
  }
}
