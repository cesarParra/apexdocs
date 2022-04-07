import ClassModel from '../Model/ClassModel';
import * as sanitize from 'sanitize-filename-ts';

export default class ClassParser {
  getClass(strLine: string, lstComments: string[], iLine: number, parent?: ClassModel) {
    // create the new class
    const cModelNew: ClassModel = new ClassModel(parent);
    this.fillClassModel(cModelNew, strLine, lstComments, iLine);
    return cModelNew;
  }

  private fillClassModel(cModel: ClassModel, name: string, lstComments: string[], iLine: number) {
    cModel.setNameLine(name, iLine);
    if (name.toLowerCase().includes(' interface ')) cModel.setIsInterface(true);
    let multiline = false;
    let inDescription = false;
    let inHistory = false;
    let i = 0;

    const reAnyAnnotation = new RegExp('@([A-Za-z]*)s*(.*)');

    for (let comment of lstComments) {
      i++;
      comment = comment.trim();

      let idxStart = comment.toLowerCase().indexOf('@author');
      if (idxStart !== -1) {
        cModel.addAuthor(comment.substring(idxStart + 7).trim());
        multiline = false;
        continue;
      }

      idxStart = comment.toLowerCase().indexOf('@date');
      if (idxStart !== -1) {
        cModel.addDate(comment.substring(idxStart + 5).trim());
        multiline = false;
        continue;
      }

      idxStart = comment.toLowerCase().indexOf('@see');
      if (idxStart !== -1) {
        cModel.addSee(comment.substring(idxStart + 4).trim());
        multiline = false;
        continue;
      }

      idxStart = comment.toLowerCase().indexOf('@group '); // needed to include space to not match group-content.
      if (idxStart !== -1) {
        const group = sanitize.sanitize(comment.substring(idxStart + 6).trim());
        if (group) {
          cModel.setClassGroup(group);
        }

        multiline = false;
        continue;
      }

      idxStart = comment.toLowerCase().indexOf('@group-content');
      if (idxStart !== -1) {
        cModel.setClassGroupContent(comment.substring(idxStart + 14).trim());
        multiline = false;
        continue;
      }

      idxStart = comment.toLowerCase().indexOf('@description');
      if (idxStart !== -1 || (i === 1 && !reAnyAnnotation.test(comment))) {
        cModel.setDescription(comment.substring(idxStart + 12).trim());

        multiline = true;
        inDescription = true;
        inHistory = false;
        continue;
      }

      const anyStart = reAnyAnnotation.exec(comment);

      idxStart = typeof anyStart?.index !== 'undefined' ? anyStart.index : -1;
      if (idxStart !== -1 && anyStart !== null) {
        const genericName = anyStart[1];
        const genericValue = anyStart[2];
        cModel.setGeneric(genericName, genericValue);

        multiline = false;
        inDescription = false;
        inHistory = false;
        continue;
      }

      // handle multiple lines for description.
      if (multiline === true) {
        let j;
        for (j = 0; j < comment.length; j++) {
          const ch = comment.charAt(j);
          if (ch !== '*' && ch !== ' ') break;
        }
        if (j < comment.length && !reAnyAnnotation.test(comment)) {
          if (inDescription) {
            cModel.setDescription(cModel.getDescription() + ' ' + comment.substring(j));
          }
        }
        continue;
      }
    }
  }
}
