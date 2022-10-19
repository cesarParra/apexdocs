import {
  ClassMirror,
  ConstructorMirror,
  EnumMirror,
  InterfaceMirror,
  MethodMirror,
  Type,
} from '@cparra/apex-reflection';
import { WalkerFactory } from '../service/walkers/walker-factory';
import { WalkerListener } from '../service/walkers/walker';
import { MarkdownFile } from './markdown-file';
import { declareType, declareMethod, declareField } from './markdown-generation-util';
import ClassFileGeneratorHelper from '../transpiler/markdown/class-file-generatorHelper';
import { FieldMirrorWithInheritance, MethodMirrorWithInheritance, PropertyMirrorWithInheritance } from './inheritance';

interface GroupAware {
  group?: string;
}

interface GroupMap {
  [key: string]: GroupAware[];
}

export class MarkdownTypeFile extends MarkdownFile implements WalkerListener {
  constructor(public type: Type, public headingLevel: number = 1, headerContent?: string) {
    super(`${type.name}`, ClassFileGeneratorHelper.getSanitizedGroup(type));
    if (headerContent) {
      this.addText(headerContent);
    }
    const walker = WalkerFactory.get(type);
    walker.walk(this);
  }

  public onTypeDeclaration(typeMirror: Type): void {
    this.addTitle(typeMirror.name, this.headingLevel);
    declareType(this, typeMirror);
  }

  public onConstructorDeclaration(className: string, constructors: ConstructorMirror[]): void {
    this.addTitle('Constructors', this.headingLevel + 1);
    this.declareMethodWithGroupings(constructors, className);
  }

  public onFieldsDeclaration(fields: FieldMirrorWithInheritance[]): void {
    this.addTitle('Fields', this.headingLevel + 1);
    this.declareFieldOrProperty(fields);
  }

  public onPropertiesDeclaration(properties: PropertyMirrorWithInheritance[]): void {
    this.addTitle('Properties', this.headingLevel + 1);
    this.declareFieldOrProperty(properties);
  }

  public onMethodsDeclaration(methods: MethodMirror[]): void {
    this.addTitle('Methods', this.headingLevel + 1);
    this.declareMethodWithGroupings(methods);
  }

  public onInnerEnumsDeclaration(enums: EnumMirror[]): void {
    this.addInnerTypes('Enums', enums);
  }

  public onInnerClassesDeclaration(classes: ClassMirror[]): void {
    this.addInnerTypes('Classes', classes);
  }

  public onInnerInterfacesDeclaration(interfaces: InterfaceMirror[]): void {
    this.addInnerTypes('Interfaces', interfaces, false);
  }

  private addInnerTypes(title: string, types: Type[], addSeparator = true) {
    this.addTitle(title, this.headingLevel + 1);
    types
      .sort((typeA, typeB) => {
        if (typeA.name < typeB.name) return -1;
        if (typeA.name > typeB.name) return 1;
        return 0;
      })
      .forEach((currentType) => {
        const innerFile = new MarkdownTypeFile(currentType, this.headingLevel + 2);
        this.addText(innerFile._contents);
      });
    if (addSeparator) {
      this.addHorizontalRule();
    }
  }

  private hasGroupings(groupAware: GroupAware[]): boolean {
    return !!groupAware.find((current) => !!current.group);
  }

  private declareMethodWithGroupings(
    methods: ConstructorMirror[] | MethodMirrorWithInheritance[],
    className = '',
  ): void {
    const hasGroupings = this.hasGroupings(methods);
    if (!hasGroupings) {
      declareMethod(this, methods, this.headingLevel, className);
    } else {
      const groupedConstructors = this.group(methods);
      for (const key in groupedConstructors) {
        this.startGroup(key);
        const constructorsForGroup = groupedConstructors[key] as ConstructorMirror[];
        declareMethod(this, constructorsForGroup, this.headingLevel, className);
        this.endGroup();
      }
    }
  }

  private declareFieldOrProperty(
    fieldsOrProperties: FieldMirrorWithInheritance[] | PropertyMirrorWithInheritance[],
  ): void {
    const hasGroupings = this.hasGroupings(fieldsOrProperties);
    if (!hasGroupings) {
      declareField(this, fieldsOrProperties, this.headingLevel, false);
    } else {
      const groupedFields = this.group(fieldsOrProperties);
      for (const key in groupedFields) {
        this.startGroup(key);
        const fieldsForGroup = groupedFields[key] as FieldMirrorWithInheritance[];
        declareField(this, fieldsForGroup, this.headingLevel, true);
        this.endGroup();
      }
    }
  }

  private startGroup(groupName: string) {
    this.headingLevel = this.headingLevel + 2;
    this.addTitle(groupName, this.headingLevel);
  }

  private endGroup() {
    this.headingLevel = this.headingLevel - 2;
  }

  private group(list: GroupAware[]) {
    return list.reduce((groups: GroupMap, item) => {
      const groupName: string = item.group ?? 'Other';
      const group: GroupAware[] = groups[groupName] || [];
      group.push(item);
      groups[groupName] = group;
      return groups;
    }, {});
  }
}
