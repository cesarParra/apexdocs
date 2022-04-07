import Settings from '../Settings';

export default class ApexModel {
  protected nameLine: string = '';
  private nameLineIndex: number | undefined;
  private description: string = '';
  private authors: string[] = [];
  private dates: string[] = [];
  private returns: string = '';
  private example: string = '';
  private scope: string = '';
  private isNamespaceAccessible: boolean = false;

  private generics = new Map<string, string>();

  getNameLine() {
    return this.nameLine;
  }

  getInameLine() {
    return this.nameLineIndex;
  }

  setNameLine(nameLine: string, iLine: number) {
    this.nameLine = nameLine.trim();
    this.nameLineIndex = iLine;
    this.parseScope();
  }

  getDescription() {
    return this.description == null ? '' : this.description;
  }

  setDescription(description: string) {
    this.description = description;
  }

  getAuthors() {
    return this.authors;
  }

  addAuthor(author: string) {
    this.authors.push(author);
  }

  getDates() {
    return this.dates;
  }

  addDate(date: string) {
    this.dates.push(date);
  }

  getReturns() {
    return this.returns == null ? '' : this.returns;
  }

  setReturns(returns: string) {
    this.returns = returns;
  }

  getExample() {
    return this.example == null ? '' : this.example;
  }

  setExample(example: string) {
    this.example = example;
  }

  getScope() {
    return this.scope == null ? '' : this.scope;
  }

  setScope(scope: string) {
    this.scope = scope;
  }

  setIsNamespaceAccessible(isNamespaceAccessible: boolean) {
    this.isNamespaceAccessible = isNamespaceAccessible;
  }

  getIsNamespaceAccessible() {
    return this.isNamespaceAccessible;
  }

  setGeneric(name: string, value: string) {
    this.generics.set(name, value);
  }

  getGeneric(name: string) {
    const value = this.generics.get(name);
    return value ? value : '';
  }

  private parseScope() {
    this.scope = '';
    const str = this.getScopeFromSettings(this.nameLine);
    if (str != null) {
      this.scope = str;
    }
  }

  private getScopeFromSettings(str: string) {
    str = str.toLowerCase();
    for (const currentScope of Settings.getInstance().getScope()) {
      if (str.toLowerCase().includes(currentScope.toLowerCase() + ' ')) {
        return currentScope;
      }
    }

    return null;
  }
}
