import Scope from '../Scope';

export default class ApexModel {
  nameLine: string = '';
  inameLine: number | undefined;
  description: string = '';
  author: string = '';
  date: string = '';
  returns: string = '';
  example: string = '';
  scope: string = '';

  getNameLine() {
    return this.nameLine;
  }

  getInameLine() {
    return this.inameLine;
  }

  setNameLine(nameLine: string, iLine: number) {
    this.nameLine = nameLine.trim();
    this.inameLine = iLine;
    this.parseScope();
  }

  getDescription() {
    return this.description == null ? '' : this.description;
  }

  setDescription(description: string) {
    this.description = description;
  }

  getAuthor() {
    return this.author == null ? '' : this.author;
  }

  setAuthor(author: string) {
    this.author = author;
  }

  getDate() {
    return this.date == null ? '' : this.date;
  }

  setDate(date: string) {
    this.date = date;
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

  parseScope() {
    this.scope = '';
    if (this.nameLine != null) {
      const str = this.strContainsScope(this.nameLine);
      if (str != null) {
        this.scope = str;
      }
    }
  }

  strContainsScope(str: string) {
    str = str.toLowerCase();
    for (const currentScope of Scope.getInstance().get()) {
      if (str.toLowerCase().includes(currentScope.toLowerCase() + ' ')) {
        return currentScope;
      }
    }

    return null;
  }
}
