import ApexModel from './ApexModel';
import MethodModel from './MethodModel';
import PropertyModel from './PropertyModel';
import EnumModel from './EnumModel';
import Configuration from '../Configuration';

export default class ClassModel extends ApexModel {
  methods: MethodModel[] = [];
  properties: PropertyModel[] = [];
  cmodelParent?: ClassModel;
  childClasses: ClassModel[] = [];
  childEnums: EnumModel[] = [];
  strClassGroup: string = Configuration.getConfig()?.defaultGroupName || 'Miscellaneous';
  strClassGroupContent: string = '';
  isInterface: boolean = false;
  isEnum: boolean = false;
  seeList: string[] = [];
  className: string = '';

  constructor(parent?: any) {
    super();
    if (parent) {
      this.cmodelParent = parent as ClassModel;
    }
  }

  getProperties() {
    return this.properties;
  }

  setProperties(properties: PropertyModel[]) {
    this.properties = properties;
  }

  getMethods() {
    return this.methods;
  }

  setMethods(methods: MethodModel[]) {
    this.methods = methods;
  }

  getChildClasses() {
    return this.childClasses;
  }

  addChildClass(child: ClassModel) {
    this.childClasses.push(child);
  }

  addChildEnum(childEnum: EnumModel) {
    this.childEnums.push(childEnum);
  }

  getChildEnums() {
    return this.childEnums;
  }

  getClassName(): string {
    if (this.className !== '') {
      return this.className;
    }

    let nameLine = this.getNameLine();
    const strParent = this.cmodelParent == null ? '' : this.cmodelParent.getClassName() + '.';
    if (nameLine != null) nameLine = nameLine.trim();
    if (nameLine != null && nameLine.trim().length > 0) {
      let fFound = nameLine.toLowerCase().indexOf('class ');
      let cch = 6;
      if (fFound === -1) {
        fFound = nameLine.toLowerCase().indexOf('interface ');
        cch = 10;
      }
      if (fFound > -1) nameLine = nameLine.substring(fFound + cch).trim();
      const lFound = nameLine.indexOf(' ');
      if (lFound === -1) return strParent + nameLine;
      try {
        const name = nameLine.substring(0, lFound);
        return strParent + name;
      } catch (ex) {
        return strParent + nameLine.substring(nameLine.lastIndexOf(' ') + 1);
      }
    } else {
      return '';
    }
  }

  setClassName(className: string) {
    this.className = className;
  }

  getTopmostClassName() {
    if (this.cmodelParent != null) return this.cmodelParent.getClassName();
    else return this.getClassName();
  }

  getClassGroup(): string {
    if (this.cmodelParent != null) return this.cmodelParent.getClassGroup();
    else return this.strClassGroup;
  }

  setClassGroup(strGroup: string) {
    this.strClassGroup = strGroup;
  }

  getClassGroupContent() {
    return this.strClassGroupContent;
  }

  setClassGroupContent(strGroupContent: string) {
    this.strClassGroupContent = strGroupContent;
  }

  getIsInterface() {
    return this.isInterface;
  }

  setIsInterface(isInterface: boolean) {
    this.isInterface = isInterface;
  }

  getIsEnum() {
    return this.isEnum;
  }

  setIsEnum(isEnum: boolean) {
    this.isEnum = isEnum;
  }

  addSee(seeClassName: string) {
    this.seeList.push(seeClassName);
  }

  getSeeList() {
    return this.seeList;
  }
}
