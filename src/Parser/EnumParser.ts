import EnumModel from '../model/EnumModel';

export default class EnumParser {
  getEnum(strLine: string, lstComments: string[], iLine: number) {
    const enumModel = new EnumModel();
    this.fillEnumModel(enumModel, strLine, lstComments, iLine);

    return enumModel;
  }

  fillEnumModel(enumModel: EnumModel, nameLine: string, lstComments: string[], iLine: number) {
    enumModel.setNameLine(nameLine, iLine);

    let inDescription = false;
    let i = 0;
    for (let comment of lstComments) {
      i++;
      comment = comment.trim();

      const idxStart = comment.toLowerCase().indexOf('@description');
      if (idxStart !== -1 || i === 1) {
        if (idxStart !== -1 && comment.length >= idxStart + 12)
          enumModel.setDescription(comment.substring(idxStart + 12).trim());
        else {
          const found = comment.match('\\s');
          if (found && found.index) {
            enumModel.setDescription(comment.substring(found.index).trim());
          }
        }
        inDescription = true;
        continue;
      }

      // handle multiple lines for @description.
      if (inDescription) {
        let j;
        for (j = 0; j < comment.length; j++) {
          const ch = comment.charAt(j);
          if (ch !== '*' && ch !== ' ') break;
        }
        if (j < comment.length) {
          enumModel.setDescription(enumModel.getDescription() + ' ' + comment.substring(j));
        }
      }
    }
  }
}
