import { ClassMirror, EnumMirror, InterfaceMirror, Type } from '@cparra/apex-reflection';
import { RenderableType, RenderableClass, RenderableEnum, RenderableInterface } from '../templating/types';
import { adaptDescribable, adaptDocumentable } from './documentables';
import { linkFromTypeNameGenerator } from './references';
import { FieldMirrorWithInheritance, PropertyMirrorWithInheritance } from '../model/inheritance';
import { adaptConstructor, adaptMethod } from './methods-and-constructors';
import { adaptFieldOrProperty } from './fields-and-properties';

function baseTypeAdapter(type: EnumMirror | InterfaceMirror | ClassMirror, baseHeadingLevel: number): RenderableType {
  function getHeading(type: Type): string {
    const suffixMap = {
      class: 'Class',
      interface: 'Interface',
      enum: 'Enum',
    };

    return `${type.name} ${suffixMap[type.type_name]}`;
  }

  return {
    headingLevel: baseHeadingLevel,
    heading: getHeading(type),
    doc: adaptDocumentable(type, baseHeadingLevel + 1),
    name: type.name,
    meta: {
      accessModifier: type.access_modifier,
    },
  };
}

export function enumTypeToEnumSource(enumType: EnumMirror, baseHeadingLevel: number = 1): RenderableEnum {
  return {
    __type: 'enum',
    ...baseTypeAdapter(enumType, baseHeadingLevel),
    values: {
      headingLevel: baseHeadingLevel + 1,
      heading: 'Values',
      value: enumType.values.map((value) => ({
        ...adaptDescribable(value.docComment?.descriptionLines),
        value: value.name,
      })),
    },
  };
}

export function interfaceTypeToInterfaceSource(
  interfaceType: InterfaceMirror,
  baseHeadingLevel: number = 1,
): RenderableInterface {
  return {
    __type: 'interface',
    ...baseTypeAdapter(interfaceType, baseHeadingLevel),
    extends: interfaceType.extended_interfaces.map(linkFromTypeNameGenerator),
    methods: {
      headingLevel: baseHeadingLevel + 1,
      heading: 'Methods',
      value: interfaceType.methods.map((method) => adaptMethod(method, baseHeadingLevel + 2)),
    },
  };
}

export function classTypeToClassSource(classType: ClassMirror, baseHeadingLevel: number = 1): RenderableClass {
  return {
    __type: 'class',
    ...baseTypeAdapter(classType, baseHeadingLevel),
    classModifier: classType.classModifier,
    sharingModifier: classType.sharingModifier,
    implements: classType.implemented_interfaces.map(linkFromTypeNameGenerator),
    extends: classType.extended_class ? linkFromTypeNameGenerator(classType.extended_class) : undefined,
    methods: {
      headingLevel: baseHeadingLevel + 1,
      heading: 'Methods',
      value: classType.methods.map((method) => adaptMethod(method, baseHeadingLevel + 2)),
    },
    constructors: {
      headingLevel: baseHeadingLevel + 1,
      heading: 'Constructors',
      value: classType.constructors.map((constructor) =>
        adaptConstructor(classType.name, constructor, baseHeadingLevel + 2),
      ),
    },
    fields: {
      headingLevel: baseHeadingLevel + 1,
      heading: 'Fields',
      value: classType.fields.map((field) =>
        adaptFieldOrProperty(field as FieldMirrorWithInheritance, baseHeadingLevel + 2),
      ),
    },
    properties: {
      headingLevel: baseHeadingLevel + 1,
      heading: 'Properties',
      value: classType.properties.map((property) =>
        adaptFieldOrProperty(property as PropertyMirrorWithInheritance, baseHeadingLevel + 2),
      ),
    },
    innerClasses: {
      headingLevel: baseHeadingLevel + 1,
      heading: 'Classes',
      value: classType.classes.map((innerClass) => classTypeToClassSource(innerClass, baseHeadingLevel + 2)),
    },
    innerEnums: {
      headingLevel: baseHeadingLevel + 1,
      heading: 'Enums',
      value: classType.enums.map((innerEnum) => enumTypeToEnumSource(innerEnum, baseHeadingLevel + 2)),
    },
    innerInterfaces: {
      headingLevel: baseHeadingLevel + 1,
      heading: 'Interfaces',
      value: classType.interfaces.map((innerInterface) =>
        interfaceTypeToInterfaceSource(innerInterface, baseHeadingLevel + 2),
      ),
    },
  };
}
