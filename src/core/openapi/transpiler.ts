import { Type } from '@cparra/apex-reflection';
import { OpenApiDocsProcessor } from './open-api-docs-processor';

export default class Transpiler {
  static generate(types: Type[], processor: OpenApiDocsProcessor): void {
    const sortedTypes = types.sort((apexTypeA, apexTypeB) => {
      if (apexTypeA.name < apexTypeB.name) return -1;
      if (apexTypeA.name > apexTypeB.name) return 1;
      return 0;
    });

    sortedTypes.forEach((currentType) => {
      processor.onProcess(currentType);
    });
    processor.onAfterProcess?.(sortedTypes);
  }
}
