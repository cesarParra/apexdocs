import ApexModel from './ApexModel';
import { findPreviousWord } from '../utils';

export default class MethodModel extends ApexModel {
  params: string[] = [];
  thrownExceptions: string[] = [];
  iLine: number | undefined;
  returnType: string = '';
  private isConstructor: boolean = false;

  setNameLine(nameLine: string, iLine: number) {
    // remove anything after the parameter list
    if (nameLine != null) {
      const i = nameLine.lastIndexOf(')');
      if (i >= 0) nameLine = nameLine.substring(0, i + 1);
    }
    super.setNameLine(nameLine, iLine);
  }

  getParams() {
    return this.params;
  }

  setParams(params: string[]) {
    this.params = params;
  }

  getThrownExceptions() {
    return this.thrownExceptions;
  }

  setThrownExceptions(thrownExceptions: string[]) {
    this.thrownExceptions = thrownExceptions;
  }

  getReturnType() {
    if (this.isConstructor) {
      // If the method is a constructor, then it return the same type as its name.
      return this.getMethodName();
    }

    const nameLine = this.getNameLine().trim();
    if (nameLine != null && nameLine.length > 0) {
      const lastindex = nameLine.indexOf(this.getMethodName());
      if (lastindex >= 0) {
        const returnType = findPreviousWord(nameLine, lastindex);
        return returnType ? returnType : '';
      }
    }
    return '';
  }

  getMethodName(): string {
    const nameLine = this.getNameLine().trim();
    if (nameLine != null && nameLine.length > 0) {
      const lastindex = nameLine.indexOf('(');
      if (lastindex >= 0) {
        const methodName = findPreviousWord(nameLine, lastindex);
        return methodName ? methodName : '';
      }
    }
    return '';
  }

  getSignature() {
    const nameLine = this.getNameLine().trim();
    if (nameLine != null && nameLine.length > 0) {
      const beginParen = nameLine.indexOf('(');
      return this.getMethodName() + nameLine.substring(beginParen);
    }
  }

  setIsConstructor(isConstructor: boolean) {
    this.isConstructor = isConstructor;
  }

  getIsConstructor() {
    return this.isConstructor;
  }
}
