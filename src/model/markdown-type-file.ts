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
import { Settings } from '../settings';

interface GroupAware {
  group?: string;
  groupDescription?: string;
}

interface GroupMap {
  [key: string]: GroupAware[];
}

export class MarkdownTypeFile extends MarkdownFile implements WalkerListener {
  constructor(private type: Type, private headingLevel: number = 1, headerContent?: string, private isInner = false) {
    super(
      `${Settings.getInstance().getNamespacePrefix()}${type.name}`,
      ClassFileGeneratorHelper.getSanitizedGroup(type),
    );
    if (headerContent) {
      this.addText(headerContent);
    }
    const walker = WalkerFactory.get(type);
    walker.walk(this);
  }

  public onTypeDeclaration(typeMirror: Type): void {
    let fullTypeName;
    if (this.isInner) {
      fullTypeName = typeMirror.name;
    } else {
      // If we are dealing with a class, we want to check if it has a class
      // modifier and add it to the name.
      if (this.isClass(typeMirror) && typeMirror.classModifier) {
        fullTypeName = `${typeMirror.classModifier} ${Settings.getInstance().getNamespacePrefix()}${typeMirror.name}`;
      } else {
        fullTypeName = `${Settings.getInstance().getNamespacePrefix()}${typeMirror.name}`;
      }
    }
    this.addTitle(fullTypeName, this.headingLevel);
    declareType(this, typeMirror);
  }

  private isClass(typeMirror: Type): typeMirror is ClassMirror {
    return typeMirror.type_name === 'class';
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
    types.forEach((currentType) => {
      const innerFile = new MarkdownTypeFile(currentType, this.headingLevel + 2, undefined, true);
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
        // For the group description, we can take the first one, since they all have the same description.
        this.startGroup(key, groupedConstructors[key][0].groupDescription);
        const constructorsForGroup = groupedConstructors[key] as (ConstructorMirror | MethodMirrorWithInheritance)[];
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
        // For the group description, we can take the first one, since they all have the same description.
        this.startGroup(key, groupedFields[key][0].groupDescription);
        const fieldsForGroup = groupedFields[key] as (FieldMirrorWithInheritance | PropertyMirrorWithInheritance)[];
        declareField(this, fieldsForGroup, this.headingLevel, true);
        this.endGroup();
      }
    }
  }

  private startGroup(groupName: string, groupDescription?: string) {
    this.headingLevel = this.headingLevel + 2;
    this.addTitle(groupName, this.headingLevel);
    if (groupDescription) {
      this.addText(groupDescription);
    }
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
