import MethodModel from '../model/MethodModel';

export default class MethodParser {
  getMethod(parentClassName: string, strLine: string, lstComments: string[], iLine: number) {
    const mModel = new MethodModel();
    this.fillMethodModel(parentClassName, mModel, strLine, lstComments, iLine);

    return mModel;
  }

  fillMethodModel(parentClassName: string, mModel: MethodModel, name: string, lstComments: string[], iLine: number) {
    mModel.setNameLine(name, iLine);
    const isConstructor = parentClassName === mModel.getMethodName();
    mModel.setIsConstructor(isConstructor);

    let inDescription = false;
    let inExample = false;
    let i = 0;
    for (let comment of lstComments) {
      i++;
      comment = comment.trim();

      let idxStart = comment.toLowerCase().indexOf('@author');
      if (idxStart !== -1) {
        mModel.setAuthor(comment.substring(idxStart + 8).trim());
        inDescription = false;
        inExample = false;
        continue;
      }

      idxStart = comment.toLowerCase().indexOf('@date');
      if (idxStart !== -1) {
        mModel.setDate(comment.substring(idxStart + 5).trim());
        inDescription = false;
        inExample = false;
        continue;
      }

      idxStart = comment.toLowerCase().indexOf('@return');
      if (idxStart !== -1) {
        mModel.setReturns(comment.substring(idxStart + 7).trim());
        inDescription = false;
        inExample = false;
        continue;
      }

      idxStart = comment.toLowerCase().indexOf('@param');
      if (idxStart !== -1) {
        mModel.getParams().push(comment.substring(idxStart + 6).trim());
        inDescription = false;
        inExample = false;
        continue;
      }

      idxStart = comment.toLowerCase().indexOf('@description');
      if (idxStart !== -1 || i === 1) {
        if (idxStart !== -1 && comment.length >= idxStart + 12)
          mModel.setDescription(comment.substring(idxStart + 12).trim());
        else {
          const found = comment.match('\\s');
          if (found && found.index) {
            mModel.setDescription(comment.substring(found.index).trim());
          }
        }
        inDescription = true;
        inExample = false;
        continue;
      }

      idxStart = comment.toLowerCase().indexOf('@example');
      if (idxStart !== -1 || i === 1) {
        if (idxStart !== -1 && comment.length >= idxStart + 8) {
          mModel.setExample(comment.substring(idxStart + 8).trim());
        } else {
          const found = comment.match('\\s');
          if (found && found.index) {
            mModel.setExample(comment.substring(found.index).trim());
          }
        }
        inDescription = false;
        inExample = true;
        continue;
      }

      // handle multiple lines for @description and @example.
      if (inDescription || inExample) {
        let j;
        for (j = 0; j < comment.length; j++) {
          const ch = comment.charAt(j);
          if (ch !== '*' && ch !== ' ') break;
        }
        if (j < comment.length) {
          if (inDescription) {
            mModel.setDescription(mModel.getDescription() + ' ' + comment.substring(j));
          } else if (inExample) {
            // Lets's not include the tag
            if (j === 0 && comment.substring(2, 10) === '* @example') {
              comment = comment.substring(10);
            }

            mModel.setExample(
              mModel.getExample() + (mModel.getExample().trim().length === 0 ? '' : '\n') + comment.substring(2),
            );
          }
        }
        continue;
      }
    }
  }
}
