import ApexModel from './ApexModel.js';

export default class ClassModel extends ApexModel {
    constructor(cmodelParent) {
        super();
        this.methods = [];
        this.properties = [];
        this.cmodelParent = cmodelParent;
        this.childClasses = [];
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

    setProperties(properties) {
        this.properties = properties;
    }

    getMethods() {
        return this.methods;
    }

    getMethodsSorted() {
        // @SuppressWarnings("unchecked")
        // List<MethodModel> sorted = (List<MethodModel>)methods.clone();
        // Collections.sort(sorted, new Comparator<MethodModel>(){
        //     @Override
        //     public int compare(MethodModel o1, MethodModel o2) {
        //         String methodName1 = o1.getMethodName();
        //         String methodName2 = o2.getMethodName();
        //         String className = getClassName();

        //         if(methodName1.equals(className)){
        //             return Integer.MIN_VALUE;
        //         } else if(methodName2.equals(className)){
        //             return Integer.MAX_VALUE;
        //         }
        //         return (methodName1.toLowerCase().compareTo(methodName2.toLowerCase()));
        //     }
        // });
        // return new ArrayList<MethodModel>(sorted);
        return this.methods;
    }

    setMethods(methods) {
        this.methods = methods;
    }

    getChildClassesSorted() {
        // TreeMap<String, ClassModel> tm = new TreeMap<String, ClassModel>();
        // for (ClassModel cm : childClasses)
        //     tm.put(cm.getClassName().toLowerCase(), cm);
        // return new ArrayList<ClassModel>(tm.values());
        return this.childClasses;
    }

    addChildClass(child) {
        this.childClasses.push(child);
    }

    getClassName() {
        let nameLine = this.getNameLine();
        let strParent = this.cmodelParent == null ? "" : this.cmodelParent.getClassName() + ".";
        if (nameLine != null)
            nameLine = nameLine.trim();
        if (nameLine != null && nameLine.trim().length > 0) {
            let fFound = nameLine.toLowerCase().indexOf("class ");
            let cch = 6;
            if (fFound == -1) {
                fFound = nameLine.toLowerCase().indexOf("interface ");
                cch = 10;
            }
            if (fFound > -1)
                nameLine = nameLine.substring(fFound + cch).trim();
            let lFound = nameLine.indexOf(" ");
            if (lFound == -1)
                return strParent + nameLine;
            try {
                let name = nameLine.substring(0, lFound);
                return strParent + name;
            } catch (ex) {
                return strParent + nameLine.substring(nameLine.lastIndexOf(" ") + 1);
            }
        } else {
            return "";
        }

    }

    getTopmostClassName() {
        if (this.cmodelParent != null)
            return this.cmodelParent.getClassName();
        else
            return this.getClassName();
    }

    getClassGroup() {
        if (this.cmodelParent != null)
            return this.cmodelParent.getClassGroup();
        else
            return this.strClassGroup;
    }

    setClassGroup(strGroup) {
        this.strClassGroup = strGroup;
    }

    getClassGroupContent() {
        return this.strClassGroupContent;
    }

    setClassGroupContent(strGroupContent) {
        this.strClassGroupContent = strGroupContent;
    }

    getIsInterface() {
        return this.isInterface;
    }

    setIsInterface(isInterface) {
        this.isInterface = isInterface;
    }
}