export default class FileGenerator {
    constructor() {
        this.contents = '';
    }

    addBlankLine() {
        this.contents += '\r\n';
    }

    addTitle(text, level) {
        let title = '';
        for (let i = 0; i < level; i++) {
            title += '#';
        }

        title += ' ';
        title += text;
        this.contents += title;
        this.addBlankLine();
    }

    addText(text) {
        this.contents += text;
        this.addBlankLine();
    }
}