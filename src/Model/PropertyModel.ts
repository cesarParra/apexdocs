import ApexModel from './ApexModel';
import { findPreviousWord } from '../utils';

export default class PropertyModel extends ApexModel {
  setNameLine(nameLine: string, iLine: number) {
    // remove any trailing stuff after property name. { =
    let i = nameLine.indexOf('{');
    if (i === -1) i = nameLine.indexOf('=');
    if (i === -1) i = nameLine.indexOf(';');
    if (i >= 0) nameLine = nameLine.substring(0, i);
    super.setNameLine(nameLine, iLine);
  }

  getPropertyName() {
    const nameLine = this.getNameLine().trim();
    if (nameLine != null && nameLine.length > 0) {
      const lastindex = nameLine.lastIndexOf(' ');
      if (lastindex >= 0) {
        const propertyName = nameLine.substring(lastindex + 1);
        return propertyName;
      }
    }
    return '';
  }

  getReturnType() {
    const nameLine = this.getNameLine().trim();
    if (nameLine != null && nameLine.length > 0) {
      const lastindex = nameLine.indexOf(this.getPropertyName());
      if (lastindex >= 0) {
        const returnType = findPreviousWord(nameLine, lastindex);
        return returnType ? returnType : '';
      }
    }
    return '';
  }
}
