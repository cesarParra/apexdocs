import { InterfaceMirrorBuilder } from '../../test-helpers/InterfaceMirrorBuilder';
import { interfaceTypeToInterfaceSource } from '../interface-adapter';
import { AnnotationBuilder } from '../../test-helpers/AnnotationBuilder';

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
});
