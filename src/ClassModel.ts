import ApexModel from './ApexModel';
import MethodModel from './MethodModel';
import PropertyModel from './PropertyModel';

export default class ClassModel extends ApexModel {
    methods: Array<MethodModel> = [];
    properties: Array<PropertyModel> = [];
    cmodelParent?: ClassModel;
    childClasses: Array<ClassModel> = [];
    strClassGroup: string = '';
    strClassGroupContent: string = '';
    isInterface: boolean = false;

    constructor(parent?: any) {
      super();

      if (parent) {
        this.cmodelParent = parent as ClassModel;
      }

    }
  
    getProperties() {
      return this.properties;
    }
  
    getPropertiesSorted() {
      // TreeMap<String, PropertyModel> tm = new TreeMap<String, PropertyModel>();
      // for (PropertyModel prop : properties)
      //     tm.put(prop.getPropertyName().toLowerCase(), prop);
      // return new ArrayList<PropertyModel>(tm.values());
      return this.properties;
    }
  
    setProperties(properties: Array<PropertyModel>) {
      this.properties = properties;
    }
  
    getMethods() {
      return this.methods;
    }
  
    getMethodsSorted() {
        // TODO
      return this.methods;
    }
  
    setMethods(methods: Array<MethodModel>) {
      this.methods = methods;
    }
  
    getChildClassesSorted() {
        // TODO
      return this.childClasses;
    }
  
    addChildClass(child: ClassModel) {
      this.childClasses.push(child);
    }
  
    getClassName(): string {
      let nameLine = this.getNameLine();
      let strParent = this.cmodelParent == null ? '' : this.cmodelParent.getClassName() + '.';
      if (nameLine != null) nameLine = nameLine.trim();
      if (nameLine != null && nameLine.trim().length > 0) {
        let fFound = nameLine.toLowerCase().indexOf('class ');
        let cch = 6;
        if (fFound == -1) {
          fFound = nameLine.toLowerCase().indexOf('interface ');
          cch = 10;
        }
        if (fFound > -1) nameLine = nameLine.substring(fFound + cch).trim();
        let lFound = nameLine.indexOf(' ');
        if (lFound == -1) return strParent + nameLine;
        try {
          let name = nameLine.substring(0, lFound);
          return strParent + name;
        } catch (ex) {
          return strParent + nameLine.substring(nameLine.lastIndexOf(' ') + 1);
        }
      } else {
        return '';
      }
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
  }
  