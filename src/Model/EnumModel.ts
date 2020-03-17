import ClassModel from './ClassModel';

export default class EnumModel extends ClassModel {
  constructor() {
    super();
    this.setIsEnum(true);
  }

  setNameLine(nameLine: string, iLine: number) {
    // remove any trailing stuff after enum name.
    const i = nameLine.indexOf('{');
    if (i >= 0) nameLine = nameLine.substring(0, i);
    super.setNameLine(nameLine, iLine);
  }

  getClassName() {
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
}
