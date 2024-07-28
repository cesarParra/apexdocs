import ProcessorTypeTranspiler from './processor-type-transpiler';
import { GeneratorChoices } from './generator-choices';
import { OpenApiDocsProcessor } from './openapi/open-api-docs-processor';

export class TypeTranspilerFactory {
  private static typeTranspilerCache?: ProcessorTypeTranspiler;

  public static get(generator: GeneratorChoices): ProcessorTypeTranspiler {
    if (this.typeTranspilerCache) {
      return this.typeTranspilerCache;
    }

    switch (generator) {
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
