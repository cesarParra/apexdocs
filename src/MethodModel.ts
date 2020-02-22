import ApexModel from './ApexModel';
import { strPrevWord } from './utils';

export default class MethodModel extends ApexModel {
    params: Array<string> = [];
    nameLine: string = '';
    iLine: number | undefined;
    returnType: string = '';

    setNameLine(nameLine: string, iLine: number) {
        // remove anything after the parameter list
        if (nameLine != null) {
            let i = nameLine.lastIndexOf(')');
            if (i >= 0) nameLine = nameLine.substring(0, i + 1);
        }
        super.setNameLine(nameLine, iLine);
    }

    getParams() {
        return this.params;
    }

    setParams(params: Array<string>) {
        this.params = params;
    }

    getReturnType() {
        return this.returnType;
    }

    setReturnType(returnType: string) {
        this.returnType = returnType;
    }

    getMethodName(): string {
        let nameLine = this.getNameLine().trim();
        if (nameLine != null && nameLine.length > 0) {
            let lastindex = nameLine.indexOf('(');
            if (lastindex >= 0) {
                let methodName = strPrevWord(nameLine, lastindex);
                return methodName ? methodName : '';
            }
        }
        return '';
    }
}
