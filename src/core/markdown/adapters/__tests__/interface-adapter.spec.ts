import { typeToRenderable } from '../type-to-renderable';
import { InterfaceMirrorBuilder } from '../../../../test-helpers/InterfaceMirrorBuilder';
import { AnnotationBuilder } from '../../../../test-helpers/AnnotationBuilder';
import { MethodMirrorBuilder, ParameterBuilder } from '../../../../test-helpers/MethodMirrorBuilder';
import { MarkdownGeneratorConfig } from '../../generate-docs';
import { defaultTranslations } from '../../../translations';

function linkGenerator(type: string): string {
  return type;
}

const defaultMarkdownGeneratorConfig: MarkdownGeneratorConfig = {
  targetDir: '',
  scope: ['global', 'public'],
  customObjectVisibility: ['public'],
  namespace: '',
  defaultGroupName: 'Miscellaneous',
  customObjectsGroupName: 'Custom Objects',
  triggersGroupName: 'Triggers',
  referenceGuideTemplate: '',
  sortAlphabetically: false,
  linkingStrategy: 'relative',
  referenceGuideTitle: 'Apex Reference Guide',
  includeFieldSecurityMetadata: true,
  includeInlineHelpTextMetadata: true,
  exclude: [],
  excludeTags: [],
};

describe('Conversion from InterfaceMirror to InterfaceSource understandable by the templating engine', () => {
  it('converts the name', () => {
    const interfaceMirror = new InterfaceMirrorBuilder().withName('SampleInterface').build();
    const interfaceSource = typeToRenderable(
      {
        source: {
          filePath: '',
          type: 'interface',
          name: 'SampleInterface',
        },
        type: interfaceMirror,
      },
      linkGenerator,
      defaultMarkdownGeneratorConfig,
      defaultTranslations,
    );

    expect(interfaceSource.name).toBe('SampleInterface');
  });

  it('converts the access modifier', () => {
    const interfaceMirror = new InterfaceMirrorBuilder().build();
    const interfaceSource = typeToRenderable(
      {
        source: {
          filePath: '',
          type: 'interface',
          name: 'SampleInterface',
        },
        type: interfaceMirror,
      },
      linkGenerator,
      defaultMarkdownGeneratorConfig,
      defaultTranslations,
    );

    expect(interfaceSource.meta.accessModifier).toBe('public');
  });

  it('converts annotations', () => {
    const interfaceMirror = new InterfaceMirrorBuilder()
      .addAnnotation(new AnnotationBuilder().withName('MyAnnotation').build())
      .build();
    const interfaceSource = typeToRenderable(
      {
        source: {
          filePath: '',
          type: 'interface',
          name: 'SampleInterface',
        },
        type: interfaceMirror,
      },
      linkGenerator,
      defaultMarkdownGeneratorConfig,
      defaultTranslations,
    );

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

    const interfaceSource = typeToRenderable(
      {
        source: {
          filePath: '',
          type: 'interface',
          name: 'SampleInterface',
        },
        type: interfaceMirror,
      },
      linkGenerator,
      defaultMarkdownGeneratorConfig,
      defaultTranslations,
    );

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

    const interfaceSource = typeToRenderable(
      {
        source: {
          filePath: '',
          type: 'interface',
          name: 'SampleInterface',
        },
        type: interfaceMirror,
      },
      linkGenerator,
      defaultMarkdownGeneratorConfig,
      defaultTranslations,
    );

    expect(interfaceSource.methods.value).toHaveLength(1);
    expect(interfaceSource.methods.value[0].signature.value.content[0]).toBe(
      'public String sampleMethod(String param1)',
    );
  });
});
