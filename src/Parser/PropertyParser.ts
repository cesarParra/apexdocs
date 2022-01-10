import PropertyModel from '../Model/PropertyModel';

export default class PropertyParser {
  getProperty(strLine: string, lstComments: string[], iLine: number) {
    const propertyModel = new PropertyModel();
    this.fillPropertyModel(propertyModel, strLine, lstComments, iLine);

    return propertyModel;
  }

  fillPropertyModel(propertyModel: PropertyModel, name: string, lstComments: string[], iLine: number) {
    propertyModel.setNameLine(name, iLine);
    let inDescription = false;
    let i = 0;
    for (let comment of lstComments) {
      i++;
      comment = comment.trim();
      const idxStart = comment.toLowerCase().indexOf('@description');
      if (idxStart !== -1 || i === 1) {
        if (idxStart !== -1 && comment.length > idxStart + 13)
          propertyModel.setDescription(comment.substring(idxStart + 13).trim());
        else {
          const found = comment.match('\\s');
          if (found && found.index) {
            propertyModel.setDescription(comment.substring(found.index).trim());
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
          propertyModel.setDescription(propertyModel.getDescription() + ' ' + comment.substring(j));
        }
        continue;
      }
    }
  }
}
