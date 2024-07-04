#!/usr/bin/env node
'use strict';

var yargs = require('yargs');
var fs = require('fs');
var path = require('path');
var apexReflection = require('@cparra/apex-reflection');
var chalk = require('chalk');
var logUpdate = require('log-update');
var index = require('../index.js');
var fastXmlParser = require('fast-xml-parser');
require('fp-ts/Either');
require('fp-ts/Option');
var _function = require('fp-ts/function');
var Handlebars = require('handlebars');
var module$1 = require('module');
var yaml = require('js-yaml');
var cosmiconfig = require('cosmiconfig');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var yargs__namespace = /*#__PURE__*/_interopNamespaceDefault(yargs);
var fs__namespace = /*#__PURE__*/_interopNamespaceDefault(fs);
var path__namespace = /*#__PURE__*/_interopNamespaceDefault(path);
var yaml__namespace = /*#__PURE__*/_interopNamespaceDefault(yaml);

class Settings {
  constructor(config) {
    this.config = config;
  }
  static build(config) {
    Settings.instance = new Settings(config);
  }
  static getInstance() {
    if (!Settings.instance) {
      throw new Error("Settings has not been initialized");
    }
    return Settings.instance;
  }
  get sourceDirectory() {
    return this.config.sourceDirectory;
  }
  get recursive() {
    return this.config.recursive;
  }
  get scope() {
    return this.config.scope;
  }
  get outputDir() {
    return this.config.outputDir;
  }
  get targetGenerator() {
    return this.config.targetGenerator;
  }
  get indexOnly() {
    return this.config.indexOnly;
  }
  get sanitizeHtml() {
    return this.config.sanitizeHtml;
  }
  getDefaultGroupName() {
    return this.config.defaultGroupName;
  }
  getOpenApiTitle() {
    var _a;
    return (_a = this.config.openApiTitle) != null ? _a : this.config.title;
  }
  getTitle() {
    return this.config.title;
  }
  getNamespace() {
    return this.config.namespace;
  }
  getNamespacePrefix() {
    if (!this.config.namespace) {
      return "";
    }
    return `${this.config.namespace}.`;
  }
  openApiFileName() {
    return this.config.openApiFileName;
  }
  includeMetadata() {
    return this.config.includeMetadata;
  }
  sortMembersAlphabetically() {
    var _a;
    return (_a = this.config.sortMembersAlphabetically) != null ? _a : false;
  }
  getRootDir() {
    return this.config.rootDir;
  }
  onAfterProcess(files) {
    if (this.config.onAfterProcess) {
      this.config.onAfterProcess(files);
    }
  }
  onBeforeFileWrite(file) {
    if (this.config.onBeforeFileWrite) {
      return this.config.onBeforeFileWrite(file);
    }
    return file;
  }
  frontMatterHeader(file) {
    if (this.config.frontMatterHeader) {
      return this.config.frontMatterHeader(file);
    }
    return [];
  }
}

class ApexBundle {
  constructor(filePath, rawTypeContent, rawMetadataContent) {
    this.filePath = filePath;
    this.rawTypeContent = rawTypeContent;
    this.rawMetadataContent = rawMetadataContent;
  }
}

const APEX_FILE_EXTENSION = ".cls";
class ApexFileReader {
  /**
   * Reads from .cls files and returns their raw body.
   */
  static processFiles(fileSystem, rootPath = this.sourceDirectory) {
    let bundles = [];
    const directoryContents = fileSystem.readDirectory(rootPath);
    directoryContents.forEach((currentFilePath) => {
      const currentPath = fileSystem.joinPath(rootPath, currentFilePath);
      if (this.readRecursively && fileSystem.isDirectory(currentPath)) {
        bundles = bundles.concat(this.processFiles(fileSystem, currentPath));
      }
      if (!this.isApexFile(currentFilePath)) {
        return;
      }
      const rawApexFile = fileSystem.readFile(currentPath);
      const metadataPath = fileSystem.joinPath(rootPath, `${currentFilePath}-meta.xml`);
      let rawMetadataFile = null;
      if (Settings.getInstance().includeMetadata()) {
        rawMetadataFile = fileSystem.exists(metadataPath) ? fileSystem.readFile(metadataPath) : null;
      }
      bundles.push(new ApexBundle(currentFilePath, rawApexFile, rawMetadataFile));
    });
    return bundles;
  }
  static isApexFile(currentFile) {
    return currentFile.endsWith(APEX_FILE_EXTENSION);
  }
  static get sourceDirectory() {
    return Settings.getInstance().sourceDirectory;
  }
  static get readRecursively() {
    return Settings.getInstance().recursive;
  }
}

class DefaultFileSystem {
  isDirectory(pathToRead) {
    return fs__namespace.statSync(pathToRead).isDirectory();
  }
  readDirectory(sourceDirectory) {
    return fs__namespace.readdirSync(sourceDirectory);
  }
  readFile(pathToRead) {
    const rawFile = fs__namespace.readFileSync(pathToRead);
    return rawFile.toString();
  }
  joinPath(...paths) {
    return path__namespace.join(...paths);
  }
  exists(path2) {
    return fs__namespace.existsSync(path2);
  }
}

class Logger {
  /**
   * Logs a message with optional arguments.
   * @param message The message to log.
   * @param args Optional arguments.
   */
  static log(message, ...args) {
    this.logSingle(message);
    args.forEach((arg) => {
      this.logSingle(arg);
    });
  }
  /**
   * Logs an error message with optional arguments.
   * @param message The error message to log.
   * @param args Optional arguments.
   */
  static error(message, ...args) {
    this.logSingle(message, false, "red", false);
    args.forEach(() => {
      this.logSingle(message, false, "red", false);
    });
  }
  static logSingle(text, showSpinner = true, color = "green", overrideConsole = true) {
    if (this.currentFrame > 9) {
      this.currentFrame = 0;
    }
    const spinner = showSpinner ? `${this.frames[this.currentFrame++]}` : "";
    let logMessage;
    if (color === "green") {
      logMessage = `${chalk.green((/* @__PURE__ */ new Date()).toLocaleString() + ": ")}${text}
`;
    } else {
      logMessage = `${chalk.red((/* @__PURE__ */ new Date()).toLocaleString() + ": ")}${text}
`;
    }
    if (overrideConsole) {
      logUpdate(`${spinner} ${logMessage}`);
    } else {
      process.stdout.write(`${spinner} ${logMessage}`);
    }
  }
  static clear() {
    logUpdate.clear();
  }
}
Logger.currentFrame = -1;
Logger.frames = ["\u280B", "\u2819", "\u2839", "\u2838", "\u283C", "\u2834", "\u2826", "\u2827", "\u2807", "\u280F"];

class MetadataProcessor {
  static process(input) {
    var _a;
    const map = /* @__PURE__ */ new Map();
    const xml = new fastXmlParser.XMLParser().parse(input);
    map.set("apiVersion", (_a = xml.ApexClass.apiVersion) != null ? _a : "");
    if (xml.ApexClass.status) {
      map.set("status", xml.ApexClass.status);
    }
    return map;
  }
}

