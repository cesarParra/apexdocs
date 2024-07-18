import { Type } from '@cparra/apex-reflection';
import { TypesRepository } from '../../model/types-repository';
import { Settings } from '../../settings';
import State from '../../service/state';
import { StringOrLink } from '../../core/renderable/types';

export default class ClassFileGeneratorHelper {
  public static getSanitizedGroup(classModel: Type) {
    return this.getClassGroup(classModel).replace(/ /g, '-').replace('.', '');
  }

  public static getFileLink(classModel: Type) {
    const [fullClassName, fileLink] = ClassFileGeneratorHelper.getFileLinkTuple(classModel);
    return `[${fullClassName}](${fileLink})`;
  }

  private static getFileLinkTuple(classModel: Type): [string, string] {
    const documentationRoot = Settings.getInstance().getRootDir() ?? '';
    const directoryRoot = `${documentationRoot}${this.getDirectoryRoot(classModel)}`;
    const fullClassName = `${Settings.getInstance().getNamespacePrefix()}${classModel.name}`;
    return [fullClassName, `${directoryRoot}${fullClassName}.md`];
  }

  public static getFileLinkByTypeName(typeName: string): string {
    const type = TypesRepository.getInstance().getFromScopedByName(typeName);
    if (!type) {
      // If the type is not found, we return a Markdown hyperlink with whatever we received.
      return `[${typeName}](${typeName})`;
    }

    return this.getFileLink(type);
  }

  public static getRenderableLinkByTypeName(typeName: string): StringOrLink {
    const type = TypesRepository.getInstance().getFromScopedByName(typeName);
    if (!type) {
      // If the type is not found, we return the type name as a string.
      return typeName;
    }

    const [fullClassName, fileLink] = ClassFileGeneratorHelper.getFileLinkTuple(type);
    return {
      title: fullClassName,
      url: fileLink,
    };
  }

  private static getDirectoryRoot(classModel: Type) {
    // root-relative links start from the root by using a leading '/'
    if (Settings.getInstance().getLinkingStrategy() === 'root-relative') {
      return `/${this.getSanitizedGroup(classModel)}/`;
    }

    // path-relative links traverse the directory structure
    const typeBeingProcessed = State.getInstance().getTypeBeingProcessed();
    if (typeBeingProcessed) {
      if (this.getClassGroup(typeBeingProcessed) === this.getClassGroup(classModel)) {
        // If the types the same groups then we simply link directly to that file
        return './';
      } else {
        // If the types have different groups, then we have to go up a directory
        return `../${this.getSanitizedGroup(classModel)}/`;
      }
    } else {
      // If nothing is being processed, then we assume we are at the root and links should include the groups
      return `./${this.getSanitizedGroup(classModel)}/`;
    }
  }

  private static getClassGroup(classModel: Type): string {
    const groupAnnotation = classModel.docComment?.annotations.find(
      (annotation) => annotation.name.toLowerCase() === 'group',
    );
    return groupAnnotation?.body ?? Settings.getInstance().getDefaultGroupName();
  }
}
