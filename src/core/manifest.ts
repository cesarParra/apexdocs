import {
  Annotation,
  ClassMirror,
  DocComment,
  DocCommentAnnotation,
  EnumMirror,
  InterfaceMirror,
  Type,
} from '@cparra/apex-reflection';

type AccessAndDocAware = { access_modifier: string; annotations: Annotation[]; docComment?: DocComment };

/**
 * Represents the full library of Apex top-level types (classes, enums, and interface) for a Salesforce project.
 */
export default class Manifest {
  /**
   * Constructs a new Manifest object.
   * @param types List of types to be wrapped by this object.
   * @param isForInnerTypes Whether this manifest represent an inner type or not.
   */
  constructor(
    public types: Type[],
    public isForInnerTypes: boolean = false,
  ) {}

  filteredByAccessModifierAndAnnotations(modifiers: string[]): Type[] {
    const filteredTypes = Manifest.filterAccessibleModifier(this.types, modifiers);
    const typesToReturn: Type[] = [];
    for (const filteredType of filteredTypes) {
      typesToReturn.push(Manifest.filterSingleType(filteredType, modifiers, this.isForInnerTypes));
    }

    return typesToReturn;
  }

  static filterSingleType(currentType: Type, modifiers: string[], isForInnerTypes: boolean): Type {
    if (currentType.type_name === 'enum') {
      // Ignoring enum values is not supported.
      return currentType;
    }

    if (currentType.type_name === 'interface') {
      const currentInterface = currentType as InterfaceMirror;
      return {
        ...currentType,
        methods: this.filterAccessibleModifier(currentInterface.methods, modifiers),
      } as InterfaceMirror;
    }

    const currentClass = currentType as ClassMirror;
    const filteredClass = {
      ...currentType,
      methods: this.filterAccessibleModifier(currentClass.methods, modifiers),
      properties: this.filterAccessibleModifier(currentClass.properties, modifiers),
      fields: this.filterAccessibleModifier(currentClass.fields, modifiers),
      constructors: this.filterAccessibleModifier(currentClass.constructors, modifiers),
    } as ClassMirror;

    if (!isForInnerTypes) {
      return {
        ...filteredClass,
        enums: this.filterAccessibleModifier(currentClass.enums, modifiers) as EnumMirror[],
        interfaces: this.filterAccessibleModifier(currentClass.interfaces, modifiers) as InterfaceMirror[],
        classes: new Manifest(currentClass.classes, true).filteredByAccessModifierAndAnnotations(
          modifiers,
        ) as ClassMirror[],
      };
    }

    return filteredClass;
  }

  static filterAccessibleModifier<T extends AccessAndDocAware>(accessAndDocAware: T[], modifiers: string[]): T[] {
    return accessAndDocAware.filter((type) => this.shouldFilterType(type, modifiers));
  }

  static shouldFilterType(accessAndDocAware: AccessAndDocAware, modifiers: string[]) {
    const hasIgnoreDocAnnotation = accessAndDocAware.docComment?.annotations.some(
      (annotation: DocCommentAnnotation) => annotation.name.toLowerCase() === 'ignore',
    );
    if (hasIgnoreDocAnnotation) {
      return false;
    }
    return (
      modifiers.includes(accessAndDocAware.access_modifier) ||
      accessAndDocAware.annotations.some((annotation: Annotation) => modifiers.includes(annotation.type.toLowerCase()))
    );
  }
}
