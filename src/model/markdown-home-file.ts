import { Type } from '@cparra/apex-reflection';
import ClassFileGeneratorHelper from '../transpiler/markdown/class-file-generatorHelper';
import { MarkdownFile } from './markdown-file';

export class MarkdownHomeFile extends MarkdownFile {
  constructor(public fileName: string, public types: Type[], headerContent?: string) {
    super(fileName, '');
    if (headerContent) {
      this.addText(headerContent);
    }
    this.addTitle('Classes');
    this.addTypeEntries(types);
  }

  private addTypeEntries(types: Type[]) {
    const groupedClasses: Map<string, Type[]> = this.group(types);
    groupedClasses.forEach((value: Type[], key: string) => {
      this.addTitle(key, 2);
      value.forEach((typeMirror) => {
        this.addTypeEntry(typeMirror);
      });
    });
  }

  private addTypeEntry(typeMirror: Type) {
    this.addBlankLine();
    this.addTitle(ClassFileGeneratorHelper.getFileLink(typeMirror), 3);
    this.addBlankLine();
    this.addText(typeMirror.docComment?.description ?? '');
  }

  private group(classes: Type[]): Map<string, Type[]> {
    return classes.reduce((groups, currentClass) => {
      const key = this.getClassGroup(currentClass);
      const group: Type[] = groups.get(key) || [];
      group.push(currentClass);
      groups.set(key, group);
      return groups;
    }, new Map());
  }

  private getClassGroup(classModel: Type): string {
    return (
      classModel.docComment?.annotations.find((annotation) => annotation.name === 'group')?.body ?? 'Miscellaneous'
    );
  }
}
