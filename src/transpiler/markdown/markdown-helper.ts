// import { encode } from 'html-entities';
// import { Type } from '@cparra/apex-reflection';
//
// import ClassFileGeneratorHelper from './class-file-generatorHelper';
// import Configuration from './../Configuration';
//
// export default class MarkdownHelper {
//   contents: string = '';
//   classes: Type[];
//
//   constructor(classes: Type[]) {
//     this.classes = classes;
//   }
//
//   addBlankLine() {
//     this.contents += '\n';
//   }
//
//   addTitle(text: string, level: number = 1) {
//     let title = '';
//     for (let i = 0; i < level; i++) {
//       title += '#';
//     }
//
//     title += ' ';
//     title += text;
//     this.contents += title;
//     this.addBlankLine();
//   }
//
//   addText(text: string, encodeHtml: boolean = true) {
//     // Parsing text to extract possible linking classes.
//     const possibleLinks = text.match(/<<.*?>>/g);
//     possibleLinks?.forEach(currentMatch => {
//       const classNameForMatch = currentMatch.replace('<<', '').replace('>>', '');
//       this.classes.forEach(classModel => {
//         if (classModel.name === classNameForMatch) {
//           text = text.replace(currentMatch, ClassFileGeneratorHelper.getFileLink(classModel));
//         }
//       });
//     });
//
//     // Parsing links using {@link ClassName} format
//     const linkFormatRegEx = '{@link (.*?)}';
//     const expression = new RegExp(linkFormatRegEx, 'gi');
//     let match;
//     const matches = [];
//
//     do {
//       match = expression.exec(text);
//       if (match) {
//         matches.push(match);
//       }
//     } while (match);
//
//     for (const currentMatch of matches) {
//       this.classes.forEach(classModel => {
//         if (classModel.name === currentMatch[1]) {
//           text = text.replace(currentMatch[0], ClassFileGeneratorHelper.getFileLink(classModel));
//         }
//       });
//     }
//
//     const textToAdd = encodeHtml ? encode(text) : text;
//     this.contents += textToAdd;
//     this.addBlankLine();
//   }
//
//   addHorizontalRule() {
//     this.contents += '---';
//     this.addBlankLine();
//   }
//
//   addLink(title: string, url: string) {
//     this.contents += `[${title}](${url})`;
//   }
//
//   startCodeBlock() {
//     this.contents += '```';
//     const sourceLanguage = Configuration.getConfig()?.sourceLanguage;
//     if (sourceLanguage) {
//       this.contents += sourceLanguage;
//     }
//     this.addBlankLine();
//   }
//
//   endCodeBlock() {
//     this.contents += '```';
//     this.addBlankLine();
//   }
// }
