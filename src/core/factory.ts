import ProcessorTypeTranspiler from './processor-type-transpiler';
import { OpenApiDocsProcessor } from './openapi/open-api-docs-processor';
import { Generator } from './shared/types';

export class TypeTranspilerFactory {
  private static typeTranspilerCache?: ProcessorTypeTranspiler;

  public static get(generator: Generator): ProcessorTypeTranspiler {
    if (this.typeTranspilerCache) {
      return this.typeTranspilerCache;
    }

    // TODO: Now that Open Api is the only one using this, we don't need an abstraction anymore.
    // Let's refactor so that it is just the implementation.
    switch (generator) {
      case 'openapi':
        this.typeTranspilerCache = new OpenApiDocsProcessor();
        return this.typeTranspilerCache;
      case 'markdown':
        throw Error('Plain Markdown processor is not supported through this factory anymore.');
      default:
        throw Error('Invalid target generator');
    }
  }
}
