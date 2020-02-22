import ApexModel from './ApexModel';

export default class PropertyModel extends ApexModel {
    setNameLine(nameLine: string, iLine: number) {
      if (nameLine != null) {
        // remove any trailing stuff after property name. { =
        let i = nameLine.indexOf('{');
        if (i == -1) i = nameLine.indexOf('=');
        if (i == -1) i = nameLine.indexOf(';');
        if (i >= 0) nameLine = nameLine.substring(0, i);
      }
      super.setNameLine(nameLine, iLine);
    }
  
    getPropertyName() {
      let nameLine = this.getNameLine().trim();
      if (nameLine != null && nameLine.length > 0) {
        let lastindex = nameLine.lastIndexOf(' ');
        if (lastindex >= 0) {
          let propertyName = nameLine.substring(lastindex + 1);
          return propertyName;
        }
      }
      return '';
    }
  }