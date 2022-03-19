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
import { WalkerListener } from '../service/walkers/walker';
import { MarkdownFile } from './markdown-file';
import { declareType, declareMethod, declareField } from './markdown-generation-util';
import ClassFileGeneratorHelper from '../transpiler/markdown/class-file-generatorHelper';

export class MarkdownTypeFile extends MarkdownFile implements WalkerListener {
  constructor(public type: Type, public startingHeadingLevel: number = 1, headerContent?: string) {
    super(`${type.name}`, ClassFileGeneratorHelper.getSanitizedGroup(type));
    if (headerContent) {
      this.addText(headerContent);
    }
    const walker = WalkerFactory.get(type);
    walker.walk(this);
  }

  public addText(text: string, encodeHtml = true) {
    text = MarkdownTypeFile.replaceInlineLinks(text);
    super.addText(text, encodeHtml);
  }

  public onTypeDeclaration(typeMirror: Type, headingLevel?: 1): void {
    declareType(this, typeMirror, this.startingHeadingLevel);
  }

  public onConstructorDeclaration(className: string, constructors: ConstructorMirror[]): void {
    declareMethod('Constructors', this, constructors, this.startingHeadingLevel, className);
  }

  public onFieldsDeclaration(fields: FieldMirror[]): void {
    declareField('Fields', this, fields, this.startingHeadingLevel);
  }

  public onPropertiesDeclaration(properties: PropertyMirror[]): void {
    declareField('Properties', this, properties, this.startingHeadingLevel);
  }

  public onMethodsDeclaration(methods: MethodMirror[]): void {
    declareMethod('Methods', this, methods, this.startingHeadingLevel);
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
    this.addTitle(title, this.startingHeadingLevel + 1);
    types
      .sort((typeA, typeB) => {
        if (typeA.name < typeB.name) return -1;
        if (typeA.name > typeB.name) return 1;
        return 0;
      })
      .forEach((currentType) => {
        const innerFile = new MarkdownTypeFile(currentType, this.startingHeadingLevel + 2);
        this.addText(innerFile._contents);
      });
    if (addSeparator) {
      this.addHorizontalRule();
    }
  }

  private static replaceInlineLinks(text: string) {
    // Parsing text to extract possible linking classes.
    const possibleLinks = text.match(/<<.*?>>/g);
    possibleLinks?.forEach((currentMatch) => {
      const classNameForMatch = currentMatch.replace('<<', '').replace('>>', '');
      text = text.replace(currentMatch, ClassFileGeneratorHelper.getFileLinkByTypeName(classNameForMatch));
    });

    // Parsing links using {@link ClassName} format
    const linkFormatRegEx = '{@link (.*?)}';
    const expression = new RegExp(linkFormatRegEx, 'gi');
    let match;
    const matches = [];

    do {
      match = expression.exec(text);
      if (match) {
        matches.push(match);
      }
    } while (match);

    for (const currentMatch of matches) {
      text = text.replace(currentMatch[0], ClassFileGeneratorHelper.getFileLinkByTypeName(currentMatch[1]));
    }
    return text;
  }
}
