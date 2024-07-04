import { Type, Annotation, DocComment, ReflectionResult } from '@cparra/apex-reflection';

type AccessAndDocAware = {
    access_modifier: string;
    annotations: Annotation[];
    docComment?: DocComment;
};
/**
 * Represents the full library of Apex top-level types (classes, enums, and interface) for a Salesforce project.
 */
declare class Manifest {
    types: Type[];
    isForInnerTypes: boolean;
    /**
     * Constructs a new Manifest object.
     * @param types List of types to be wrapped by this object.
     * @param isForInnerTypes Whether this manifest represent an inner type or not.
     */
    constructor(types: Type[], isForInnerTypes?: boolean);
    filteredByAccessModifierAndAnnotations(modifiers: string[]): Type[];
    filterAccessibleModifier(accessAndDocAware: AccessAndDocAware[], modifiers: string[]): AccessAndDocAware[];
}

declare class ApexBundle {
    filePath: string;
    rawTypeContent: string;
    rawMetadataContent: string | null;
    constructor(filePath: string, rawTypeContent: string, rawMetadataContent: string | null);
}

interface TypeParser {
    parse(reflect: (apexBundle: ApexBundle) => ReflectionResult): Type[];
}

/**
 * Builds a new Manifest object, sourcing its types from the received TypeParser.
 * @param typeParser In charge of returning the list of reflected types.
 * @param reflect Reflection function.
 */
declare function createManifest(typeParser: TypeParser, reflect: (apexBundle: ApexBundle) => ReflectionResult): Manifest;

export { createManifest };
