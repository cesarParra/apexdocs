export default class ApexModel {
    rgstrScope: Array<string> = ["public"]; // TODO: We don't really want this
    nameLine: string = '';
    inameLine: number | undefined;
    description: string = '';
    author: string = '';
    date: string = '';
    returns: string = '';
    example: string = '';
    scope: string = '';

    getNameLine() {
        return this.nameLine;
    }

    getInameLine() {
        return this.inameLine;
    }

    setNameLine(nameLine: string, iLine: number) {
        this.nameLine = nameLine.trim();
        this.inameLine = iLine;
        this.parseScope();
    }

    getDescription() {
        return this.description == null ? '' : this.description;
    }

    setDescription(description: string) {
        this.description = description;
    }

    getAuthor() {
        return this.author == null ? '' : this.author;
    }

    setAuthor(author: string) {
        this.author = author;
    }

    getDate() {
        return this.date == null ? '' : this.date;
    }

    setDate(date: string) {
        this.date = date;
    }

    getReturns() {
        return this.returns == null ? '' : this.returns;
    }

    setReturns(returns: string) {
        this.returns = returns;
    }

    getExample() {
        return this.example == null ? '' : this.example;
    }

    setExample(example: string) {
        this.example = example;
    }

    getScope() {
        return this.scope == null ? '' : this.scope;
    }

    setScope(scope: string) {
        this.scope = scope;
    }

    parseScope() {
        this.scope = '';
        if (this.nameLine != null) {
            let str = this.strContainsScope(this.nameLine);
            if (str != null) {
                this.scope = str;
            } 
        }
    }

    // TODO: This is used in both index and here, maybe we want some kind of utils class?
    strContainsScope(str: string) {
        str = str.toLowerCase();
        for (let i = 0; i < this.rgstrScope.length; i++) {
            if (str.toLowerCase().includes(this.rgstrScope[i].toLowerCase() + ' ')) {
                return this.rgstrScope[i];
            }
        }
        return null;
    }
}