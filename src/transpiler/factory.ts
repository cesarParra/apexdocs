import ProcessorTypeTranspiler from './processor-type-transpiler';
import { GeneratorChoices } from './generator-choices';
import { JekyllDocsProcessor } from './markdown/jekyll/jekyll-docsProcessor';
import DocsifyDocsProcessor from './markdown/docsify/docsify-docs-processor';
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
      case 'openapi':
        this.typeTranspilerCache = new OpenApiDocsProcessor();
        return this.typeTranspilerCache;
      case 'plain-markdown':
        throw Error('Plain Markdown processor is not supported through this factory anymore.');
      default:
        throw Error('Invalid target generator');
    }
  }
}
