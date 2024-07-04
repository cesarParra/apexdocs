'use strict';

var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
class Manifest {
  /**
   * Constructs a new Manifest object.
   * @param types List of types to be wrapped by this object.
   * @param isForInnerTypes Whether this manifest represent an inner type or not.
   */
  constructor(types, isForInnerTypes = false) {
    this.types = types;
    this.isForInnerTypes = isForInnerTypes;
  }
  filteredByAccessModifierAndAnnotations(modifiers) {
    const filteredTypes = this.filterAccessibleModifier(this.types, modifiers);
    const typesToReturn = [];
    for (const filteredType of filteredTypes) {
      const currentType = filteredType;
      if (currentType.type_name !== "class") {
        typesToReturn.push(currentType);
        continue;
      }
      const currentClass = currentType;
      let filteredClass = __spreadProps(__spreadValues({}, currentType), {
        methods: this.filterAccessibleModifier(currentClass.methods, modifiers),
        properties: this.filterAccessibleModifier(currentClass.properties, modifiers),
        fields: this.filterAccessibleModifier(currentClass.fields, modifiers),
        constructors: this.filterAccessibleModifier(currentClass.constructors, modifiers)
      });
      if (!this.isForInnerTypes) {
        filteredClass = __spreadProps(__spreadValues({}, filteredClass), {
          enums: this.filterAccessibleModifier(currentClass.enums, modifiers),
          interfaces: this.filterAccessibleModifier(currentClass.interfaces, modifiers),
          classes: new Manifest(currentClass.classes, true).filteredByAccessModifierAndAnnotations(
            modifiers
          )
        });
      }
      typesToReturn.push(filteredClass);
    }
    return typesToReturn;
  }
  filterAccessibleModifier(accessAndDocAware, modifiers) {
    return accessAndDocAware.filter((currentType) => {
      var _a;
      const hasIgnoreDocAnnotation = (_a = currentType.docComment) == null ? void 0 : _a.annotations.some(
        (annotation) => annotation.name === "ignore"
      );
      if (hasIgnoreDocAnnotation) {
        return false;
      }
      return modifiers.includes(currentType.access_modifier) || currentType.annotations.some((annotation) => modifiers.includes(annotation.type.toLowerCase()));
    });
  }
}

function createManifest(typeParser, reflect) {
  return new Manifest(typeParser.parse(reflect));
}

exports.createManifest = createManifest;
