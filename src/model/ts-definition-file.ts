import { File } from './file';
import { WalkerListener } from '../service/walkers/walker';
import {
  ClassMirror,
  ConstructorMirror,
  EnumMirror,
  FieldMirror,
  InterfaceMirror,
  MethodMirror,
  PropertyMirror,
  Type,
} from '@cparra/apex-reflection';
import { WalkerFactory } from '../service/walkers/walker-factory';

export default class TsDefinitionFile extends File implements WalkerListener {
  fileExtension(): string {
    return '.d.ts';
  }

  constructor(typeMirror: Type) {
    super(typeMirror.name, '');
    const walker = WalkerFactory.get(typeMirror);
    walker.walk(this);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onConstructorDeclaration(className: string, constructors: ConstructorMirror[]): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onFieldsDeclaration(fields: FieldMirror[]): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onInnerClassesDeclaration(classes: ClassMirror[]): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onInnerEnumsDeclaration(enums: EnumMirror[]): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onInnerInterfacesDeclaration(interfaces: InterfaceMirror[]): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onMethodsDeclaration(methods: MethodMirror[]): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onPropertiesDeclaration(properties: PropertyMirror[]): void {}

  onTypeDeclaration(typeMirror: Type, isInner = false): void {
    this.initializeTypeNamespace(typeMirror, isInner);
    this.addPropertiesAndFields(typeMirror);
    // TODO: Auraenabled method support
    // TODO: Remember that methods with getX and setX lose the get and set
    // TODO: Classes that dont have any auraenabled things should be skipped
    // TODO: How to handle references to inner classes in other files?
    this.addInnerClasses(typeMirror);
    this.finalizeBlock();
  }

  private addPropertiesAndFields(typeMirror: Type) {
    const classModel = typeMirror as ClassMirror;
    if (classModel.properties.length === 0 && classModel.fields.length === 0) {
      return;
    }

    const propertiesAndFields = [...classModel.properties, ...classModel.fields].filter(
      (e) => e.annotations.findIndex((a) => a.name === 'auraenabled') !== -1,
    );

    propertiesAndFields
      .sort((propA, propB) => {
        if (propA.name < propB.name) return -1;
        if (propA.name > propB.name) return 1;
        return 0;
      })
      .forEach((propertyModel) => {
        this.declareProperty(propertyModel.type, propertyModel.name, propertyModel.docComment?.description ?? '');
      });
  }

  private addInnerClasses(typeMirror: Type) {
    const classModel = typeMirror as ClassMirror;
    if (classModel.classes.length > 0) {
      classModel.classes
        .sort((classA, classB) => {
          if (classA.name < classB.name) return -1;
          if (classA.name > classB.name) return 1;
          return 0;
        })
        .forEach((innerClass) => {
          this.onTypeDeclaration(innerClass, true);
        });
    }
  }

  addBlankLine() {
    this._contents += '\n';
  }

  initializeTypeNamespace(typeMirror: Type, isInner: boolean) {
    if (typeMirror.docComment?.description) {
      this._contents += '/**';
      this._contents += ` * ${typeMirror.docComment.description}`;
      this._contents += ' */';
      this.addBlankLine();
    }
    if (isInner) {
      this._contents += ` interface ${typeMirror.name} {`;
    } else {
      this._contents += `declare namespace ${typeMirror.name} {`;
    }
    this.addBlankLine();
  }

  finalizeBlock() {
    this._contents += '}';
    this.addBlankLine();
  }

  declareProperty(propertyType: string, propertyName: string, docDescription: string) {
    let sanitizedType;
    // First we check if we are dealing with a list
    if (this.isListProperty(propertyType)) {
      // If we are then we first extract the type from the list
      sanitizedType = this.extractTypeFromList(propertyType);
      // then sanitize it
      sanitizedType = this.sanitizeApexPropertyToJavascript(sanitizedType);
      // and then we add brackets ([])
      sanitizedType = sanitizedType + '[]';
    } else {
      sanitizedType = this.sanitizeApexPropertyToJavascript(propertyType);
    }

    if (docDescription) {
      this._contents += '/**';
      this._contents += ` * ${docDescription}`;
      this._contents += ' */';
    }
    this._contents += ` let ${propertyName}: ${sanitizedType};`;
    this.addBlankLine();
  }

  sanitizeApexPropertyToJavascript(propertyType: string) {
    const lowerPropertyType = propertyType.toLowerCase();
    if (lowerPropertyType === 'decimal' || lowerPropertyType === 'integer' || lowerPropertyType === 'double') {
      return 'number';
    }

    if (lowerPropertyType === 'boolean' || lowerPropertyType === 'string') {
      // If it is a built-in type then we return the lower-cased version.
      return lowerPropertyType;
    }

    // Otherwise, we respect casing
    return propertyType;
  }

  isListProperty(propertyType: string) {
    const lowerPropertyType = propertyType.toLowerCase();
    if (lowerPropertyType.includes('<') && lowerPropertyType.includes('list')) {
      return true;
    }
  }

  extractTypeFromList(propertyType: string) {
    const propertyWithoutList = this.replaceAll(propertyType, 'list', '');
    return propertyWithoutList.replace('list', '').replace('<', '').replace('>', '');
  }

  // Case insensitive replace
  replaceAll(sourceString: string, strReplace: string, strWith: string) {
    // See http://stackoverflow.com/a/3561711/556609
    const esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const reg = new RegExp(esc, 'ig');
    return sourceString.replace(reg, strWith);
  }
}
