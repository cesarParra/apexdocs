// Apex Reflection-based types
import {
  Annotation as MirrorAnnotation,
  ClassMirror,
  DocComment,
  FieldMirror,
  MethodMirror,
  PropertyMirror,
} from '@cparra/apex-reflection';
import { DocPageReference } from '../shared/types';

export type Describable = string[] | undefined;

export type Documentable = {
  annotations: MirrorAnnotation[];
  docComment?: DocComment;
};

export type InheritanceSupport = { inherited: boolean };
export type ClassMirrorWithInheritanceChain = ClassMirror & { inheritanceChain: string[] };
export type FieldMirrorWithInheritance = FieldMirror & InheritanceSupport;
export type PropertyMirrorWithInheritance = PropertyMirror & InheritanceSupport;
export type MethodMirrorWithInheritance = MethodMirror & InheritanceSupport;

// Renderable types

export type ReferenceGuideReference = {
  reference: DocPageReference;
  title: Link;
  description: RenderableContent[] | null;
};

export type RenderableBundle = {
  // References are grouped by their defined @group annotation
  referencesByGroup: Record<string, ReferenceGuideReference[]>;
  renderables: Renderable[];
};

export type Link = {
  readonly __type: 'link';
  title: string;
  url: string;
};

export type EmptyLine = {
  __type: 'empty-line';
};

export type StringOrLink = string | Link;

export type GetRenderableContentByTypeName = (typeName: string) => StringOrLink;

export type RenderableContent = StringOrLink | EmptyLine | CodeBlock | InlineCode;

type EnumValue = {
  value: string;
  description?: RenderableContent[];
};

type CustomTag = {
  name: string;
  description?: RenderableContent[];
};

/**
 * Represents an annotation to a top-level type. For example, @NamespaceAccessible.
 */
type Annotation = string;

type CodeBlock = {
  readonly __type: 'code-block';
  language: string;
  content: string[];
};

type InlineCode = {
  readonly __type: 'inline-code';
  content: string;
};

type RenderableDocumentation = {
  annotations?: Annotation[];
  description?: RenderableContent[];
  customTags?: CustomTag[];
  example?: RenderableSection<RenderableContent[] | undefined>;
  group?: string;
  author?: string;
  date?: string;
  sees?: StringOrLink[];
};

type RenderableType = {
  namespace?: string;
  headingLevel: number;
  heading: string;
  name: string;
  meta: {
    accessModifier: string;
  };
  doc: RenderableDocumentation;
};

type RenderableMethodParameter = {
  name: string;
  type: StringOrLink;
  description?: RenderableContent[];
};

type TypeSource = {
  type: StringOrLink;
  description?: RenderableContent[];
};

type RenderableConstructor = {
  headingLevel: number;
  heading: string;
  signature: RenderableSection<CodeBlock>;
  parameters?: RenderableSection<RenderableMethodParameter[] | undefined>;
  throws?: RenderableSection<TypeSource[] | undefined>;
  doc: RenderableDocumentation;
};

type RenderableMethod = {
  doc: RenderableDocumentation;
  headingLevel: number;
  heading: string;
  signature: RenderableSection<CodeBlock>;
  parameters: RenderableSection<RenderableMethodParameter[] | undefined>;
  returnType: RenderableSection<TypeSource>;
  throws: RenderableSection<TypeSource[] | undefined>;
  inherited?: boolean;
};

type RenderableApexField = {
  headingLevel: number;
  heading: string;
  type: RenderableSection<StringOrLink>;
  accessModifier: string;
  inherited?: boolean;
  signature: RenderableSection<CodeBlock>;
  doc: RenderableDocumentation;
};

export type RenderableSection<T> = {
  headingLevel: number;
  heading: string;
  value: T;
};

export type GroupedMember<T> = RenderableSection<T[]> & { groupDescription: string | undefined };

export type RenderableClass = RenderableType & {
  type: 'class';
  extends?: StringOrLink[];
  implements?: StringOrLink[];
  classModifier?: string;
  sharingModifier?: string;
  constructors: RenderableSection<RenderableConstructor[] | GroupedMember<RenderableConstructor>[]> & {
    isGrouped: boolean;
  };
  methods: RenderableSection<RenderableMethod[] | GroupedMember<RenderableMethod>[]> & { isGrouped: boolean };
  fields: RenderableSection<RenderableApexField[] | GroupedMember<RenderableApexField>[]> & { isGrouped: boolean };
  properties: RenderableSection<RenderableApexField[] | GroupedMember<RenderableApexField>[]> & { isGrouped: boolean };
  innerClasses: RenderableSection<RenderableClass[]>;
  innerEnums: RenderableSection<RenderableEnum[]>;
  innerInterfaces: RenderableSection<RenderableInterface[]>;
};

export type RenderableInterface = RenderableType & {
  type: 'interface';
  extends?: StringOrLink[];
  methods: RenderableSection<RenderableMethod[]>;
};

export type RenderableEnum = RenderableType & {
  type: 'enum';
  values: RenderableSection<EnumValue[]>;
};

export type RenderableCustomObject = Omit<RenderableType, 'meta'> & {
  apiName: string;
  type: 'customobject';
  hasFields: boolean;
  fields: RenderableSection<RenderableCustomField[]>;
};

export type RenderableCustomField = {
  headingLevel: number;
  heading: string;
  apiName: string;
  description: RenderableContent[];
  isPicklist: boolean;
  pickListValues?: RenderableSection<string[]>
  type: 'field';
  fieldType?: string | null;
};

export type Renderable = (RenderableClass | RenderableInterface | RenderableEnum | RenderableCustomObject) & {
  filePath: string;
};
