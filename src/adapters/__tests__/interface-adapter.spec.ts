import { InterfaceMirrorBuilder } from '../../test-helpers/InterfaceMirrorBuilder';
import { AnnotationBuilder } from '../../test-helpers/AnnotationBuilder';
import { MethodMirrorBuilder, ParameterBuilder } from '../../test-helpers/MethodMirrorBuilder';
import { interfaceTypeToInterfaceSource } from '../adapters';

describe('Conversion from InterfaceMirror to InterfaceSource understandable by the templating engine', () => {
  it('converts the name', () => {
    const interfaceMirror = new InterfaceMirrorBuilder().withName('SampleInterface').build();
    const interfaceSource = interfaceTypeToInterfaceSource(interfaceMirror);

    expect(interfaceSource.name).toBe('SampleInterface');
  });

  it('converts the access modifier', () => {
    const interfaceMirror = new InterfaceMirrorBuilder().build();
    const interfaceSource = interfaceTypeToInterfaceSource(interfaceMirror);

    expect(interfaceSource.accessModifier).toBe('public');
  });

  it('converts annotations', () => {
    const interfaceMirror = new InterfaceMirrorBuilder()
      .addAnnotation(new AnnotationBuilder().withName('MyAnnotation').build())
      .build();
    const interfaceSource = interfaceTypeToInterfaceSource(interfaceMirror);

    expect(interfaceSource.annotations).toEqual(['MYANNOTATION']);
  });

  it('converts method declarations. Method with no parameters', () => {
    const interfaceMirror = new InterfaceMirrorBuilder()
      .addMethod(
        new MethodMirrorBuilder()
          .withName('sampleMethod')
          .withTypeReference({
            type: 'String',
            rawDeclaration: 'String',
          })
          .build(),
      )
      .build();

    const interfaceSource = interfaceTypeToInterfaceSource(interfaceMirror);

    expect(interfaceSource.methods).toHaveLength(1);
    expect(interfaceSource.methods![0].signature).toBe('public String sampleMethod()');
  });

  it('converts method declarations. Method with parameters', () => {
    const interfaceMirror = new InterfaceMirrorBuilder()
      .addMethod(
        new MethodMirrorBuilder()
          .withName('sampleMethod')
          .withTypeReference({
            type: 'String',
            rawDeclaration: 'String',
          })
          .addParameter(
            new ParameterBuilder()
              .withName('param1')
              .withTypeReference({
                type: 'String',
                rawDeclaration: 'String',
              })
              .build(),
          )
          .build(),
      )
      .build();

    const interfaceSource = interfaceTypeToInterfaceSource(interfaceMirror);

    expect(interfaceSource.methods).toHaveLength(1);
    expect(interfaceSource.methods![0].signature).toBe('public String sampleMethod(String param1)');
  });
});
