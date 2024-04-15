import { Walker, WalkerListener } from './walker';
import { ClassMirror } from '@cparra/apex-reflection';
import { Settings } from '../../settings';

export class ClassWalker extends Walker {
  walk(listener: WalkerListener): void {
    listener.onTypeDeclaration(this.type);
    const classMirror = this.type as ClassMirror;
    const shouldSortMembers = Settings.getInstance().sortMembersAlphabetically();
    if (classMirror.constructors.length) {
      listener.onConstructorDeclaration(this.type.name, classMirror.constructors);
    }
    if (classMirror.fields.length) {
      listener.onFieldsDeclaration(this.sortType(shouldSortMembers, classMirror.fields));
    }
    if (classMirror.properties.length) {
      listener.onPropertiesDeclaration(this.sortType(shouldSortMembers, classMirror.properties));
    }
    if (classMirror.methods.length) {
      listener.onMethodsDeclaration(this.sortType(shouldSortMembers, classMirror.methods));
    }
    if (classMirror.enums.length) {
      listener.onInnerEnumsDeclaration(this.sortType(shouldSortMembers, classMirror.enums));
    }
    if (classMirror.classes.length) {
      listener.onInnerClassesDeclaration(this.sortType(shouldSortMembers, classMirror.classes));
    }
    if (classMirror.interfaces.length) {
      listener.onInnerInterfacesDeclaration(this.sortType(shouldSortMembers, classMirror.interfaces));
    }
  }

  private sortType<T extends { name: string }>(shouldSort: boolean, types: T[]): T[] {
    if (shouldSort) {
      return types.sort((a, b) => a.name.localeCompare(b.name));
    }
    return types;
  }
}
