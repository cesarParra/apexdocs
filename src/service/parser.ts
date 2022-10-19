import { Type, ReflectionResult, ClassMirror } from '@cparra/apex-reflection';
import ApexBundle from '../model/apex-bundle';
import MetadataProcessor from './metadata-processor';
import { Logger } from '../util/logger';

export interface TypeParser {
  parse(reflect: (apexBundle: ApexBundle) => ReflectionResult): Type[];
}

export class RawBodyParser implements TypeParser {
  constructor(public typeBundles: ApexBundle[]) {}

  parse(reflect: (apexBundle: ApexBundle) => ReflectionResult): Type[] {
    const types = this.typeBundles
      .map((currentBundle) => {
        Logger.log(`Parsing file: ${currentBundle.filePath}`);
        const result = reflect(currentBundle);
        if (!!result.typeMirror && !!currentBundle.rawMetadataContent) {
          // If successful and there is a metadata file
          const metadataParams = MetadataProcessor.process(currentBundle.rawMetadataContent);
          metadataParams.forEach((value, key) => {
            const declaration = `${key}: ${value}`;
            result.typeMirror!.annotations.push({
              rawDeclaration: declaration,
              name: declaration,
              type: declaration,
            });
          });
        }
        return result;
      })
      .filter((reflectionResult) => {
        return reflectionResult.typeMirror;
      })
      .map((reflectionResult) => reflectionResult.typeMirror!);

    return this.addFieldsFromParent(types);
  }

  addFieldsFromParent(types: Type[]): Type[] {
    const typesWithFields: Type[] = [];
    for (const currentType of types) {
      if (currentType.type_name !== 'class') {
        typesWithFields.push(currentType);
        continue;
      }

      let typeAsClass = currentType as ClassMirror;
      if (!typeAsClass.extended_class) {
        typesWithFields.push(currentType);
        continue;
      }

      typeAsClass = this.addFieldsToClass(typeAsClass, types);
      typesWithFields.push(typeAsClass);
    }

    return typesWithFields;
  }

  addFieldsToClass(currentClass: ClassMirror, allTypes: Type[]): ClassMirror {
    if (!currentClass.extended_class) {
      return currentClass;
    }
    const parent = allTypes.find((currentType: Type) => currentType.name === currentClass.extended_class);
    if (!parent || parent.type_name !== 'class') {
      return currentClass;
    }

    let parentAsClass = parent as ClassMirror;
    if (parentAsClass.extended_class) {
      parentAsClass = this.addFieldsToClass(parentAsClass, allTypes);
    }

    const parentFields = parentAsClass.fields
      // Filter out private fields
      .filter((currentField) => currentField.access_modifier.toLowerCase() !== 'private')
      // Filter out fields that also exist on the child
      .filter((currentField) => !this.fieldExists(currentClass, currentField.name))
      .map((currentField) => ({
        ...currentField,
        inherited: true,
      }));

    currentClass.fields = [...currentClass.fields, ...parentFields];
    return currentClass;
  }

  fieldExists(original: ClassMirror, fieldName: string): boolean {
    const fieldNames = original.fields.map((currentField) => currentField.name);
    return fieldNames.includes(fieldName);
  }
}
