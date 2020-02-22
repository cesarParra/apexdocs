export default class ApexModel {
    constructor() {
        // TODO: Fix
        this.rgstrScope = ["public"];
    }

    getNameLine() {
        return this.nameLine;
    }

    getInameLine() {
        return this.inameLine;
    }

    setNameLine(nameLine, iLine) {
        this.nameLine = nameLine.trim();
        this.inameLine = iLine;
        this.parseScope();
    }

    getDescription() {
        return this.description == null ? "" : this.description;
    }

    setDescription(description) {
        this.description = description;
    }

    getAuthor() {
        return this.author == null ? "" : this.author;
    }

    setAuthor(author) {
        this.author = author;
    }

    getDate() {
        return this.date == null ? "" : this.date;
    }

    setDate(date) {
        this.date = date;
    }

    getReturns() {
        return this.returns == null ? "" : this.returns;
    }

    setReturns(returns) {
        this.returns = returns;
    }

    getExample() {
        return this.example == null ? "" : this.example;
    }

    setExample(example) {
        this.example = example;
    }

    getScope() {
        return this.scope == null ? "" : this.scope;
    }

    setScope(scope) {
        this.scope = scope;
    }

    parseScope() {
        this.scope = null;
        if (this.nameLine != null) {
            let str = this.strContainsScope(this.nameLine);
            if (str != null)
                this.scope = str;
        }
    }

    // TODO: This is used in both index and here, maybe we want some kind of utils class?
    strContainsScope(str) {
        str = str.toLowerCase();
        for (let i = 0; i < this.rgstrScope.length; i++) {
            if (str.toLowerCase().includes(this.rgstrScope[i].toLowerCase() + " ")) {
                return this.rgstrScope[i];
            }
        }
        return null;
    }
}