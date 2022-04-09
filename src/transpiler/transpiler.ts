import { Type } from '@cparra/apex-reflection';
import ProcessorTypeTranspiler from './processor-type-transpiler';
import { Settings } from '../settings';

export default class Transpiler {
  static generate(types: Type[], processor: ProcessorTypeTranspiler): void {
    const sortedTypes = types.sort((apexTypeA, apexTypeB) => {
      if (apexTypeA.name < apexTypeB.name) return -1;
      if (apexTypeA.name > apexTypeB.name) return 1;
      return 0;
    });

    processor.onBeforeProcess?.(sortedTypes);

    if (Settings.getInstance().indexOnly === true) {
      return;
    }

    sortedTypes.forEach((currentType) => {
      processor.onProcess(currentType);
    });
    processor.onAfterProcess?.(sortedTypes);
  }
}
