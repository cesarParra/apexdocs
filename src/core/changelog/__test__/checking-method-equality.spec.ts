import { MethodMirrorBuilder, ParameterBuilder } from '../../../test-helpers/MethodMirrorBuilder';
import { areMethodsEqual } from '../method-changes-checker';

describe('when checking if 2 methods are equal', () => {
  it('returns false when the methods do not have the same name', () => {
    const method1 = new MethodMirrorBuilder().withName('method1').build();
    const method2 = new MethodMirrorBuilder().withName('method2').build();

    const result = areMethodsEqual(method1, method2);

    expect(result).toBe(false);
  });

  it('returns false when the methods do not have the same return type', () => {
    const method1 = new MethodMirrorBuilder().withTypeReference({ type: 'String', rawDeclaration: 'String' }).build();
    const method2 = new MethodMirrorBuilder().withTypeReference({ type: 'Integer', rawDeclaration: 'Integer' }).build();

    const result = areMethodsEqual(method1, method2);

    expect(result).toBe(false);
  });

  it('returns false when the methods do not have the same amount of parameters', () => {
    const method1 = new MethodMirrorBuilder().addParameter(new ParameterBuilder().build()).build();
    const method2 = new MethodMirrorBuilder().build();

    const result = areMethodsEqual(method1, method2);

    expect(result).toBe(false);
  });

  it('returns false when the types of the parameters are different', () => {
    const method1 = new MethodMirrorBuilder()
      .addParameter(new ParameterBuilder().withTypeReference({ type: 'String', rawDeclaration: 'String' }).build())
      .build();
    const method2 = new MethodMirrorBuilder()
      .addParameter(new ParameterBuilder().withTypeReference({ type: 'Integer', rawDeclaration: 'Integer' }).build())
      .build();

    const result = areMethodsEqual(method1, method2);

    expect(result).toBe(false);
  });

  it('returns true when the methods are equal', () => {
    const method1 = new MethodMirrorBuilder()
      .withName('method1')
      .withTypeReference({ type: 'String', rawDeclaration: 'String' })
      .addParameter(new ParameterBuilder().withTypeReference({ type: 'String', rawDeclaration: 'String' }).build())
      .build();
    const method2 = new MethodMirrorBuilder()
      .withName('method1')
      .withTypeReference({ type: 'String', rawDeclaration: 'String' })
      .addParameter(new ParameterBuilder().withTypeReference({ type: 'String', rawDeclaration: 'String' }).build())
      .build();

    const result = areMethodsEqual(method1, method2);

    expect(result).toBe(true);
  });
});