var __defProp$7 = Object.defineProperty;
var __defProps$6 = Object.defineProperties;
var __getOwnPropDescs$6 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$7 = Object.getOwnPropertySymbols;
var __hasOwnProp$7 = Object.prototype.hasOwnProperty;
var __propIsEnum$7 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$7 = (obj, key, value) => key in obj ? __defProp$7(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$7 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$7.call(b, prop))
      __defNormalProp$7(a, prop, b[prop]);
  if (__getOwnPropSymbols$7)
    for (var prop of __getOwnPropSymbols$7(b)) {
      if (__propIsEnum$7.call(b, prop))
        __defNormalProp$7(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$6 = (a, b) => __defProps$6(a, __getOwnPropDescs$6(b));
class RawBodyParser {
  constructor(typeBundles) {
    this.typeBundles = typeBundles;
  }
  parse(reflect) {
    const types = this.typeBundles.map((currentBundle) => {
      Logger.log(`Parsing file: ${currentBundle.filePath}`);
      const result = reflect(currentBundle);
      if (!!result.typeMirror && !!currentBundle.rawMetadataContent) {
        const metadataParams = MetadataProcessor.process(currentBundle.rawMetadataContent);
        metadataParams.forEach((value, key) => {
          var _a;
          const declaration = `${key}: ${value}`;
          (_a = result.typeMirror) == null ? void 0 : _a.annotations.push({
            rawDeclaration: declaration,
            name: declaration,
            type: declaration
          });
        });
      }
      return result;
    }).filter((reflectionResult) => {
      return reflectionResult.typeMirror;
    }).map((reflectionResult) => reflectionResult.typeMirror);
    return this.addFieldsFromParent(types);
  }
  addFieldsFromParent(types) {
    const typesWithFields = [];
    for (const currentType of types) {
      if (currentType.type_name !== "class" && currentType.type_name !== "interface") {
        typesWithFields.push(currentType);
        continue;
      }
      if (currentType.type_name === "class") {
        let typeAsClass = currentType;
        if (!typeAsClass.extended_class) {
          typesWithFields.push(currentType);
          continue;
        }
        typeAsClass = this.addMembersFromParent(typeAsClass, types);
        typesWithFields.push(typeAsClass);
        continue;
      }
      let typeAsInterface = currentType;
      if (!typeAsInterface.extended_interfaces.length) {
        typesWithFields.push(currentType);
        continue;
      }
      typeAsInterface = this.addMethodsFromParent(typeAsInterface, types);
      typesWithFields.push(typeAsInterface);
    }
    return typesWithFields;
  }
  addMembersFromParent(currentClass, allTypes) {
    if (!currentClass.extended_class) {
      return currentClass;
    }
    const parent = allTypes.find((currentType) => currentType.name === currentClass.extended_class);
    if (!parent || parent.type_name !== "class") {
      return currentClass;
    }
    let parentAsClass = parent;
    if (parentAsClass.extended_class) {
      parentAsClass = this.addMembersFromParent(parentAsClass, allTypes);
    }
    currentClass.fields = [...currentClass.fields, ...this.getInheritedFields(parentAsClass, currentClass)];
    currentClass.properties = [...currentClass.properties, ...this.getInheritedProperties(parentAsClass, currentClass)];
    currentClass.methods = [...currentClass.methods, ...this.getInheritedMethods(parentAsClass, currentClass)];
    return currentClass;
  }
  addMethodsFromParent(currentInterface, allTypes) {
    if (!currentInterface.extended_interfaces.length) {
      return currentInterface;
    }
    const parents = [];
    for (const currentInterfaceName of currentInterface.extended_interfaces) {
      const parent = allTypes.find((currentType) => currentType.name === currentInterfaceName);
      if (parent) {
        parents.push(parent);
      }
    }
    for (const parent of parents) {
      let parentAsInterface = parent;
      if (parentAsInterface.extended_interfaces.length) {
        parentAsInterface = this.addMethodsFromParent(parentAsInterface, allTypes);
      }
      currentInterface.methods = [
        ...currentInterface.methods,
        ...this.getInheritedMethods(parentAsInterface, currentInterface)
      ];
    }
    return currentInterface;
  }
  getInheritedFields(parentAsClass, currentClass) {
    return parentAsClass.fields.filter((currentField) => currentField.access_modifier.toLowerCase() !== "private").filter((currentField) => !this.memberExists(currentClass.fields, currentField.name)).map((currentField) => __spreadProps$6(__spreadValues$7({}, currentField), {
      inherited: true
    }));
  }
  getInheritedProperties(parentAsClass, currentClass) {
    return parentAsClass.properties.filter((currentProperty) => currentProperty.access_modifier.toLowerCase() !== "private").filter((currentProperty) => !this.memberExists(currentClass.properties, currentProperty.name)).map((currentProperty) => __spreadProps$6(__spreadValues$7({}, currentProperty), {
      inherited: true
    }));
  }
  getInheritedMethods(parentAsClass, currentClass) {
    return parentAsClass.methods.filter((currentMethod) => currentMethod.access_modifier.toLowerCase() !== "private").filter((currentMethod) => !this.memberExists(currentClass.methods, currentMethod.name)).map((currentMethod) => __spreadProps$6(__spreadValues$7({}, currentMethod), {
      inherited: true
    }));
  }
  memberExists(members, fieldName) {
    const fieldNames = members.map((currentMember) => currentMember.name);
    return fieldNames.includes(fieldName);
  }
}

class State {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {
  }
  static getInstance() {
    if (!State.instance) {
      State.instance = new State();
    }
    return State.instance;
  }
  setTypeBeingProcessed(typeToSet) {
    this.typeBeingProcessed = typeToSet;
  }
  getTypeBeingProcessed() {
    return this.typeBeingProcessed;
  }
}

class Transpiler {
  static generate(types, processor) {
    var _a, _b;
    const sortedTypes = types.sort((apexTypeA, apexTypeB) => {
      if (apexTypeA.name < apexTypeB.name)
        return -1;
      if (apexTypeA.name > apexTypeB.name)
        return 1;
      return 0;
    });
    (_a = processor.onBeforeProcess) == null ? void 0 : _a.call(processor, sortedTypes);
    if (Settings.getInstance().indexOnly) {
      return;
    }
    sortedTypes.forEach((currentType) => {
      State.getInstance().setTypeBeingProcessed(currentType);
      processor.onProcess(currentType);
    });
    (_b = processor.onAfterProcess) == null ? void 0 : _b.call(processor, sortedTypes);
  }
}

class FileWriter {
  static write(files, onWriteCallback) {
    const onBeforeFileWrite = (file) => Settings.getInstance().onBeforeFileWrite(file);
    files.forEach((file) => {
      const resolvedFile = this.getTargetLocation(file, onBeforeFileWrite);
      const fullDir = path__namespace.join(resolvedFile.dir.baseDir, resolvedFile.dir.fileDir);
      if (!fs__namespace.existsSync(fullDir)) {
        fs__namespace.mkdirSync(fullDir, { recursive: true });
      }
      const filePath = path__namespace.join(fullDir, `${resolvedFile.name}${resolvedFile.extension}`);
      fs__namespace.writeFileSync(filePath, file.body, "utf8");
      onWriteCallback(resolvedFile);
    });
  }
  static getTargetLocation(file, onBeforeFileWrite) {
    const targetFile = {
      name: file.fileName,
      extension: file.fileExtension(),
      dir: {
        baseDir: Settings.getInstance().outputDir,
        fileDir: file.dir
      }
    };
    return onBeforeFileWrite(targetFile);
  }
}

class ErrorLogger {
  static logErrors(types) {
    types.forEach((currentType) => {
      this.logErrorsForSingleType(currentType);
    });
  }
  static logErrorsForSingleType(currentType) {
    this.logTypeErrors(currentType);
    if (currentType.type_name === "class") {
      this.logErrorsForClass(currentType);
    } else if (currentType.type_name === "interface") {
      this.logErrorsForInterface(currentType);
    }
  }
  static logTypeErrors(currentType, parentType) {
    var _a;
    if ((_a = currentType.docComment) == null ? void 0 : _a.error) {
      const typeName = parentType ? `${parentType.name}.${currentType.name}` : currentType.name;
      Logger.error(`${typeName} - Doc comment parsing error. Level: Type`);
      Logger.error(`Comment:
 ${currentType.docComment.rawDeclaration}`);
      Logger.error(currentType.docComment.error);
      Logger.error("=================================");
    }
  }
  static logErrorsForClass(classMirror, parentType) {
    const typeName = parentType ? `${parentType.name}.${classMirror.name}` : classMirror.name;
    classMirror.constructors.forEach((currentConstructor) => {
      var _a;
      if ((_a = currentConstructor.docComment) == null ? void 0 : _a.error) {
        Logger.error(`${typeName} - Doc comment parsing error. Level: Constructor`);
        Logger.error(`Comment:
 ${currentConstructor.docComment.rawDeclaration}`);
        Logger.error(currentConstructor.docComment.error);
        Logger.error("=================================");
      }
    });
    classMirror.fields.forEach((currentField) => {
      var _a;
      if ((_a = currentField.docComment) == null ? void 0 : _a.error) {
        Logger.error(`${typeName} - Doc comment parsing error. Level: Field`);
        Logger.error(`Comment:
 ${currentField.docComment.rawDeclaration}`);
        Logger.error(currentField.docComment.error);
        Logger.error("=================================");
      }
    });
    classMirror.properties.forEach((currentProperty) => {
      var _a;
      if ((_a = currentProperty.docComment) == null ? void 0 : _a.error) {
        Logger.error(`${typeName} - Doc comment parsing error. Level: Property`);
        Logger.error(`Comment:
 ${currentProperty.docComment.rawDeclaration}`);
        Logger.error(currentProperty.docComment.error);
        Logger.error("=================================");
      }
    });
    classMirror.methods.forEach((currentMethod) => {
      var _a;
      if ((_a = currentMethod.docComment) == null ? void 0 : _a.error) {
        Logger.error(`${typeName} - Doc comment parsing error. Level: Method`);
        Logger.error(`Comment:
 ${currentMethod.docComment.rawDeclaration}`);
        Logger.error(currentMethod.docComment.error);
        Logger.error("=================================");
      }
    });
    classMirror.enums.forEach((currentEnum) => {
      this.logErrorsForSingleType(currentEnum);
    });
    classMirror.interfaces.forEach((currentInterface) => {
      this.logErrorsForSingleType(currentInterface);
    });
    classMirror.classes.forEach((currentClass) => {
      this.logErrorsForSingleType(currentClass);
    });
  }
  static logErrorsForInterface(interfaceMirror) {
    interfaceMirror.methods.forEach((currentMethod) => {
      var _a;
      if ((_a = currentMethod.docComment) == null ? void 0 : _a.error) {
        Logger.error(`${interfaceMirror.name} - Doc comment parsing error. Level: Method`);
        Logger.error(`Comment: ${currentMethod.docComment.rawDeclaration}`);
        Logger.error(currentMethod.docComment.error);
        Logger.error("=================================");
      }
    });
  }
}

class TypesRepository {
  constructor() {
    this.scopedTypes = [];
    this.allTypes = [];
  }
  static getInstance() {
    if (!TypesRepository.instance) {
      TypesRepository.instance = new TypesRepository();
    }
    return TypesRepository.instance;
  }
  populateAll(types) {
    this.allTypes = types;
  }
  getFromAllByName(typeName) {
    if (typeName.includes(".")) {
      const [parentTypeName, childTypeName] = typeName.split(".");
      const parentReference = this.allTypes.find(
        (currentType) => currentType.name.toLowerCase() === parentTypeName.toLowerCase()
      );
      if (!parentReference || parentReference.type_name !== "class") {
        return void 0;
      }
      const parentReferenceAsClass = parentReference;
      const childTypes = [
        ...parentReferenceAsClass.classes,
        ...parentReferenceAsClass.interfaces,
        ...parentReferenceAsClass.enums
      ];
      const foundType2 = childTypes.find((currentType) => currentType.name.toLowerCase() === childTypeName);
      if (!foundType2) {
        return void 0;
      }
      return { type: foundType2, isChild: true, parentType: parentReference };
    }
    const foundType = this.allTypes.find(
      (currentType) => currentType.name.toLowerCase() === typeName.toLowerCase()
    );
    if (!foundType) {
      return void 0;
    }
    return { type: foundType, isChild: false };
  }
  populateScoped(types) {
    this.scopedTypes = types;
  }
  getFromScopedByName(typeName) {
    return this.scopedTypes.find((currentType) => currentType.name === typeName);
  }
}

class ProcessorTypeTranspiler {
  getLinkingStrategy() {
    return "root-relative";
  }
}

class FileContainer {
  constructor() {
    this._files = [];
  }
  files() {
    return this._files;
  }
  pushFile(file) {
    this._files.push(file);
  }
}

class ClassFileGeneratorHelper {
  static getSanitizedGroup(classModel) {
    return this.getClassGroup(classModel).replace(/ /g, "-").replace(".", "");
  }
  static getFileLink(classModel) {
    const [fullClassName, fileLink] = ClassFileGeneratorHelper.getFileLinkTuple(classModel);
    return `[${fullClassName}](${fileLink})`;
  }
  static getFileLinkTuple(classModel) {
    var _a;
    const documentationRoot = (_a = Settings.getInstance().getRootDir()) != null ? _a : "";
    const directoryRoot = `${documentationRoot}${this.getDirectoryRoot(classModel)}`;
    const fullClassName = `${Settings.getInstance().getNamespacePrefix()}${classModel.name}`;
    return [fullClassName, `${directoryRoot}${fullClassName}.md`];
  }
  static getFileLinkByTypeName(typeName) {
    const type = TypesRepository.getInstance().getFromScopedByName(typeName);
    if (!type) {
      return `[${typeName}](${typeName})`;
    }
    return this.getFileLink(type);
  }
  static getRenderableLinkByTypeName(typeName) {
    const type = TypesRepository.getInstance().getFromScopedByName(typeName);
    if (!type) {
      return typeName;
    }
    const [fullClassName, fileLink] = ClassFileGeneratorHelper.getFileLinkTuple(type);
    return {
      title: fullClassName,
      url: fileLink
    };
  }
  static getDirectoryRoot(classModel) {
    const generator = Settings.getInstance().targetGenerator;
    if (TypeTranspilerFactory.get(generator).getLinkingStrategy() === "root-relative") {
      return `/${this.getSanitizedGroup(classModel)}/`;
    }
    const typeBeingProcessed = State.getInstance().getTypeBeingProcessed();
    if (typeBeingProcessed) {
      if (this.getClassGroup(typeBeingProcessed) === this.getClassGroup(classModel)) {
        return "./";
      } else {
        return `../${this.getSanitizedGroup(classModel)}/`;
      }
    } else {
      return `./${this.getSanitizedGroup(classModel)}/`;
    }
  }
  static getClassGroup(classModel) {
    var _a, _b;
    const groupAnnotation = (_a = classModel.docComment) == null ? void 0 : _a.annotations.find(
      (annotation) => annotation.name.toLowerCase() === "group"
    );
    return (_b = groupAnnotation == null ? void 0 : groupAnnotation.body) != null ? _b : Settings.getInstance().getDefaultGroupName();
  }
}

class OutputFile {
  constructor(fileName, dir) {
    this.fileName = fileName;
    this.dir = dir;
    this._contents = "";
  }
  get body() {
    return this._contents;
  }
  addText(text) {
    this._contents += text;
    this.addBlankLine();
  }
  addBlankLine() {
    this._contents += "\n";
  }
}

class MarkdownFile extends OutputFile {
  fileExtension() {
    return ".md";
  }
  addTitle(text, level = 1) {
    let title = "";
    for (let i = 0; i < level; i++) {
      title += "#";
    }
    title += " ";
    title += text;
    this._contents += title;
    this.addBlankLine();
  }
  addText(text) {
    super.addText(text);
  }
  addLink(text) {
    this.addText(`{@link ${text}}`);
  }
  startCodeBlock(language = "apex") {
    this.addText(`\`\`\`${language}`);
  }
  endCodeBlock() {
    this.addText("```");
    this.addBlankLine();
  }
  addHorizontalRule() {
    this._contents += "---";
    this.addBlankLine();
  }
  initializeTable(...headers) {
    this.addBlankLine();
    this._contents += "|";
    headers.forEach((header) => {
      this._contents += header + "|";
    });
    this.addBlankLine();
    this._contents += "|";
    headers.forEach(() => {
      this._contents += "---|";
    });
    this.addBlankLine();
  }
  addTableRow(...columns) {
    this._contents += "|";
    columns.forEach((column) => {
      this._contents += this._replaceInlineReferences(column) + "|";
    });
    this.addBlankLine();
  }
  addListItem(text) {
    this._contents += `* ${text}`;
  }
  static replaceInlineLinks(text) {
    const possibleLinks = text.match(/<<.*?>>/g);
    possibleLinks == null ? void 0 : possibleLinks.forEach((currentMatch) => {
      const classNameForMatch = currentMatch.replace("<<", "").replace(">>", "");
      text = text.replace(currentMatch, ClassFileGeneratorHelper.getFileLinkByTypeName(classNameForMatch));
    });
    const linkFormatRegEx = "{@link (.*?)}";
    const expression = new RegExp(linkFormatRegEx, "gi");
    let match;
    const matches = [];
    do {
      match = expression.exec(text);
      if (match) {
        matches.push(match);
      }
    } while (match);
    for (const currentMatch of matches) {
      text = text.replace(currentMatch[0], ClassFileGeneratorHelper.getFileLinkByTypeName(currentMatch[1]));
    }
    return text;
  }
  static replaceInlineEmails(text) {
    const linkFormatRegEx = "{@email (.*?)}";
    const expression = new RegExp(linkFormatRegEx, "gi");
    let match;
    const matches = [];
    do {
      match = expression.exec(text);
      if (match) {
        matches.push(match);
      }
    } while (match);
    for (const currentMatch of matches) {
      text = text.replace(currentMatch[0], `[${currentMatch[1]}](mailto:${currentMatch[1]})`);
    }
    return text;
  }
  _replaceInlineReferences(text) {
    text = MarkdownFile.replaceInlineLinks(text);
    text = MarkdownFile.replaceInlineEmails(text);
    return text;
  }
}

function truncate(str, n) {
  return str.length > n ? str.substr(0, n - 1) + "&hellip;" : str;
}
const camel2title = (camelCase) => camelCase.replace(/\//g, " ").replace(/([A-Z])/g, (match) => ` ${match}`).replace(/\b\w/g, (match) => match.toUpperCase()).replace(/^./, (match) => match.toUpperCase()).trim();

class MarkdownHomeFile extends MarkdownFile {
  constructor(fileName, types, headerContent) {
    super(fileName, "");
    this.fileName = fileName;
    this.types = types;
    if (headerContent) {
      this.addText(headerContent);
    }
    this.addTitle(Settings.getInstance().getTitle());
    this.addTypeEntries(types);
  }
  addTypeEntries(types) {
    const groupedClasses = this.group(types);
    groupedClasses.forEach((value, key) => {
      this.addTitle(key, 2);
      value.forEach((typeMirror) => {
        this.addTypeEntry(typeMirror);
      });
    });
  }
  addTypeEntry(typeMirror) {
    var _a;
    this.addBlankLine();
    this.addTitle(ClassFileGeneratorHelper.getFileLink(typeMirror), 3);
    this.addBlankLine();
    if ((_a = typeMirror.docComment) == null ? void 0 : _a.descriptionLines) {
      const description = typeMirror.docComment.descriptionLines.reduce(
        (previous, current) => previous + current + "\n",
        ""
      );
      this.addText(truncate(description, 300));
      this.addBlankLine();
    }
  }
  group(classes) {
    return classes.reduce((groups, currentClass) => {
      const key = this.getClassGroup(currentClass);
      const group = groups.get(key) || [];
      group.push(currentClass);
      groups.set(key, group);
      return groups;
    }, /* @__PURE__ */ new Map());
  }
  getClassGroup(classModel) {
    var _a, _b, _c;
    return (_c = (_b = (_a = classModel.docComment) == null ? void 0 : _a.annotations.find((annotation) => annotation.name === "group")) == null ? void 0 : _b.body) != null ? _c : Settings.getInstance().getDefaultGroupName();
  }
}

class Walker {
  constructor(type) {
    this.type = type;
  }
  sortType(types) {
    if (Settings.getInstance().sortMembersAlphabetically()) {
      return types.sort((a, b) => a.name.localeCompare(b.name));
    }
    return types;
  }
}

class ClassWalker extends Walker {
  walk(listener) {
    listener.onTypeDeclaration(this.type);
    const classMirror = this.type;
    if (classMirror.constructors.length) {
      listener.onConstructorDeclaration(this.type.name, classMirror.constructors);
    }
    if (classMirror.fields.length) {
      listener.onFieldsDeclaration(this.sortType(classMirror.fields));
    }
    if (classMirror.properties.length) {
      listener.onPropertiesDeclaration(this.sortType(classMirror.properties));
    }
    if (classMirror.methods.length) {
      listener.onMethodsDeclaration(this.sortType(classMirror.methods));
    }
    if (classMirror.enums.length) {
      listener.onInnerEnumsDeclaration(this.sortType(classMirror.enums));
    }
    if (classMirror.classes.length) {
      listener.onInnerClassesDeclaration(this.sortType(classMirror.classes));
    }
    if (classMirror.interfaces.length) {
      listener.onInnerInterfacesDeclaration(this.sortType(classMirror.interfaces));
    }
  }
}

class EnumWalker extends Walker {
  walk(listener) {
    listener.onTypeDeclaration(this.type);
  }
}

class InterfaceWalker extends Walker {
  walk(listener) {
    listener.onTypeDeclaration(this.type);
    const interfaceMirror = this.type;
    if (interfaceMirror.methods.length) {
      listener.onMethodsDeclaration(this.sortType(interfaceMirror.methods));
    }
  }
}

class WalkerFactory {
  static get(type) {
    switch (type.type_name) {
      case "class":
        return new ClassWalker(type);
      case "enum":
        return new EnumWalker(type);
      case "interface":
        return new InterfaceWalker(type);
    }
    throw Error("Walker not found for type.");
  }
}

function addMermaid(markdownFile, docCommentAware) {
  var _a;
  const mermaid = (_a = docCommentAware.docComment) == null ? void 0 : _a.annotations.find((annotation) => annotation.name === "mermaid");
  if (!mermaid) {
    return;
  }
  markdownFile.addBlankLine();
  markdownFile.startCodeBlock("mermaid");
  mermaid.bodyLines.forEach((line) => {
    markdownFile.addText(line);
  });
  markdownFile.endCodeBlock();
  markdownFile.addBlankLine();
}
function addCustomDocCommentAnnotations(markdownFile, docCommentAware) {
  var _a;
  (_a = docCommentAware.docComment) == null ? void 0 : _a.annotations.filter((currentAnnotation) => currentAnnotation.name !== "description").filter((currentAnnotation) => currentAnnotation.name !== "mermaid").forEach((currentAnnotation) => {
    markdownFile.addBlankLine();
    markdownFile.addText(buildDocAnnotationText(currentAnnotation));
    markdownFile.addBlankLine();
  });
  function splitAndCapitalize(text) {
    const words = text.split(/[-_]+/);
    const capitalizedWords = [];
    for (const word of words) {
      capitalizedWords.push(word.charAt(0).toUpperCase() + word.slice(1));
    }
    return capitalizedWords.join(" ");
  }
  function buildDocAnnotationText(annotation) {
    let annotationBodyText = annotation.body;
    if (annotation.name.toLowerCase() === "see") {
      annotationBodyText = ClassFileGeneratorHelper.getFileLinkByTypeName(annotation.body);
    }
    return `**${splitAndCapitalize(annotation.name)}** ${annotationBodyText}`;
  }
}

function declareType(markdownFile, typeMirror) {
  var _a;
  typeMirror.annotations.forEach((currentAnnotation) => {
    markdownFile.addBlankLine();
    markdownFile.addText(`\`${currentAnnotation.type.toUpperCase()}\``);
  });
  if ((_a = typeMirror.docComment) == null ? void 0 : _a.descriptionLines) {
    markdownFile.addBlankLine();
    for (const currentLine of typeMirror.docComment.descriptionLines) {
      markdownFile.addText(currentLine);
    }
    markdownFile.addBlankLine();
  }
  if (typeMirror.type_name === "class") {
    addInheritanceSectionForClass(typeMirror, markdownFile);
  }
  if (typeMirror.type_name === "interface") {
    addInheritanceSectionForInterface(typeMirror, markdownFile);
  }
  addCustomDocCommentAnnotations(markdownFile, typeMirror);
  addMermaid(markdownFile, typeMirror);
}
function addInheritanceSectionForClass(typeMirror, markdownFile) {
  const typeAsClass = typeMirror;
  if (typeAsClass.extended_class) {
    markdownFile.addBlankLine();
    markdownFile.addText("**Inheritance**");
    markdownFile.addBlankLine();
    addParent(markdownFile, typeAsClass);
    markdownFile.addText(typeMirror.name);
    markdownFile.addBlankLine();
  }
  if (typeAsClass.implemented_interfaces.length) {
    markdownFile.addBlankLine();
    markdownFile.addText("**Implemented types**");
    markdownFile.addBlankLine();
    for (let i = 0; i < typeAsClass.implemented_interfaces.length; i++) {
      const currentName = typeAsClass.implemented_interfaces[i];
      markdownFile.addLink(currentName);
      if (i < typeAsClass.implemented_interfaces.length - 1) {
        markdownFile.addText(", ");
      }
    }
    markdownFile.addBlankLine();
  }
}
function addInheritanceSectionForInterface(typeMirror, markdownFile) {
  const typeAsInterface = typeMirror;
  if (typeAsInterface.extended_interfaces.length) {
    markdownFile.addBlankLine();
    markdownFile.addText("**Extended types**");
    markdownFile.addBlankLine();
    for (let i = 0; i < typeAsInterface.extended_interfaces.length; i++) {
      const currentName = typeAsInterface.extended_interfaces[i];
      markdownFile.addLink(currentName);
      if (i < typeAsInterface.extended_interfaces.length - 1) {
        markdownFile.addText(", ");
      }
    }
  }
}
function addParent(markdownFile, classMirror) {
  if (!classMirror.extended_class) {
    return;
  }
  const parentType = TypesRepository.getInstance().getFromScopedByName(classMirror.extended_class);
  if (!parentType) {
    return;
  }
  if (parentType.type_name === "class") {
    addParent(markdownFile, parentType);
  }
  markdownFile.addLink(parentType.name);
  markdownFile.addText(" > ");
}

function declareMethod(markdownFile, methods, startingHeadingLevel, className = "") {
  methods.forEach((currentMethod) => {
    var _a, _b;
    const signatureName = isMethod(currentMethod) ? `${currentMethod.typeReference.rawDeclaration} ${currentMethod.name}` : className;
    markdownFile.addTitle(
      `\`${buildSignature(currentMethod.access_modifier, signatureName, currentMethod)}\``,
      startingHeadingLevel + 2
    );
    if (isMethod(currentMethod)) {
      const asMethodMirror = currentMethod;
      if (asMethodMirror.inherited) {
        markdownFile.addBlankLine();
        markdownFile.addText("*Inherited*");
        markdownFile.addBlankLine();
      }
    }
    currentMethod.annotations.forEach((annotation) => {
      markdownFile.addBlankLine();
      markdownFile.addText(`\`${annotation.type.toUpperCase()}\``);
    });
    if ((_a = currentMethod.docComment) == null ? void 0 : _a.description) {
      markdownFile.addBlankLine();
      markdownFile.addText(currentMethod.docComment.description);
      markdownFile.addBlankLine();
    }
    if (currentMethod.parameters.length) {
      addParameters(markdownFile, currentMethod, startingHeadingLevel);
    }
    if (isMethod(currentMethod)) {
      addReturns(markdownFile, currentMethod, startingHeadingLevel);
    }
    addThrowsBlock(markdownFile, currentMethod, startingHeadingLevel);
    addCustomDocCommentAnnotations(markdownFile, currentMethod);
    addMermaid(markdownFile, currentMethod);
    if ((_b = currentMethod.docComment) == null ? void 0 : _b.exampleAnnotation) {
      addExample(markdownFile, currentMethod, startingHeadingLevel);
    }
  });
  markdownFile.addHorizontalRule();
}
function buildSignature(accessModifier, name, parameterAware) {
  let signature = `${name}(`;
  if (isMethod(parameterAware) && parameterAware.memberModifiers.length) {
    signature = accessModifier + " " + parameterAware.memberModifiers.join(" ") + " " + signature;
  } else {
    signature = accessModifier + " " + signature;
  }
  const signatureParameters = parameterAware.parameters.map(
    (param) => `${param.typeReference.rawDeclaration} ${param.name}`
  );
  signature += signatureParameters.join(", ");
  return `${signature})`;
}
function addParameters(markdownFile, methodModel, startingHeadingLevel) {
  var _a, _b;
  if (!((_a = methodModel.docComment) == null ? void 0 : _a.paramAnnotations.length)) {
    return;
  }
  markdownFile.addTitle("Parameters", startingHeadingLevel + 3);
  markdownFile.initializeTable("Param", "Description");
  (_b = methodModel.docComment) == null ? void 0 : _b.paramAnnotations.forEach((paramAnnotation) => {
    const paramName = paramAnnotation.paramName;
    const paramDescription = paramAnnotation.bodyLines.join(" ");
    markdownFile.addTableRow(`\`${paramName}\``, paramDescription);
  });
  markdownFile.addBlankLine();
}
function addReturns(markdownFile, methodModel, startingHeadingLevel) {
  var _a, _b;
  if (!((_a = methodModel.docComment) == null ? void 0 : _a.returnAnnotation)) {
    return;
  }
  markdownFile.addTitle("Returns", startingHeadingLevel + 3);
  markdownFile.initializeTable("Type", "Description");
  markdownFile.addTableRow(
    `\`${methodModel.typeReference.rawDeclaration}\``,
    (_b = methodModel.docComment) == null ? void 0 : _b.returnAnnotation.bodyLines.join(" ")
  );
  markdownFile.addBlankLine();
}
function addThrowsBlock(markdownFile, docCommentAware, startingHeadingLevel) {
  var _a, _b;
  if (!((_a = docCommentAware.docComment) == null ? void 0 : _a.throwsAnnotations.length)) {
    return;
  }
  markdownFile.addTitle("Throws", startingHeadingLevel + 3);
  markdownFile.initializeTable("Exception", "Description");
  (_b = docCommentAware.docComment) == null ? void 0 : _b.throwsAnnotations.forEach((annotation) => {
    const exceptionName = annotation.exceptionName;
    const exceptionDescription = annotation.bodyLines.join(" ");
    markdownFile.addTableRow(`\`${exceptionName}\``, exceptionDescription);
  });
  markdownFile.addBlankLine();
}
function addExample(markdownFile, docCommentAware, startingHeadingLevel) {
  var _a;
  markdownFile.addTitle("Example", startingHeadingLevel + 3);
  markdownFile.startCodeBlock();
  (_a = docCommentAware.docComment) == null ? void 0 : _a.exampleAnnotation.bodyLines.forEach((line) => {
    markdownFile.addText(line);
  });
  markdownFile.endCodeBlock();
  markdownFile.addBlankLine();
}
function isMethod(method) {
  return method.typeReference !== void 0;
}

function declareField(markdownFile, fields, startingHeadingLevel, grouped = false) {
  markdownFile.addBlankLine();
  fields.forEach((propertyModel) => {
    addFieldSection(markdownFile, propertyModel, startingHeadingLevel, grouped);
  });
  markdownFile.addHorizontalRule();
}
function addFieldSection(markdownFile, mirrorModel, startingHeadingLevel, grouped) {
  var _a, _b, _c;
  if (!grouped) {
    markdownFile.addTitle(
      `\`${mirrorModel.access_modifier} ${mirrorModel.name}\` \u2192 \`${mirrorModel.typeReference.rawDeclaration}\``,
      startingHeadingLevel + 2
    );
    markdownFile.addBlankLine();
    if (mirrorModel.inherited) {
      markdownFile.addText("*Inherited*");
    }
    mirrorModel.annotations.forEach((annotation) => {
      markdownFile.addText(`\`${annotation.type.toUpperCase()}\` `);
    });
    if ((_a = mirrorModel.docComment) == null ? void 0 : _a.description) {
      markdownFile.addBlankLine();
      markdownFile.addText(mirrorModel.docComment.description);
    }
    markdownFile.addBlankLine();
  } else {
    let annotations = "";
    const hasAnnotations = !!mirrorModel.annotations.length;
    if (hasAnnotations) {
      annotations += " [";
    }
    mirrorModel.annotations.forEach((annotation) => {
      annotations += `\`${annotation.type.toUpperCase()}\` `;
    });
    if (hasAnnotations) {
      annotations += "]";
    }
    let description = "";
    if ((_b = mirrorModel.docComment) == null ? void 0 : _b.description) {
      description = ` - ${(_c = mirrorModel.docComment) == null ? void 0 : _c.description}`;
    }
    let listItemText = `\`${mirrorModel.access_modifier} ${mirrorModel.name}\` \u2192 \`${mirrorModel.typeReference.rawDeclaration}\``;
    if (mirrorModel.inherited) {
      listItemText += "(*Inherited*)";
    }
    listItemText += `${annotations} ${description}`;
    markdownFile.addListItem(listItemText);
    markdownFile.addBlankLine();
  }
}

class MarkdownTypeFile extends MarkdownFile {
  constructor(type, headingLevel = 1, headerContent, isInner = false) {
    super(
      `${Settings.getInstance().getNamespacePrefix()}${type.name}`,
      ClassFileGeneratorHelper.getSanitizedGroup(type)
    );
    this.type = type;
    this.headingLevel = headingLevel;
    this.isInner = isInner;
    if (headerContent) {
      this.addText(headerContent);
    }
    const walker = WalkerFactory.get(type);
    walker.walk(this);
  }
  onTypeDeclaration(typeMirror) {
    let fullTypeName;
    if (this.isInner) {
      fullTypeName = typeMirror.name;
    } else {
      if (this.isClass(typeMirror) && typeMirror.classModifier) {
        fullTypeName = `${typeMirror.classModifier} ${Settings.getInstance().getNamespacePrefix()}${typeMirror.name}`;
      } else {
        fullTypeName = `${Settings.getInstance().getNamespacePrefix()}${typeMirror.name}`;
      }
    }
    this.addTitle(fullTypeName, this.headingLevel);
    declareType(this, typeMirror);
  }
  isClass(typeMirror) {
    return typeMirror.type_name === "class";
  }
  onConstructorDeclaration(className, constructors) {
    this.addTitle("Constructors", this.headingLevel + 1);
    this.declareMethodWithGroupings(constructors, className);
  }
  onFieldsDeclaration(fields) {
    this.addTitle("Fields", this.headingLevel + 1);
    this.declareFieldOrProperty(fields);
  }
  onPropertiesDeclaration(properties) {
    this.addTitle("Properties", this.headingLevel + 1);
    this.declareFieldOrProperty(properties);
  }
  onMethodsDeclaration(methods) {
    this.addTitle("Methods", this.headingLevel + 1);
    this.declareMethodWithGroupings(methods);
  }
  onInnerEnumsDeclaration(enums) {
    this.addInnerTypes("Enums", enums);
  }
  onInnerClassesDeclaration(classes) {
    this.addInnerTypes("Classes", classes);
  }
  onInnerInterfacesDeclaration(interfaces) {
    this.addInnerTypes("Interfaces", interfaces, false);
  }
  addInnerTypes(title, types, addSeparator = true) {
    this.addTitle(title, this.headingLevel + 1);
    types.forEach((currentType) => {
      const innerFile = new MarkdownTypeFile(currentType, this.headingLevel + 2, void 0, true);
      this.addText(innerFile._contents);
    });
    if (addSeparator) {
      this.addHorizontalRule();
    }
  }
  hasGroupings(groupAware) {
    return !!groupAware.find((current) => !!current.group);
  }
  declareMethodWithGroupings(methods, className = "") {
    const hasGroupings = this.hasGroupings(methods);
    if (!hasGroupings) {
      declareMethod(this, methods, this.headingLevel, className);
    } else {
      const groupedConstructors = this.group(methods);
      for (const key in groupedConstructors) {
        this.startGroup(key, groupedConstructors[key][0].groupDescription);
        const constructorsForGroup = groupedConstructors[key];
        declareMethod(this, constructorsForGroup, this.headingLevel, className);
        this.endGroup();
      }
    }
  }
  declareFieldOrProperty(fieldsOrProperties) {
    const hasGroupings = this.hasGroupings(fieldsOrProperties);
    if (!hasGroupings) {
      declareField(this, fieldsOrProperties, this.headingLevel, false);
    } else {
      const groupedFields = this.group(fieldsOrProperties);
      for (const key in groupedFields) {
        this.startGroup(key, groupedFields[key][0].groupDescription);
        const fieldsForGroup = groupedFields[key];
        declareField(this, fieldsForGroup, this.headingLevel, true);
        this.endGroup();
      }
    }
  }
  startGroup(groupName, groupDescription) {
    this.headingLevel = this.headingLevel + 2;
    this.addTitle(groupName, this.headingLevel);
    if (groupDescription) {
      this.addText(groupDescription);
    }
  }
  endGroup() {
    this.headingLevel = this.headingLevel - 2;
  }
  group(list) {
    return list.reduce((groups, item) => {
      var _a;
      const groupName = (_a = item.group) != null ? _a : "Other";
      const group = groups[groupName] || [];
      group.push(item);
      groups[groupName] = group;
      return groups;
    }, {});
  }
}

class MarkdownTranspilerBase extends ProcessorTypeTranspiler {
  constructor() {
    super();
    this.onBeforeProcess = (types) => {
      this._fileContainer.pushFile(new MarkdownHomeFile(this.homeFileName(), types));
    };
    this._fileContainer = new FileContainer();
  }
  fileBuilder() {
    return this._fileContainer;
  }
  onProcess(type) {
    this._fileContainer.pushFile(new MarkdownTypeFile(type));
  }
}

class JekyllDocsProcessor extends MarkdownTranspilerBase {
  constructor() {
    super(...arguments);
    this.onBeforeProcess = (types) => {
      this._fileContainer.pushFile(new MarkdownHomeFile(this.homeFileName(), types, this.frontMatterForHomeFile));
    };
  }
  homeFileName() {
    return "index";
  }
  onProcess(type) {
    this._fileContainer.pushFile(new MarkdownTypeFile(type, 1, this.getFrontMatterHeader(type)));
  }
  get frontMatterForHomeFile() {
    return "---\nlayout: default\n---";
  }
  getFrontMatterHeader(type) {
    var _a;
    const headerLines = ["---"];
    headerLines.push("layout: default");
    const targetType = {
      name: type.name,
      typeName: type.type_name,
      accessModifier: type.access_modifier,
      group: type.group,
      description: (_a = type.docComment) == null ? void 0 : _a.description
    };
    const configuredHeaders = Settings.getInstance().frontMatterHeader(targetType);
    if (configuredHeaders) {
      configuredHeaders.forEach((header) => {
        headerLines.push(header);
      });
    }
    headerLines.push("---");
    return headerLines.join("\n");
  }
  getLinkingStrategy() {
    return "path-relative";
  }
}

class DocsifyDocsProcessor extends MarkdownTranspilerBase {
  homeFileName() {
    return "README";
  }
  getLinkingStrategy() {
    return "root-relative";
  }
}

const linkFromTypeNameGenerator = ClassFileGeneratorHelper.getRenderableLinkByTypeName;
function defaultGetEmailByReference(email) {
  return {
    title: email,
    url: `mailto:${email}`
  };
}
function replaceInlineReferences(text, linkReplacer = linkFromTypeNameGenerator, emailReplacer = defaultGetEmailByReference) {
  return replaceInlineEmails(replaceInlineLinks([text], linkReplacer), emailReplacer);
}
function replaceInlineLinks(renderableContents, getLinkByTypeName) {
  return renderableContents.flatMap((renderableContent) => inlineLinkContent(renderableContent, getLinkByTypeName));
}
function inlineLinkContent(renderableContent, getLinkByTypeName) {
  if (typeof renderableContent !== "string") {
    return [renderableContent];
  }
  const text = renderableContent;
  const linkFormatRegEx = "{@link (.*?)}|<<([^>]+)>>";
  const matches = match(linkFormatRegEx, text);
  return createRenderableContents(matches, text, getLinkByTypeName);
}
function replaceInlineEmails(renderableContents, getLinkByTypeName) {
  return renderableContents.flatMap((renderableContent) => inlineEmailContent(renderableContent, getLinkByTypeName));
}
function inlineEmailContent(renderableContent, getLinkByTypeName) {
  if (typeof renderableContent !== "string") {
    return [renderableContent];
  }
  const text = renderableContent;
  const linkFormatRegEx = "{@email (.*?)}";
  const matches = match(linkFormatRegEx, text);
  return createRenderableContents(matches, text, getLinkByTypeName);
}
function match(regex, text) {
  const expression = new RegExp(regex, "gi");
  let match2;
  const matches = [];
  do {
    match2 = expression.exec(text);
    if (match2) {
      matches.push(match2);
    }
  } while (match2);
  return matches;
}
function createRenderableContents(matches, text, linker) {
  if (matches.length === 0) {
    return [text];
  }
  const result = [];
  let lastIndex = 0;
  for (const match2 of matches) {
    const index = match2.index;
    const length = match2[0].length;
    const capturedGroup = match2.slice(1).find((group) => group);
    if (!capturedGroup) {
      continue;
    }
    result.push(text.slice(lastIndex, index));
    result.push(linker(capturedGroup));
    lastIndex = index + length;
  }
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }
  return result;
}

function isEmptyLine(content) {
  return Object.keys(content).includes("type") && content.type === "empty-line";
}

var __defProp$6 = Object.defineProperty;
var __defProps$5 = Object.defineProperties;
var __getOwnPropDescs$5 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$6 = Object.getOwnPropertySymbols;
var __hasOwnProp$6 = Object.prototype.hasOwnProperty;
var __propIsEnum$6 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$6 = (obj, key, value) => key in obj ? __defProp$6(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$6 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$6.call(b, prop))
      __defNormalProp$6(a, prop, b[prop]);
  if (__getOwnPropSymbols$6)
    for (var prop of __getOwnPropSymbols$6(b)) {
      if (__propIsEnum$6.call(b, prop))
        __defNormalProp$6(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$5 = (a, b) => __defProps$5(a, __getOwnPropDescs$5(b));
function adaptDescribable(describable, linkGenerator) {
  function describableToRenderableContent(describable2) {
    if (!describable2) {
      return;
    }
    return describable2.map((line) => [
      ...replaceInlineReferences(line, linkGenerator),
      {
        type: "empty-line"
      }
    ]).flatMap((line) => line).filter((line, index, lines) => !(isEmptyLine(line) && index === lines.length - 1));
  }
  return {
    description: describableToRenderableContent(describable)
  };
}
function adaptDocumentable(documentable, linkGenerator, subHeadingLevel) {
  var _a, _b, _c;
  function extractCustomTags(type) {
    var _a2, _b2;
    const baseTags = ["description", "group", "author", "date", "see", "example", "mermaid", "throws", "exception"];
    return (_b2 = (_a2 = type.docComment) == null ? void 0 : _a2.annotations.filter((currentAnnotation) => !baseTags.includes(currentAnnotation.name.toLowerCase())).map((currentAnnotation) => __spreadProps$5(__spreadValues$6({}, adaptDescribable(currentAnnotation.bodyLines, linkGenerator)), {
      name: currentAnnotation.name
    }))) != null ? _b2 : [];
  }
  function extractAnnotationBodyLines(type, annotationName) {
    var _a2, _b2;
    return (_b2 = (_a2 = type.docComment) == null ? void 0 : _a2.annotations.find(
      (currentAnnotation) => currentAnnotation.name.toLowerCase() === annotationName
    )) == null ? void 0 : _b2.bodyLines;
  }
  function extractAnnotationBody(type, annotationName) {
    var _a2, _b2;
    return (_b2 = (_a2 = type.docComment) == null ? void 0 : _a2.annotations.find(
      (currentAnnotation) => currentAnnotation.name.toLowerCase() === annotationName
    )) == null ? void 0 : _b2.body;
  }
  function extractSeeAnnotations(type) {
    var _a2, _b2;
    return (_b2 = (_a2 = type.docComment) == null ? void 0 : _a2.annotations.filter((currentAnnotation) => currentAnnotation.name.toLowerCase() === "see").map((currentAnnotation) => currentAnnotation.body)) != null ? _b2 : [];
  }
  return __spreadProps$5(__spreadValues$6({}, adaptDescribable((_a = documentable.docComment) == null ? void 0 : _a.descriptionLines, linkGenerator)), {
    annotations: documentable.annotations.map((annotation) => annotation.type.toUpperCase()),
    customTags: extractCustomTags(documentable),
    mermaid: {
      headingLevel: subHeadingLevel,
      heading: "Diagram",
      value: extractAnnotationBodyLines(documentable, "mermaid")
    },
    example: {
      headingLevel: subHeadingLevel,
      heading: "Example",
      value: (_c = (_b = documentable.docComment) == null ? void 0 : _b.exampleAnnotation) == null ? void 0 : _c.bodyLines
    },
    group: extractAnnotationBody(documentable, "group"),
    author: extractAnnotationBody(documentable, "author"),
    date: extractAnnotationBody(documentable, "date"),
    sees: extractSeeAnnotations(documentable).map(linkGenerator)
  });
}

var __defProp$5 = Object.defineProperty;
var __defProps$4 = Object.defineProperties;
var __getOwnPropDescs$4 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$5 = Object.getOwnPropertySymbols;
var __hasOwnProp$5 = Object.prototype.hasOwnProperty;
var __propIsEnum$5 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$5 = (obj, key, value) => key in obj ? __defProp$5(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$5 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$5.call(b, prop))
      __defNormalProp$5(a, prop, b[prop]);
  if (__getOwnPropSymbols$5)
    for (var prop of __getOwnPropSymbols$5(b)) {
      if (__propIsEnum$5.call(b, prop))
        __defNormalProp$5(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$4 = (a, b) => __defProps$4(a, __getOwnPropDescs$4(b));
function adaptMethod(method, linkGenerator, baseHeadingLevel) {
  var _a, _b, _c;
  function buildTitle(method2) {
    const { name, parameters } = method2;
    const parametersString = parameters.map((param) => param.name).join(", ");
    return `${name}(${parametersString})`;
  }
  function buildSignature(method2) {
    const { access_modifier, typeReference, name, memberModifiers } = method2;
    const parameters = method2.parameters.map((param) => `${param.typeReference.rawDeclaration} ${param.name}`).join(", ");
    const members = memberModifiers.length > 0 ? `${memberModifiers.join(" ")} ` : "";
    return `${access_modifier} ${members}${typeReference.rawDeclaration} ${name}(${parameters})`;
  }
  return {
    headingLevel: baseHeadingLevel,
    doc: adaptDocumentable(method, linkGenerator, baseHeadingLevel + 1),
    heading: buildTitle(method),
    signature: {
      headingLevel: baseHeadingLevel + 1,
      heading: "Signature",
      value: [buildSignature(method)]
    },
    returnType: {
      headingLevel: baseHeadingLevel + 1,
      heading: "Return Type",
      value: __spreadProps$4(__spreadValues$5({}, adaptDescribable((_b = (_a = method.docComment) == null ? void 0 : _a.returnAnnotation) == null ? void 0 : _b.bodyLines, linkGenerator)), {
        type: linkFromTypeNameGenerator(method.typeReference.rawDeclaration)
      })
    },
    throws: {
      headingLevel: baseHeadingLevel + 1,
      heading: "Throws",
      value: (_c = method.docComment) == null ? void 0 : _c.throwsAnnotations.map((thrown) => mapThrows(thrown))
    },
    parameters: {
      headingLevel: baseHeadingLevel + 1,
      heading: "Parameters",
      value: method.parameters.map((param) => mapParameters(method, param))
    },
    inherited: method.inherited
  };
}
function adaptConstructor(typeName, constructor, linkGenerator, baseHeadingLevel) {
  var _a;
  function buildTitle(name, constructor2) {
    const { parameters } = constructor2;
    const parametersString = parameters.map((param) => param.name).join(", ");
    return `${name}(${parametersString})`;
  }
  function buildSignature(name, constructor2) {
    const { access_modifier } = constructor2;
    const parameters = constructor2.parameters.map((param) => `${param.typeReference.rawDeclaration} ${param.name}`).join(", ");
    return `${access_modifier} ${name}(${parameters})`;
  }
  return {
    doc: adaptDocumentable(constructor, linkGenerator, baseHeadingLevel + 1),
    headingLevel: baseHeadingLevel,
    heading: buildTitle(typeName, constructor),
    signature: {
      headingLevel: baseHeadingLevel + 1,
      heading: "Signature",
      value: [buildSignature(typeName, constructor)]
    },
    parameters: {
      headingLevel: baseHeadingLevel + 1,
      heading: "Parameters",
      value: constructor.parameters.map((param) => mapParameters(constructor, param))
    },
    throws: {
      headingLevel: baseHeadingLevel + 1,
      heading: "Throws",
      value: (_a = constructor.docComment) == null ? void 0 : _a.throwsAnnotations.map((thrown) => mapThrows(thrown))
    }
  };
}
function mapParameters(documentable, param) {
  var _a;
  const paramAnnotation = (_a = documentable.docComment) == null ? void 0 : _a.paramAnnotations.find(
    (pa) => pa.paramName.toLowerCase() === param.name.toLowerCase()
  );
  return __spreadProps$4(__spreadValues$5({}, adaptDescribable(paramAnnotation == null ? void 0 : paramAnnotation.bodyLines, linkFromTypeNameGenerator)), {
    name: param.name,
    type: linkFromTypeNameGenerator(param.typeReference.rawDeclaration)
  });
}
function mapThrows(thrown) {
  return __spreadProps$4(__spreadValues$5({}, adaptDescribable(thrown.bodyLines, linkFromTypeNameGenerator)), {
    type: linkFromTypeNameGenerator(thrown.exceptionName)
  });
}

function adaptFieldOrProperty(field, linkGenerator, baseHeadingLevel) {
  function buildSignature() {
    const { access_modifier, name } = field;
    const memberModifiers = field.memberModifiers.join(" ");
    return `${access_modifier} ${memberModifiers} ${name}`.replace(/ {2}/g, " ");
  }
  return {
    doc: adaptDocumentable(field, linkGenerator, baseHeadingLevel + 1),
    headingLevel: baseHeadingLevel,
    heading: field.name,
    type: {
      headingLevel: baseHeadingLevel + 1,
      heading: "Type",
      value: linkFromTypeNameGenerator(field.typeReference.rawDeclaration)
    },
    inherited: field.inherited,
    accessModifier: field.access_modifier,
    signature: {
      headingLevel: baseHeadingLevel + 1,
      heading: "Signature",
      value: [buildSignature()]
    }
  };
}

var __defProp$4 = Object.defineProperty;
var __defProps$3 = Object.defineProperties;
var __getOwnPropDescs$3 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$4 = Object.getOwnPropertySymbols;
var __hasOwnProp$4 = Object.prototype.hasOwnProperty;
var __propIsEnum$4 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$4 = (obj, key, value) => key in obj ? __defProp$4(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$4 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$4.call(b, prop))
      __defNormalProp$4(a, prop, b[prop]);
  if (__getOwnPropSymbols$4)
    for (var prop of __getOwnPropSymbols$4(b)) {
      if (__propIsEnum$4.call(b, prop))
        __defNormalProp$4(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$3 = (a, b) => __defProps$3(a, __getOwnPropDescs$3(b));
function baseTypeAdapter(type, linkGenerator, baseHeadingLevel) {
  function getHeading(type2) {
    const suffixMap = {
      class: "Class",
      interface: "Interface",
      enum: "Enum"
    };
    return `${type2.name} ${suffixMap[type2.type_name]}`;
  }
  return {
    headingLevel: baseHeadingLevel,
    heading: getHeading(type),
    doc: adaptDocumentable(type, linkGenerator, baseHeadingLevel + 1),
    name: type.name,
    meta: {
      accessModifier: type.access_modifier
    }
  };
}
function typeToRenderableType(type, linkGenerator, namespace) {
  function getRenderable() {
    switch (type.type_name) {
      case "enum":
        return enumTypeToEnumSource(type, linkGenerator);
      case "interface":
        return interfaceTypeToInterfaceSource(type, linkGenerator);
      case "class":
        return classTypeToClassSource(type, linkGenerator);
    }
  }
  return __spreadProps$3(__spreadValues$4({}, getRenderable()), {
    namespace
  });
}
function enumTypeToEnumSource(enumType, linkGenerator, baseHeadingLevel = 1) {
  return __spreadProps$3(__spreadValues$4({
    __type: "enum"
  }, baseTypeAdapter(enumType, linkGenerator, baseHeadingLevel)), {
    values: {
      headingLevel: baseHeadingLevel + 1,
      heading: "Values",
      value: enumType.values.map((value) => {
        var _a;
        return __spreadProps$3(__spreadValues$4({}, adaptDescribable((_a = value.docComment) == null ? void 0 : _a.descriptionLines, linkGenerator)), {
          value: value.name
        });
      })
    }
  });
}
function interfaceTypeToInterfaceSource(interfaceType, linkGenerator, baseHeadingLevel = 1) {
  return __spreadProps$3(__spreadValues$4({
    __type: "interface"
  }, baseTypeAdapter(interfaceType, linkGenerator, baseHeadingLevel)), {
    extends: interfaceType.extended_interfaces.map(linkFromTypeNameGenerator),
    methods: {
      headingLevel: baseHeadingLevel + 1,
      heading: "Methods",
      value: interfaceType.methods.map((method) => adaptMethod(method, linkGenerator, baseHeadingLevel + 2))
    }
  });
}
function classTypeToClassSource(classType, linkGenerator, baseHeadingLevel = 1) {
  return __spreadProps$3(__spreadValues$4({
    __type: "class"
  }, baseTypeAdapter(classType, linkGenerator, baseHeadingLevel)), {
    classModifier: classType.classModifier,
    sharingModifier: classType.sharingModifier,
    implements: classType.implemented_interfaces.map(linkFromTypeNameGenerator),
    extends: classType.extended_class ? linkFromTypeNameGenerator(classType.extended_class) : void 0,
    methods: {
      headingLevel: baseHeadingLevel + 1,
      heading: "Methods",
      value: classType.methods.map((method) => adaptMethod(method, linkGenerator, baseHeadingLevel + 2))
    },
    constructors: {
      headingLevel: baseHeadingLevel + 1,
      heading: "Constructors",
      value: classType.constructors.map(
        (constructor) => adaptConstructor(classType.name, constructor, linkGenerator, baseHeadingLevel + 2)
      )
    },
    fields: {
      headingLevel: baseHeadingLevel + 1,
      heading: "Fields",
      value: classType.fields.map(
        (field) => adaptFieldOrProperty(field, linkGenerator, baseHeadingLevel + 2)
      )
    },
    properties: {
      headingLevel: baseHeadingLevel + 1,
      heading: "Properties",
      value: classType.properties.map(
        (property) => adaptFieldOrProperty(property, linkGenerator, baseHeadingLevel + 2)
      )
    },
    innerClasses: {
      headingLevel: baseHeadingLevel + 1,
      heading: "Classes",
      value: classType.classes.map(
        (innerClass) => classTypeToClassSource(innerClass, linkGenerator, baseHeadingLevel + 2)
      )
    },
    innerEnums: {
      headingLevel: baseHeadingLevel + 1,
      heading: "Enums",
      value: classType.enums.map((innerEnum) => enumTypeToEnumSource(innerEnum, linkGenerator, baseHeadingLevel + 2))
    },
    innerInterfaces: {
      headingLevel: baseHeadingLevel + 1,
      heading: "Interfaces",
      value: classType.interfaces.map(
        (innerInterface) => interfaceTypeToInterfaceSource(innerInterface, linkGenerator, baseHeadingLevel + 2)
      )
    }
  });
}

const classMarkdownTemplate = `
{{ heading headingLevel heading }}
{{#if classModifier}}
\`{{classModifier}}\`
{{/if}}

{{> typeDocumentation}}

{{#if extends}}
**Extends**
{{link extends}}
{{/if}}

{{#if implements}}
**Implements**
{{#each implements}}
{{link this}}{{#unless @last}}, {{/unless}}
{{/each}}
{{/if}}

{{#if fields.value}}
{{> fieldsPartialTemplate fields}}
{{/if}}

{{#if properties.value}}
{{> fieldsPartialTemplate properties}}
{{/if}}

{{#if constructors.value}}
{{> constructorsPartialTemplate constructors}}
{{/if}}

{{#if methods.value}}
{{> methodsPartialTemplate methods}}
{{/if}}

{{#if innerClasses.value}}
{{ heading innerClasses.headingLevel innerClasses.heading }}
{{#each innerClasses.value}}
{{> classTemplate this}}
{{/each}}
{{/if}}

{{#if innerEnums.value}}
{{ heading innerEnums.headingLevel innerEnums.heading }}
{{#each innerEnums.value}}
{{> enumTemplate this}}
{{/each}}
{{/if}}

{{#if innerInterfaces.value}}
{{ heading innerInterfaces.headingLevel innerInterfaces.heading }}
{{#each innerInterfaces.value}}
{{> interfaceTemplate this}}
{{/each}}
{{/if}}
`.trim();

const enumMarkdownTemplate = `
{{ heading headingLevel heading }}

{{> typeDocumentation }}

{{ heading values.headingLevel values.heading }}
| Value | Description |
|-------|-------------|
{{#each values.value}}
| {{value}} | {{description}} |
{{/each}}
`.trim();

const interfaceMarkdownTemplate = `
{{ heading headingLevel heading }}

{{> typeDocumentation }}

{{#if extends}}
**Extends**
{{#each extends}}
{{link this}}{{#unless @last}}, {{/unless}}
{{/each}}
{{/if}}

{{#if methods}}
{{> methodsPartialTemplate methods}}
{{/if}}
`.trim();

const typeDocPartial = `
{{#> documentablePartialTemplate}}

{{#if doc.group}}
**Group** {{doc.group}}
{{/if}}

{{#if doc.author}}
**Author** {{doc.author}}
{{/if}}

{{#if doc.date}}
**Date** {{doc.date}}
{{/if}}

{{#each doc.sees}}
**See** {{link this}}

{{/each}}

{{#if namespace}}
## Namespace
{{namespace}}
{{/if}}

{{/documentablePartialTemplate}}
`.trim();

const documentablePartialTemplate = `
{{#each doc.annotations}}
\`{{this}}\`
{{/each}}

{{withLinks doc.description}}

{{#each doc.customTags}}
**{{splitAndCapitalize name}}** {{withLinks description}}

{{/each}}

{{> @partial-block}}

{{#if doc.mermaid.value}}
{{ heading doc.mermaid.headingLevel doc.mermaid.heading }}
{{code "mermaid" doc.mermaid.value}}
{{/if}}

{{#if doc.example.value}}
{{ heading doc.example.headingLevel doc.example.heading }}
{{code "apex" doc.example.value}}
{{/if}}
`.trim();

const methodsPartialTemplate = `
{{ heading headingLevel heading }}
{{#each value}}
{{{ heading headingLevel (inlineCode heading) }}}

{{#if inherited}}
*Inherited*
{{/if}}

{{#> documentablePartialTemplate}}

{{ heading signature.headingLevel signature.heading }}
{{ code "apex" signature.value }}

{{#if parameters.value}}
{{ heading parameters.headingLevel parameters.heading }}
| Name | Type | Description |
|------|------|-------------|
{{#each parameters.value}}
| {{name}} | {{link type}} | {{withLinks description}} |
{{/each}}
{{/if}}

{{ heading returnType.headingLevel returnType.heading }}
**{{link returnType.value.type}}**

{{#if returnType.value.description}}
{{returnType.value.description}}
{{/if}}

{{#if throws.value}}
{{ heading throws.headingLevel throws.heading }}
{{#each throws.value}}
{{link this.type}}: {{this.description}}

{{/each}}
{{/if}}
{{/documentablePartialTemplate}}

{{#unless @last}}---{{/unless}}

{{/each}}
`.trim();

const constructorsPartialTemplate = `
{{ heading headingLevel heading }}
{{#each value}}
{{{ heading headingLevel (inlineCode heading) }}}

{{#> documentablePartialTemplate}}

{{ heading signature.headingLevel signature.heading }}
{{ code "apex" signature.value }}

{{#if parameters.value}}
{{ heading parameters.headingLevel parameters.heading }}
| Name | Type | Description |
|------|------|-------------|
{{#each parameters.value}}
| {{name}} | {{type}} | {{description}} |
{{/each}}
{{/if}}

{{#if throws.value}}
{{ heading throws.headingLevel throws.heading }}
{{#each throws.value}}
{{link this.type}}: {{this.description}}

{{/each}}
{{/if}}
{{/documentablePartialTemplate}}

{{#unless @last}}---{{/unless}}

{{/each}}
`.trim();

const fieldsPartialTemplate = `
{{ heading headingLevel heading }}
{{#each value}}
{{{ heading headingLevel (inlineCode heading) }}}

{{#if inherited}}
*Inherited*
{{/if}}

{{#> documentablePartialTemplate }}

{{ heading signature.headingLevel signature.heading }}
{{ code "apex" signature.value }}

{{ heading type.headingLevel type.heading }}
{{link type.value}}

{{/documentablePartialTemplate}}

{{#unless @last}}---{{/unless}}

{{/each}}
`.trim();

function resolveLinksInContent(description) {
  if (!description) {
    return "";
  }
  function reduceDescription(acc, curr) {
    if (isEmptyLine(curr)) {
      return acc + "\n\n";
    }
    return acc + link(curr).trim() + " ";
  }
  return description.reduce(reduceDescription, "").trim();
}
function link(source) {
  if (typeof source === "string") {
    return source;
  } else {
    return `[${source.title}](${source.url})`;
  }
}

var require$1 = (
			false
				? /* @__PURE__ */ module$1.createRequire((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.src || new URL('cli/generate.js', document.baseURI).href)))
				: require
		);

require$1("src/core/markdown-helpers/wespa.md");
function convertCodeBlock(language, lines) {
  console.log(wepsa);
  return new Handlebars.SafeString(
    `
\`\`\`${language}
${lines.join("\n")}
\`\`\`
  `.trim()
  );
}

const splitAndCapitalize = (text) => {
  const words = text.split(/[-_]+/);
  const capitalizedWords = [];
  for (const word of words) {
    capitalizedWords.push(word.charAt(0).toUpperCase() + word.slice(1));
  }
  return capitalizedWords.join(" ");
};
const heading = (level, text) => {
  return `${"#".repeat(level)} ${text}`;
};
const heading2 = (currentLevel, text) => {
  return heading(currentLevel + 1, text);
};
const heading3 = (currentLevel, text) => {
  return heading(currentLevel + 2, text);
};
const inlineCode = (text) => {
  return new Handlebars.SafeString(`\`${text}\``);
};

class Template {
  constructor() {
    Handlebars.registerPartial("typeDocumentation", typeDocPartial);
    Handlebars.registerPartial("documentablePartialTemplate", documentablePartialTemplate);
    Handlebars.registerPartial("methodsPartialTemplate", methodsPartialTemplate);
    Handlebars.registerPartial("constructorsPartialTemplate", constructorsPartialTemplate);
    Handlebars.registerPartial("fieldsPartialTemplate", fieldsPartialTemplate);
    Handlebars.registerPartial("classTemplate", classMarkdownTemplate);
    Handlebars.registerPartial("enumTemplate", enumMarkdownTemplate);
    Handlebars.registerPartial("interfaceTemplate", interfaceMarkdownTemplate);
    Handlebars.registerHelper("link", link);
    Handlebars.registerHelper("code", convertCodeBlock);
    Handlebars.registerHelper("withLinks", resolveLinksInContent);
    Handlebars.registerHelper("heading", heading);
    Handlebars.registerHelper("heading2", heading2);
    Handlebars.registerHelper("heading3", heading3);
    Handlebars.registerHelper("inlineCode", inlineCode);
    Handlebars.registerHelper("splitAndCapitalize", splitAndCapitalize);
  }
  static getInstance() {
    if (!Template.instance) {
      Template.instance = new Template();
    }
    return Template.instance;
  }
  compile(request) {
    const compiled = Handlebars.compile(request.template);
    return compiled(request.source).trim().replace(/\n{3,}/g, "\n\n");
  }
}

const documentType = _function.flow(typeToRenderableType, resolveTemplate, compile);
function resolveTemplate(renderable) {
  return {
    template: getTemplate(renderable),
    source: renderable
  };
}
function getTemplate(renderable) {
  switch (renderable.__type) {
    case "enum":
      return enumMarkdownTemplate;
    case "interface":
      return interfaceMarkdownTemplate;
    case "class":
      return classMarkdownTemplate;
  }
}
function compile(request) {
  return Template.getInstance().compile(request);
}

class PlainMarkdownDocsProcessor extends MarkdownTranspilerBase {
  constructor() {
    super(...arguments);
    this.onBeforeProcess = (types) => {
      this._fileContainer.pushFile(new MarkdownHomeFile(this.homeFileName(), types));
    };
  }
  homeFileName() {
    return "index";
  }
  getLinkingStrategy() {
    return "path-relative";
  }
  onProcess(type) {
    this._fileContainer.pushFile(new GenericFile(type));
  }
}
class GenericFile extends OutputFile {
  constructor(type) {
    super(
      `${Settings.getInstance().getNamespacePrefix()}${type.name}`,
      ClassFileGeneratorHelper.getSanitizedGroup(type)
    );
    this.type = type;
    this.addText(documentType(type, linkFromTypeNameGenerator, Settings.getInstance().getNamespace()));
  }
  fileExtension() {
    return ".md";
  }
}

var __defProp$3 = Object.defineProperty;
var __defProps$2 = Object.defineProperties;
var __getOwnPropDescs$2 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$3 = Object.getOwnPropertySymbols;
var __hasOwnProp$3 = Object.prototype.hasOwnProperty;
var __propIsEnum$3 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$3 = (obj, key, value) => key in obj ? __defProp$3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$3 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$3.call(b, prop))
      __defNormalProp$3(a, prop, b[prop]);
  if (__getOwnPropSymbols$3)
    for (var prop of __getOwnPropSymbols$3(b)) {
      if (__propIsEnum$3.call(b, prop))
        __defNormalProp$3(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$2 = (a, b) => __defProps$2(a, __getOwnPropDescs$2(b));
class OpenapiTypeFile extends OutputFile {
  constructor(openApiModel) {
    super(Settings.getInstance().openApiFileName(), "");
    this.openApiModel = openApiModel;
    this.addText(JSON.stringify(__spreadProps$2(__spreadValues$3({}, openApiModel), { namespace: void 0 }), null, 2));
  }
  fileExtension() {
    return ".json";
  }
}

const OPEN_API_VERSION = "3.1.0";
const SERVER_URL = "/services/apexrest/";
class OpenApi {
  constructor(title, version, namespace) {
    this.namespace = namespace;
    this.openapi = OPEN_API_VERSION;
    this.info = {
      title,
      version
    };
    this.servers = [
      {
        url: this.getServerUrl()
      }
    ];
    this.paths = {};
    this.tags = [];
  }
  getServerUrl() {
    if (!this.namespace) {
      return SERVER_URL;
    }
    return `${SERVER_URL}${this.namespace}/`;
  }
}

class ClassMirrorWrapper {
  constructor(classMirror) {
    this.classMirror = classMirror;
    this.hasAnnotation = (method, annotationName) => method.annotations.some((annotation) => annotation.name.toLowerCase() === annotationName);
  }
  getMethodsByAnnotation(annotation) {
    return this.classMirror.methods.filter((method) => this.hasAnnotation(method, annotation));
  }
}

var __defProp$2 = Object.defineProperty;
var __defProps$1 = Object.defineProperties;
var __getOwnPropDescs$1 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$2 = Object.getOwnPropertySymbols;
var __hasOwnProp$2 = Object.prototype.hasOwnProperty;
var __propIsEnum$2 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$2 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$2.call(b, prop))
      __defNormalProp$2(a, prop, b[prop]);
  if (__getOwnPropSymbols$2)
    for (var prop of __getOwnPropSymbols$2(b)) {
      if (__propIsEnum$2.call(b, prop))
        __defNormalProp$2(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$1 = (a, b) => __defProps$1(a, __getOwnPropDescs$1(b));
class ReferenceBuilder {
  constructor() {
    this.isReferenceString = (targetObject) => {
      return typeof targetObject === "string" || targetObject instanceof String;
    };
  }
  build(referencedTypeName) {
    const originalTypeName = referencedTypeName;
    const regexForSchemaOverrides = /\[(.*?)]/g;
    const schemaOverrides = referencedTypeName.match(regexForSchemaOverrides);
    let referenceOverrides = [];
    if (schemaOverrides && schemaOverrides.length > 0) {
      referenceOverrides = ReferenceOverrides.build(schemaOverrides[0]);
      referencedTypeName = referencedTypeName.replace(regexForSchemaOverrides, "");
    }
    const [parsedReferencedType, isCollection] = this.handlePossibleCollectionReference(referencedTypeName);
    const referencedTypeBundle = TypesRepository.getInstance().getFromAllByName(parsedReferencedType);
    if (!referencedTypeBundle) {
      throw new Error(`The referenced type ${referencedTypeName} was not found.`);
    }
    if (referencedTypeBundle.type.type_name !== "class") {
      throw new Error(
        `Expected the referenced type to be a class, but found a ${referencedTypeBundle.type.type_name}.`
      );
    }
    const typeBundleWithIsCollection = __spreadProps$1(__spreadValues$2({}, referencedTypeBundle), {
      originalTypeName,
      isCollection,
      referenceOverrides
    });
    return this.buildReferenceFromType(typeBundleWithIsCollection);
  }
  /**
   * Returns a tuple where the first value is the name of the reference without any collection related values
   * and the second is a boolean representing if we are dealing with a collection or not.
   * @param referencedTypeName The received raw type name.
   * @private
   */
  handlePossibleCollectionReference(referencedTypeName) {
    referencedTypeName = referencedTypeName.toLowerCase();
    if (referencedTypeName.startsWith("list<") && referencedTypeName.endsWith(">")) {
      referencedTypeName = referencedTypeName.replace("list<", "");
      referencedTypeName = referencedTypeName.replace(">", "");
      return [referencedTypeName, true];
    }
    if (referencedTypeName.startsWith("set<") && referencedTypeName.endsWith(">")) {
      referencedTypeName = referencedTypeName.replace("set<", "");
      referencedTypeName = referencedTypeName.replace(">", "");
      return [referencedTypeName, true];
    }
    return [referencedTypeName, false];
  }
  buildReferenceFromType(typeBundle) {
    const propertiesAndFields = [
      ...typeBundle.type.properties,
      ...typeBundle.type.fields
    ].filter((current) => !current.memberModifiers.includes("static")).filter((current) => !current.memberModifiers.includes("transient"));
    const properties = {};
    let referencedComponents = [];
    propertiesAndFields.forEach((current) => {
      var _a, _b;
      const referenceOverride = typeBundle.referenceOverrides.find((currentOverride) => {
        return currentOverride.propertyName.toLowerCase() === current.name.toLowerCase();
      });
      if (referenceOverride) {
        const reference = this.build(referenceOverride.referenceName);
        properties[current.name] = reference.entrypointReferenceObject;
        reference.referenceComponents.forEach((current2) => referencedComponents.push(current2));
      } else {
        const manuallyDefinedHttpSchema = (_a = current.docComment) == null ? void 0 : _a.annotations.find(
          (annotation) => annotation.name.toLowerCase() === "http-schema"
        );
        if (manuallyDefinedHttpSchema) {
          this.handleOverriddenSchema(manuallyDefinedHttpSchema, properties, current, referencedComponents);
        } else {
          const pair = this.getReferenceType(current.typeReference);
          properties[current.name] = pair.schema;
          referencedComponents.push(...pair.referenceComponents);
        }
      }
      properties[current.name].description = (_b = current.docComment) == null ? void 0 : _b.description;
    });
    const mainReferenceComponents = this.buildMainReferenceComponent(typeBundle, properties);
    referencedComponents = [...mainReferenceComponents, ...referencedComponents];
    return {
      entrypointReferenceObject: {
        $ref: `#/components/schemas/${this.getReferenceName(typeBundle)}`
      },
      referenceComponents: referencedComponents
    };
  }
  handleOverriddenSchema(manuallyDefinedHttpSchema, properties, current, referencedComponents) {
    const inYaml = manuallyDefinedHttpSchema == null ? void 0 : manuallyDefinedHttpSchema.bodyLines.reduce((prev, current2) => prev + "\n" + current2);
    const asJson = yaml__namespace.load(inYaml);
    const isReferenceString = this.isReferenceString(asJson);
    if (isReferenceString) {
      const reference = this.build(asJson);
      properties[current.name] = reference.entrypointReferenceObject;
      reference.referenceComponents.forEach((current2) => referencedComponents.push(current2));
    } else {
      properties[current.name] = asJson;
    }
  }
  getReferenceName(typeBundle) {
    var _a;
    let referenceName = typeBundle.type.name;
    if (typeBundle.isChild) {
      referenceName = `${(_a = typeBundle.parentType) == null ? void 0 : _a.name}.${typeBundle.type.name}`;
    }
    if (typeBundle.isCollection) {
      referenceName = `${referenceName}_array`;
    }
    if (typeBundle.referenceOverrides.length) {
      referenceName = `${referenceName}_${typeBundle.originalTypeName}`;
    }
    return referenceName;
  }
  buildMainReferenceComponent(typeBundle, properties) {
    const mainReferenceName = this.getReferenceName(__spreadProps$1(__spreadValues$2({}, typeBundle), { isCollection: false }));
    const mainReference = {
      referencedClass: mainReferenceName,
      schema: {
        type: "object",
        properties
      }
    };
    const referencedComponents = [mainReference];
    if (!typeBundle.isCollection) {
      return referencedComponents;
    }
    return [
      {
        referencedClass: this.getReferenceName(typeBundle),
        schema: {
          type: "array",
          items: {
            $ref: `#/components/schemas/${mainReferenceName}`
          }
        }
      },
      ...referencedComponents
    ];
  }
  getReferenceType(typeInMirror) {
    const typeName = typeInMirror.type.toLowerCase();
    switch (typeName) {
      case "boolean":
        return { schema: { type: "boolean" }, referenceComponents: [] };
      case "date":
        return { schema: { type: "string", format: "date" }, referenceComponents: [] };
      case "datetime":
        return { schema: { type: "string", format: "date-time" }, referenceComponents: [] };
      case "decimal":
        return { schema: { type: "number" }, referenceComponents: [] };
      case "double":
        return { schema: { type: "number" }, referenceComponents: [] };
      case "id":
        return { schema: { type: "string" }, referenceComponents: [] };
      case "integer":
        return { schema: { type: "integer" }, referenceComponents: [] };
      case "long":
        return { schema: { type: "integer", format: "int64" }, referenceComponents: [] };
      case "string":
        return { schema: { type: "string" }, referenceComponents: [] };
      case "time":
        return { schema: { type: "string", format: "time" }, referenceComponents: [] };
      case "list":
        return this.buildCollectionPair(typeInMirror);
      case "set":
        return this.buildCollectionPair(typeInMirror);
      case "map":
        return { schema: { type: "object" }, referenceComponents: [] };
      case "object":
        return { schema: { type: "object" }, referenceComponents: [] };
      default:
        const referencedType = TypesRepository.getInstance().getFromAllByName(typeName);
        if (!referencedType) {
          return { schema: { type: "object" }, referenceComponents: [] };
        }
        const reference = this.buildReferenceFromType(__spreadProps$1(__spreadValues$2({}, referencedType), {
          isCollection: false,
          referenceOverrides: [],
          originalTypeName: typeName
        }));
        return {
          schema: reference.entrypointReferenceObject,
          referenceComponents: [...reference.referenceComponents]
        };
    }
  }
  buildCollectionPair(typeInMirror) {
    const innerReference = this.getReferenceType(typeInMirror.ofType);
    return {
      schema: { type: "array", items: innerReference.schema },
      referenceComponents: [...innerReference.referenceComponents]
    };
  }
}
class ReferenceOverrides {
  static build(referenceAsString) {
    const cleanedUpReference = referenceAsString.replace(/[\[\]]/g, "");
    const referenceStrings = cleanedUpReference.split(",").map((item) => item.replace(/\s/g, ""));
    return referenceStrings.map((item) => {
      const [propertyName, referenceName] = item.split(":");
      return { propertyName, referenceName };
    });
  }
}

class Builder {
  constructor() {
    this.isReferenceString = (targetObject) => {
      return typeof targetObject === "string" || targetObject instanceof String;
    };
  }
  build(schemaAware) {
    let reference;
    if (this.isReferenceString(schemaAware.schema)) {
      reference = new ReferenceBuilder().build(schemaAware.schema);
    }
    return {
      reference,
      body: this.buildBody(schemaAware, reference)
    };
  }
  getOpenApiSchemaFromApexDocSchema(schemaAware, reference) {
    if (this.isReferenceString(schemaAware.schema)) {
      return reference.entrypointReferenceObject;
    }
    return schemaAware.schema;
  }
}

var __defProp$1 = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$1 = Object.getOwnPropertySymbols;
var __hasOwnProp$1 = Object.prototype.hasOwnProperty;
var __propIsEnum$1 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$1 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$1.call(b, prop))
      __defNormalProp$1(a, prop, b[prop]);
  if (__getOwnPropSymbols$1)
    for (var prop of __getOwnPropSymbols$1(b)) {
      if (__propIsEnum$1.call(b, prop))
        __defNormalProp$1(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
class ParameterObjectBuilder extends Builder {
  buildBody(apexDocObject, reference) {
    return __spreadProps(__spreadValues$1({}, apexDocObject), {
      schema: this.getOpenApiSchemaFromApexDocSchema(apexDocObject, reference)
    });
  }
}

class ResponsesBuilder extends Builder {
  buildBody(apexDocResponseDefinition, reference) {
    let description = `Status code ${apexDocResponseDefinition.statusCode}`;
    if (apexDocResponseDefinition.description) {
      description = apexDocResponseDefinition.description;
    }
    return {
      description,
      content: {
        "application/json": {
          schema: this.getOpenApiSchemaFromApexDocSchema(apexDocResponseDefinition, reference)
        }
      }
    };
  }
}

class RequestBodyBuilder extends Builder {
  buildBody(apexRequestBody, reference) {
    return {
      description: apexRequestBody.description,
      content: {
        "application/json": { schema: this.getOpenApiSchemaFromApexDocSchema(apexRequestBody, reference) }
      },
      required: apexRequestBody.required
    };
  }
}

class MethodMirrorWrapper {
  constructor(methodMirror) {
    this.methodMirror = methodMirror;
    this.hasDocCommentAnnotation = (annotationName) => {
      var _a;
      return (_a = this.methodMirror.docComment) == null ? void 0 : _a.annotations.some((annotation) => annotation.name.toLowerCase() === annotationName);
    };
    this.getDocCommentAnnotation = (annotationName) => {
      var _a;
      return (_a = this.methodMirror.docComment) == null ? void 0 : _a.annotations.find((annotation) => annotation.name.toLowerCase() === annotationName);
    };
  }
}

class MethodParser {
  constructor(openApiModel) {
    this.openApiModel = openApiModel;
  }
  parseMethod(classMirror, httpUrlEndpoint, httpMethodKey, tag) {
    var _a, _b;
    const classMirrorWrapper = new ClassMirrorWrapper(classMirror);
    const httpMethods = classMirrorWrapper.getMethodsByAnnotation(`http${httpMethodKey}`);
    if (!httpMethods.length) {
      return;
    }
    const httpMethod = httpMethods[0];
    this.openApiModel.paths[httpUrlEndpoint][httpMethodKey] = {};
    this.openApiModel.paths[httpUrlEndpoint][httpMethodKey].tags = [tag];
    if ((_a = httpMethod.docComment) == null ? void 0 : _a.description) {
      this.openApiModel.paths[httpUrlEndpoint][httpMethodKey].description = httpMethod.docComment.description;
    }
    const methodMirrorWrapper = new MethodMirrorWrapper(httpMethod);
    if (methodMirrorWrapper.hasDocCommentAnnotation("summary")) {
      this.openApiModel.paths[httpUrlEndpoint][httpMethodKey].summary = (_b = methodMirrorWrapper.getDocCommentAnnotation("summary")) == null ? void 0 : _b.body;
    }
    this.parseHttpAnnotation(
      httpMethod,
      httpUrlEndpoint,
      httpMethodKey,
      "http-request-body",
      this.addRequestBodyToOpenApi.bind(this),
      this.fallbackHttpRequestBodyParser(httpUrlEndpoint, httpMethodKey)
    );
    this.parseHttpAnnotation(
      httpMethod,
      httpUrlEndpoint,
      httpMethodKey,
      "http-parameter",
      this.addParametersToOpenApi.bind(this)
    );
    this.parseHttpAnnotation(
      httpMethod,
      httpUrlEndpoint,
      httpMethodKey,
      "http-response",
      this.addHttpResponsesToOpenApi.bind(this),
      this.getFallbackHttpResponseParser(httpUrlEndpoint, httpMethodKey)
    );
  }
  parseHttpAnnotation(httpMethod, urlValue, httpMethodKey, annotationName, addToOpenApi, fallbackParser) {
    var _a;
    const annotations = (_a = httpMethod.docComment) == null ? void 0 : _a.annotations.filter((annotation) => annotation.name === annotationName);
    if (!(annotations == null ? void 0 : annotations.length)) {
      if (fallbackParser) {
        fallbackParser(httpMethod);
      }
      return;
    }
    for (const annotation of annotations) {
      const inYaml = annotation == null ? void 0 : annotation.bodyLines.reduce((prev, current) => prev + "\n" + current);
      if (!inYaml) {
        return;
      }
      this.addToOpenApiStrategy(inYaml, urlValue, httpMethodKey, addToOpenApi);
    }
  }
  addToOpenApiStrategy(inYaml, urlValue, httpMethodKey, addToOpenApi) {
    const inJson = yaml__namespace.load(inYaml);
    const requestBodyResponse = new RequestBodyBuilder().build(inJson);
    addToOpenApi(inJson, urlValue, httpMethodKey);
    this.addReference(requestBodyResponse);
  }
  addRequestBodyToOpenApi(input, urlValue, httpMethodKey) {
    const requestBodyResponse = new RequestBodyBuilder().build(input);
    this.openApiModel.paths[urlValue][httpMethodKey].requestBody = requestBodyResponse.body;
  }
  addParametersToOpenApi(input, urlValue, httpMethodKey) {
    const parameterObjectResponse = new ParameterObjectBuilder().build(input);
    if (this.openApiModel.paths[urlValue][httpMethodKey].parameters === void 0) {
      this.openApiModel.paths[urlValue][httpMethodKey].parameters = [];
    }
    this.openApiModel.paths[urlValue][httpMethodKey].parameters.push(parameterObjectResponse.body);
  }
  addHttpResponsesToOpenApi(input, urlValue, httpMethodKey) {
    const responseObjectResponse = new ResponsesBuilder().build(input);
    if (this.openApiModel.paths[urlValue][httpMethodKey].responses === void 0) {
      this.openApiModel.paths[urlValue][httpMethodKey].responses = {};
    }
    this.openApiModel.paths[urlValue][httpMethodKey].responses[input.statusCode] = responseObjectResponse.body;
  }
  fallbackHttpRequestBodyParser(httpUrlEndpoint, httpMethodKey) {
    return (methodMirror) => {
      const parameters = methodMirror.parameters;
      if (!parameters.length) {
        return;
      }
      const propertiesObject = {};
      parameters.forEach((currentParameter) => {
        const propertyKey = currentParameter.name;
        const propertyReference = new ReferenceBuilder().getReferenceType(currentParameter.typeReference);
        propertiesObject[propertyKey] = propertyReference.schema;
        this.addReference({
          reference: {
            entrypointReferenceObject: propertyReference.schema,
            referenceComponents: propertyReference.referenceComponents
          }
        });
      });
      this.openApiModel.paths[httpUrlEndpoint][httpMethodKey].requestBody = {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: propertiesObject
            }
          }
        }
      };
    };
  }
  getFallbackHttpResponseParser(httpUrlEndpoint, httpMethodKey) {
    return (methodMirror) => {
      var _a, _b;
      const returnType = methodMirror.typeReference;
      if (returnType.type.toLowerCase() === "void") {
        return;
      }
      const reference = new ReferenceBuilder().getReferenceType(returnType);
      this.addReference({
        reference: {
          entrypointReferenceObject: reference.schema,
          referenceComponents: reference.referenceComponents
        }
      });
      if (this.openApiModel.paths[httpUrlEndpoint][httpMethodKey].responses === void 0) {
        this.openApiModel.paths[httpUrlEndpoint][httpMethodKey].responses = {};
      }
      this.openApiModel.paths[httpUrlEndpoint][httpMethodKey].responses["200"] = {
        description: (_b = (_a = methodMirror.docComment) == null ? void 0 : _a.description) != null ? _b : "Status code 200",
        content: {
          "application/json": { schema: reference.schema }
        }
      };
    };
  }
  addReference(referenceHolder) {
    if (referenceHolder.reference) {
      if (this.openApiModel.components === void 0) {
        this.openApiModel.components = {
          schemas: {}
        };
      }
      if (!referenceHolder.reference.referenceComponents.length) {
        return;
      }
      referenceHolder.reference.referenceComponents.forEach((current) => {
        this.openApiModel.components.schemas[current.referencedClass] = current.schema;
      });
    }
  }
}

class OpenApiDocsProcessor extends ProcessorTypeTranspiler {
  constructor() {
    super();
    this.onAfterProcess = () => {
      this._fileContainer.pushFile(new OpenapiTypeFile(this.openApiModel));
    };
    this._fileContainer = new FileContainer();
    const title = Settings.getInstance().getOpenApiTitle();
    if (!title) {
      throw Error("No OpenApi title was provided.");
    }
    this.openApiModel = new OpenApi(title, "1.0.0", Settings.getInstance().getNamespace());
  }
  fileBuilder() {
    return this._fileContainer;
  }
  onProcess(type) {
    var _a, _b;
    Logger.logSingle(`Processing ${type.name}`, false, "green", false);
    const endpointPath = this.getEndpointPath(type);
    if (!endpointPath) {
      return;
    }
    this.openApiModel.paths[endpointPath] = {};
    if ((_a = type.docComment) == null ? void 0 : _a.description) {
      this.openApiModel.paths[endpointPath].description = type.docComment.description;
    }
    const typeAsClass = type;
    const tagName = camel2title(endpointPath);
    this.openApiModel.tags.push({
      name: tagName,
      description: (_b = type.docComment) == null ? void 0 : _b.description
    });
    const parser = new MethodParser(this.openApiModel);
    parser.parseMethod(typeAsClass, endpointPath, "get", tagName);
    parser.parseMethod(typeAsClass, endpointPath, "patch", tagName);
    parser.parseMethod(typeAsClass, endpointPath, "post", tagName);
    parser.parseMethod(typeAsClass, endpointPath, "put", tagName);
    parser.parseMethod(typeAsClass, endpointPath, "delete", tagName);
  }
  getEndpointPath(type) {
    var _a;
    const restResourceAnnotation = type.annotations.find((element) => element.name.toLowerCase() === "restresource");
    const urlMapping = (_a = restResourceAnnotation == null ? void 0 : restResourceAnnotation.elementValues) == null ? void 0 : _a.find(
      (element) => element.key.toLowerCase() === "urlmapping"
    );
    if (!urlMapping) {
      Logger.error(`Type does not contain urlMapping annotation ${type.name}`);
      return null;
    }
    let endpointPath = urlMapping.value.replaceAll('"', "").replaceAll("'", "").replaceAll("/*", "/");
    if (endpointPath.startsWith("/")) {
      endpointPath = endpointPath.substring(1);
    }
    return endpointPath;
  }
}

class TypeTranspilerFactory {
  static get(generator) {
    if (this.typeTranspilerCache) {
      return this.typeTranspilerCache;
    }
    switch (generator) {
      case "jekyll":
        this.typeTranspilerCache = new JekyllDocsProcessor();
        return this.typeTranspilerCache;
      case "docsify":
        this.typeTranspilerCache = new DocsifyDocsProcessor();
        return this.typeTranspilerCache;
      case "plain-markdown":
        this.typeTranspilerCache = new PlainMarkdownDocsProcessor();
        return this.typeTranspilerCache;
      case "openapi":
        this.typeTranspilerCache = new OpenApiDocsProcessor();
        return this.typeTranspilerCache;
      default:
        throw Error("Invalid target generator");
    }
  }
}

class Apexdocs {
  /**
   * Generates documentation out of Apex source files.
   */
  static generate() {
    Logger.log("Initializing...");
    const fileBodies = ApexFileReader.processFiles(new DefaultFileSystem());
    const manifest = index.createManifest(new RawBodyParser(fileBodies), this._reflectionWithLogger);
    TypesRepository.getInstance().populateAll(manifest.types);
    const filteredTypes = this.filterByScopes(manifest);
    TypesRepository.getInstance().populateScoped(filteredTypes);
    const processor = TypeTranspilerFactory.get(Settings.getInstance().targetGenerator);
    Transpiler.generate(filteredTypes, processor);
    const generatedFiles = processor.fileBuilder().files();
    const files = [];
    FileWriter.write(generatedFiles, (file) => {
      Logger.logSingle(`${file.name} processed.`, false, "green", false);
      files.push(file);
    });
    Settings.getInstance().onAfterProcess(files);
    ErrorLogger.logErrors(filteredTypes);
  }
  static filterByScopes(manifest) {
    let filteredTypes;
    let filteredLogMessage;
    if (Settings.getInstance().config.targetGenerator !== "openapi") {
      filteredTypes = manifest.filteredByAccessModifierAndAnnotations(Settings.getInstance().scope);
      filteredLogMessage = `Filtered ${manifest.types.length - filteredTypes.length} file(s) based on scope: ${Settings.getInstance().scope}`;
    } else {
      filteredTypes = manifest.filteredByAccessModifierAndAnnotations([
        "restresource",
        "httpdelete",
        "httpget",
        "httppatch",
        "httppost",
        "httpput"
      ]);
      filteredLogMessage = `Filtered ${manifest.types.length - filteredTypes.length} file(s), only keeping classes annotated as @RestResource.`;
    }
    Logger.clear();
    Logger.logSingle(filteredLogMessage, false, "green", false);
    Logger.logSingle(`Creating documentation for ${filteredTypes.length} file(s)`, false, "green", false);
    return filteredTypes;
  }
}
Apexdocs._reflectionWithLogger = (apexBundle) => {
  var _a;
  const result = apexReflection.reflect(apexBundle.rawTypeContent);
  if (result.error) {
    Logger.error(`${apexBundle.filePath} - Parsing error ${(_a = result.error) == null ? void 0 : _a.message}`);
  }
  return result;
};

var __defProp = Object.defineProperty;
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
const result = cosmiconfig.cosmiconfig("apexdocs").search();
result.then((config) => {
  var _a, _b, _c;
  yargs__namespace.config(config == null ? void 0 : config.config);
  let argv = yargs__namespace.options({
    sourceDir: {
      type: "string",
      alias: "s",
      demandOption: true,
      describe: "The directory location which contains your apex .cls classes."
    },
    targetDir: {
      type: "string",
      alias: "t",
      default: "./docs/",
      describe: "The directory location where documentation will be generated to."
    },
    recursive: {
      type: "boolean",
      alias: "r",
      default: true,
      describe: "Whether .cls classes will be searched for recursively in the directory provided."
    },
    scope: {
      type: "array",
      alias: "p",
      default: ["global"],
      describe: "A list of scopes to document. Values should be separated by a space, e.g --scope global public namespaceaccessible. Annotations are supported and should be passed lowercased and without the @ symbol, e.g. namespaceaccessible auraenabled. Note that this setting is ignored if generating an OpenApi REST specification since that looks for classes annotated with @RestResource."
    },
    targetGenerator: {
      type: "string",
      alias: "g",
      default: "jekyll",
      choices: ["jekyll", "docsify", "plain-markdown", "openapi"],
      describe: "Define the static file generator for which the documents will be created. Currently supports jekyll, docsify, plain markdown, and OpenAPI v3.1.0."
    },
    indexOnly: {
      type: "boolean",
      default: false,
      describe: "Defines whether only the index file should be generated."
    },
    defaultGroupName: {
      type: "string",
      default: "Miscellaneous",
      describe: "Defines the @group name to be used when a file does not specify it."
    },
    sanitizeHtml: {
      type: "boolean",
      default: true,
      describe: 'When on, any special character within your ApexDocs is converted into its HTML code representation. This is specially useful when generic objects are described within the docs, e.g. "List< Foo>", "Map<Foo, Bar>" because otherwise the content within < and > would be treated as HTML tags and not shown in the output. Content in @example blocks are never sanitized.'
    },
    openApiTitle: {
      type: "string",
      default: "Apex REST Api",
      describe: 'If using "openapi" as the target generator, this allows you to specify the OpenApi title value.'
    },
    title: {
      type: "string",
      describe: "If this allows you to specify the title of the generated documentation's home file.",
      default: "Classes"
    },
    namespace: {
      type: "string",
      describe: "The package namespace, if any. If this value is provided the namespace will be added as a prefix to all of the parsed files. If generating an OpenApi definition, it will be added to the file's Server Url."
    },
    openApiFileName: {
      type: "string",
      describe: 'If using "openapi" as the target generator, this allows you to specify the name of the output file.',
      default: "openapi"
    },
    sortMembersAlphabetically: {
      type: "boolean",
      describe: "Whether to sort members alphabetically.",
      default: false
    },
    includeMetadata: {
      type: "boolean",
      describe: "Whether to include the file's meta.xml information: Whether it is active and and the API version",
      default: false
    },
    documentationRootDir: {
      type: "string",
      describe: "Allows you to specify the root documentation directory where the files are being generated. This can be helpful when embedding the generated docs into an existing site so that the links are generated correctly."
    }
  }).argv;
  if (config) {
    argv = __spreadValues(__spreadValues({}, config.config), argv);
  }
  Settings.build({
    sourceDirectory: argv.sourceDir,
    recursive: argv.recursive,
    scope: argv.scope,
    outputDir: argv.targetDir,
    targetGenerator: argv.targetGenerator,
    indexOnly: argv.indexOnly,
    defaultGroupName: argv.defaultGroupName,
    sanitizeHtml: argv.sanitizeHtml,
    openApiTitle: argv.openApiTitle,
    title: argv.title,
    namespace: argv.namespace,
    openApiFileName: argv.openApiFileName,
    sortMembersAlphabetically: argv.sortMembersAlphabetically,
    includeMetadata: argv.includeMetadata,
    rootDir: argv.documentationRootDir,
    onAfterProcess: (_a = config == null ? void 0 : config.config) == null ? void 0 : _a.onAfterProcess,
    onBeforeFileWrite: (_b = config == null ? void 0 : config.config) == null ? void 0 : _b.onBeforeFileWrite,
    frontMatterHeader: (_c = config == null ? void 0 : config.config) == null ? void 0 : _c.frontMatterHeader
  });
  try {
    Apexdocs.generate();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
