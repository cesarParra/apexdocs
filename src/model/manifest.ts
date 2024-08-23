import {
  ClassMirror,
  EnumMirror,
  InterfaceMirror,
  Type,
  Annotation,
  DocComment,
  DocCommentAnnotation,
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
  constructor(public types: Type[], public isForInnerTypes: boolean = false) {}

  filteredByAccessModifierAndAnnotations(modifiers: string[]): Type[] {
    const filteredTypes = this.filterAccessibleModifier(this.types, modifiers);
    const typesToReturn: Type[] = [];
    for (const filteredType of filteredTypes) {
      const currentType = filteredType as Type;
      if (currentType.type_name !== 'class') {
        typesToReturn.push(currentType);
        continue;
      }

      const currentClass = currentType as ClassMirror;
      let filteredClass = {
        ...currentType,
        methods: this.filterAccessibleModifier(currentClass.methods, modifiers),
        properties: this.filterAccessibleModifier(currentClass.properties, modifiers),
        fields: this.filterAccessibleModifier(currentClass.fields, modifiers),
        constructors: this.filterAccessibleModifier(currentClass.constructors, modifiers),
      };

      if (!this.isForInnerTypes) {
        filteredClass = {
          ...filteredClass,
          enums: this.filterAccessibleModifier(currentClass.enums, modifiers) as EnumMirror[],
          interfaces: this.filterAccessibleModifier(currentClass.interfaces, modifiers) as InterfaceMirror[],
          classes: new Manifest(currentClass.classes, true).filteredByAccessModifierAndAnnotations(
            modifiers,
          ) as ClassMirror[],
        };
      }

      typesToReturn.push(filteredClass as ClassMirror);
    }

    return typesToReturn;
  }

  filterAccessibleModifier(accessAndDocAwares: AccessAndDocAware[], modifiers: string[]) {
    return accessAndDocAwares.filter((currentType) => {
      const hasIgnoreDocAnnotation = currentType.docComment?.annotations.some(
        (annotation: DocCommentAnnotation) => annotation.name === 'ignore',
      );
      if (hasIgnoreDocAnnotation) {
        return false;
      }
      return (
        modifiers.includes(currentType.access_modifier) ||
        currentType.annotations.some((annotation: Annotation) => modifiers.includes(annotation.type.toLowerCase()))
      );
    });
  }
}
