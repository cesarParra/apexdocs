export default class JsHelper {
  contents: string = '';

  addBlankLine() {
    this.contents += '\n';
  }

  initializeBlock() {
    this.contents += '/**';
    this.addBlankLine();
  }

  finalizeBlock() {
    this.contents += ' */';
    this.addBlankLine();
  }

  declareType(className: string, docDescription: string) {
    this.contents += ` * @typeDef {Object} ${className} ${docDescription}`;
    this.addBlankLine();
  }

  declareProperty(propertyType: string, propertyName: string, docDescription: string) {
    const sanitizedType = this.sanitizeApexPropertyToJavascript(propertyType);
    this.contents += ` * @property {${sanitizedType}} ${propertyName} ${docDescription}`;
    this.addBlankLine();
  }

  sanitizeApexPropertyToJavascript(propertyType: string) {
    const lowerPropertyType = propertyType.toLowerCase();
    if (lowerPropertyType === 'decimal' || lowerPropertyType === 'integer' || lowerPropertyType === 'double') {
      return 'number';
    }
    return lowerPropertyType;
  }
}
