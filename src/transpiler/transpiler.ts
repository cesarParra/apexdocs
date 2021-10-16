import { Type } from '@cparra/apex-reflection';
import ProcessorTypeTranspiler from './processor-type-transpiler';

export default class Transpiler {
  static generate(types: Type[], processor: ProcessorTypeTranspiler): void {
    const sortedTypes = types.sort((apexTypeA, apexTypeB) => {
      if (apexTypeA.name < apexTypeB.name) return -1;
      if (apexTypeA.name > apexTypeB.name) return 1;
      return 0;
    });

    processor.onBeforeProcess?.(sortedTypes);
    sortedTypes.forEach(currentType => {
      processor.onProcess(currentType);
    });
    processor.onAfterProcess?.(sortedTypes);
  }
}
