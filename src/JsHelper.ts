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
    let sanitizedType;
    // First we check if we are dealing with a list
    if (this.isListProperty(propertyType)) {
      // If we are then we first extract the type from the list
      sanitizedType = this.extractTypeFromList(propertyType);
      // then sanitize it
      sanitizedType = this.sanitizeApexPropertyToJavascript(sanitizedType);
      // and then we add brackets ([])
      sanitizedType = sanitizedType + '[]';
    } else {
      sanitizedType = this.sanitizeApexPropertyToJavascript(propertyType);
    }

    this.contents += ` * @property {${sanitizedType}} ${propertyName} ${docDescription}`;
    this.addBlankLine();
  }

  sanitizeApexPropertyToJavascript(propertyType: string) {
    const lowerPropertyType = propertyType.toLowerCase();
    if (lowerPropertyType === 'decimal' || lowerPropertyType === 'integer' || lowerPropertyType === 'double') {
      return 'number';
    }

    if (lowerPropertyType === 'boolean' || lowerPropertyType === 'string') {
      // If it is a built-in type then we return the lower-cased version.
      return lowerPropertyType;
    }

    // Otherwise we respect casing
    return propertyType;
  }

  isListProperty(propertyType: string) {
    const lowerPropertyType = propertyType.toLowerCase();
    if (lowerPropertyType.includes('<') && lowerPropertyType.includes('list')) {
      return true;
    }
  }

  extractTypeFromList(propertyType: string) {
    const propertyWithoutList = this.replaceAll(propertyType, 'list', '');
    return propertyWithoutList.replace('list', '')
      .replace('<', '')
      .replace('>', '');
  }

  // Case insensitive replace
  replaceAll(sourceString: string, strReplace: string, strWith: string) {
    // See http://stackoverflow.com/a/3561711/556609
    const esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const reg = new RegExp(esc, 'ig');
    return sourceString.replace(reg, strWith);
  }
}
