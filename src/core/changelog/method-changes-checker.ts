import { MethodMirror } from '@cparra/apex-reflection';

export function areMethodsEqual(method1: MethodMirror, method2: MethodMirror): boolean {
  if (method1.name !== method2.name) {
    return false;
  }

  if (method1.typeReference.rawDeclaration.toLowerCase() !== method2.typeReference.rawDeclaration.toLowerCase()) {
    return false;
  }

  if (method1.parameters.length !== method2.parameters.length) {
    return false;
  }

  for (let i = 0; i < method1.parameters.length; i++) {
    if (
      method1.parameters[i].typeReference.rawDeclaration.toLowerCase() !==
      method2.parameters[i].typeReference.rawDeclaration.toLowerCase()
    ) {
      return false;
    }
  }

  return true;
}
