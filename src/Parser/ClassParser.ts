// tslint:disable-next-line:no-var-requires
const sanitize = req
uire('sanitize-filename');
import ClassModel from '../model/ClassModel';

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
    let inDescription = false;
    let i = 0;
    for (let comment of lstComments) {
      i++;
      comment = comment.trim();

      let idxStart = comment.toLowerCase().indexOf('@author');
      if (idxStart !== -1) {
        cModel.setAuthor(comment.substring(idxStart + 7).trim());
        inDescription = false;
        continue;
      }

      idxStart = comment.toLowerCase().indexOf('@date');
      if (idxStart !== -1) {
        cModel.setDate(comment.substring(idxStart + 5).trim());
        inDescription = false;
        continue;
      }

      idxStart = comment.toLowerCase().indexOf('@see');
      if (idxStart !== -1) {
        cModel.addSee(comment.substring(idxStart + 4).trim());
        inDescription = false;
        continue;
      }

      idxStart = comment.toLowerCase().indexOf('@group '); // needed to include space to not match group-content.
      if (idxStart !== -1) {
        const group = sanitize(comment.substring(idxStart + 6).trim());
        if (group) {
          cModel.setClassGroup(group);
        }

        inDescription = false;
        continue;
      }

      idxStart = comment.toLowerCase().indexOf('@group-content');
      if (idxStart !== -1) {
        cModel.setClassGroupContent(comment.substring(idxStart + 14).trim());
        inDescription = false;
        continue;
      }

      idxStart = comment.toLowerCase().indexOf('@description');
      if (idxStart !== -1 || i === 1) {
        if (idxStart !== -1 && comment.length > idxStart + 13)
          cModel.setDescription(comment.substring(idxStart + 12).trim());
        else {
          const found = comment.match('\\s');
          if (found && found.index) {
            cModel.setDescription(comment.substring(found.index).trim());
          }
        }
        inDescription = true;
        continue;
      }

      // handle multiple lines for description.
      if (inDescription) {
        let j;
        for (j = 0; j < comment.length; j++) {
          const ch = comment.charAt(j);
          if (ch !== '*' && ch !== ' ') break;
        }
        if (j < comment.length) {
          cModel.setDescription(cModel.getDescription() + ' ' + comment.substring(j));
        }
        continue;
      }
    }
  }
}
