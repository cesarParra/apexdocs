import { ClassMirror, EnumMirror, InterfaceMirror, Type } from '@cparra/apex-reflection';
import { RenderableType, RenderableClass, RenderableEnum, RenderableInterface } from '../templating/types';
import { adaptDescribable, adaptDocumentable } from './documentables';
import { linkFromTypeNameGenerator } from './references';
import { FieldMirrorWithInheritance, PropertyMirrorWithInheritance } from '../model/inheritance';
import { adaptConstructor, adaptMethod } from './methods-and-constructors';
import { adaptFieldOrProperty } from './fields-and-properties';

function baseTypeAdapter(type: EnumMirror | InterfaceMirror | ClassMirror): RenderableType {
  function getHeading(type: Type): string {
    const suffixMap = {
      class: 'Class',
      interface: 'Interface',
      enum: 'Enum',
    };

    return `${type.name} ${suffixMap[type.type_name]}`;
  }

  return {
    headingLevel: 1,
    heading: getHeading(type),
    doc: adaptDocumentable(type),
    name: type.name,
    meta: {
      accessModifier: type.access_modifier,
    },
  };
}

export function enumTypeToEnumSource(enumType: EnumMirror): RenderableEnum {
  return {
    __type: 'enum',
    ...baseTypeAdapter(enumType),
    values: {
      headingLevel: 2,
      heading: 'Values',
      values: enumType.values.map((value) => ({
        ...adaptDescribable(value.docComment?.descriptionLines),
        value: value.name,
      })),
    },
  };
}

export function interfaceTypeToInterfaceSource(interfaceType: InterfaceMirror): RenderableInterface {
  return {
    __type: 'interface',
    ...baseTypeAdapter(interfaceType),
    extends: interfaceType.extended_interfaces.map(linkFromTypeNameGenerator),
    methods: {
      headingLevel: 2,
      heading: 'Methods',
      values: interfaceType.methods.map(adaptMethod),
    },
  };
}

export function classTypeToClassSource(classType: ClassMirror): RenderableClass {
  return {
    __type: 'class',
    ...baseTypeAdapter(classType),
    classModifier: classType.classModifier,
    sharingModifier: classType.sharingModifier,
    implements: classType.implemented_interfaces.map(linkFromTypeNameGenerator),
    extends: classType.extended_class ? linkFromTypeNameGenerator(classType.extended_class) : undefined,
    methods: {
      headingLevel: 2,
      heading: 'Methods',
      values: classType.methods.map(adaptMethod),
    },
    constructors: {
      headingLevel: 2,
      heading: 'Constructors',
      values: classType.constructors.map((constructor) => adaptConstructor(classType.name, constructor)),
    },
    fields: {
      headingLevel: 2,
      heading: 'Fields',
      values: classType.fields.map((field) => adaptFieldOrProperty(field as FieldMirrorWithInheritance)),
    },
    properties: {
      headingLevel: 2,
      heading: 'Properties',
      values: classType.properties.map((property) => adaptFieldOrProperty(property as PropertyMirrorWithInheritance)),
    },
  };
}
