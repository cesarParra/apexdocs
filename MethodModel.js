import ApexModel from './ApexModel.js';
import {strPrevWord} from './utils.js';

export default class MethodModel extends ApexModel {
    constructor() {
        super();
        this.params = [];
    }

    setNameLine(nameLine, iLine) {
        // remove anything after the parameter list
        if (nameLine != null) {
            let i = nameLine.lastIndexOf(")");
            if (i >= 0)
                nameLine = nameLine.substring(0, i + 1);
        }
        super.setNameLine(nameLine, iLine);
    }

    getParams() {
        return this.params;
    }

    setParams(params) {
        this.params = params;
    }

    getReturnType() {
        return this.returnType;
    }

    setReturnType(returnType) {
        this.returnType = returnType;
    }

    getMethodName() {
        let nameLine = this.getNameLine().trim();
        if (nameLine != null && nameLine.length > 0) {
            let lastindex = nameLine.indexOf("(");
            if (lastindex >= 0) {
                let methodName = strPrevWord(nameLine, lastindex);
                return methodName;
            }
        }
        return "";
    }
}