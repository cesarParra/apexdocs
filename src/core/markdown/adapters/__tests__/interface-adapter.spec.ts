import { typeToRenderable } from '../apex-types';
import { InterfaceMirrorBuilder } from '../../../../test-helpers/InterfaceMirrorBuilder';
import { AnnotationBuilder } from '../../../../test-helpers/AnnotationBuilder';
import { MethodMirrorBuilder, ParameterBuilder } from '../../../../test-helpers/MethodMirrorBuilder';

function linkGenerator(type: string): string {
  return type;
}

describe('Conversion from InterfaceMirror to InterfaceSource understandable by the templating engine', () => {
  it('converts the name', () => {
    const interfaceMirror = new InterfaceMirrorBuilder().withName('SampleInterface').build();
    const interfaceSource = typeToRenderable({ filePath: '', type: interfaceMirror }, linkGenerator);

    expect(interfaceSource.name).toBe('SampleInterface');
  });

  it('converts the access modifier', () => {
    const interfaceMirror = new InterfaceMirrorBuilder().build();
    const interfaceSource = typeToRenderable({ filePath: '', type: interfaceMirror }, linkGenerator);

    expect(interfaceSource.meta.accessModifier).toBe('public');
  });

  it('converts annotations', () => {
    const interfaceMirror = new InterfaceMirrorBuilder()
      .addAnnotation(new AnnotationBuilder().withName('MyAnnotation').build())
      .build();
    const interfaceSource = typeToRenderable({ filePath: '', type: interfaceMirror }, linkGenerator);

    expect(interfaceSource.doc.annotations).toEqual(['MYANNOTATION']);
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

    const interfaceSource = typeToRenderable({ filePath: '', type: interfaceMirror }, linkGenerator);

    expect(interfaceSource.methods.value).toHaveLength(1);
    expect(interfaceSource.methods.value[0].signature.value.content[0]).toBe('public String sampleMethod()');
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

    const interfaceSource = typeToRenderable({ filePath: '', type: interfaceMirror }, linkGenerator);

    expect(interfaceSource.methods.value).toHaveLength(1);
    expect(interfaceSource.methods.value[0].signature.value.content[0]).toBe(
      'public String sampleMethod(String param1)',
    );
  });
});
