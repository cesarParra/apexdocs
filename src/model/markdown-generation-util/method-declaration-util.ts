import { ConstructorMirror, DocComment } from '@cparra/apex-reflection';
import { MarkdownFile } from '../markdown-file';
import { ParameterMirror } from '@cparra/apex-reflection';
import { addCustomDocCommentAnnotations, addMermaid } from './doc-comment-annotation-util';
import { MethodMirrorWithInheritance } from '../inheritance';

export function declareMethod(
  markdownFile: MarkdownFile,
  methods: ConstructorMirror[] | MethodMirrorWithInheritance[],
  startingHeadingLevel: number,
  className = '',
): void {
  methods.forEach((currentMethod) => {
    const signatureName = isMethod(currentMethod)
      ? `${(currentMethod as MethodMirrorWithInheritance).typeReference.rawDeclaration} ${
          (currentMethod as MethodMirrorWithInheritance).name
        }`
      : className;

    markdownFile.addTitle(
      `\`${buildSignature(currentMethod.access_modifier, signatureName, currentMethod)}\``,
      startingHeadingLevel + 2,
    );

    // Inheritance tag
    if (isMethod(currentMethod)) {
      const asMethodMirror = currentMethod as MethodMirrorWithInheritance;
      if (asMethodMirror.inherited) {
        markdownFile.addBlankLine();
        markdownFile.addText('*Inherited*');
        markdownFile.addBlankLine();
      }
    }

    currentMethod.annotations.forEach((annotation) => {
      markdownFile.addBlankLine();
      markdownFile.addText(`\`${annotation.type.toUpperCase()}\``);
    });

    if (currentMethod.docComment?.description) {
      markdownFile.addBlankLine();
      markdownFile.addText(currentMethod.docComment.description);
      markdownFile.addBlankLine();
    }

    if (currentMethod.parameters.length) {
      addParameters(markdownFile, currentMethod, startingHeadingLevel);
    }

    if (isMethod(currentMethod)) {
      addReturns(markdownFile, currentMethod as MethodMirrorWithInheritance, startingHeadingLevel);
    }

    addThrowsBlock(markdownFile, currentMethod, startingHeadingLevel);

    addCustomDocCommentAnnotations(markdownFile, currentMethod);

    addMermaid(markdownFile, currentMethod);

    if (currentMethod.docComment?.exampleAnnotation) {
      addExample(markdownFile, currentMethod, startingHeadingLevel);
    }
  });

  markdownFile.addHorizontalRule();
}

type ParameterAware = {
  parameters: ParameterMirror[];
};

type DocCommentAware = {
  docComment?: DocComment;
};

function buildSignature(accessModifier: string, name: string, parameterAware: ParameterAware): string {
  let signature = `${name}(`;
  if (isMethod(parameterAware) && (parameterAware as MethodMirrorWithInheritance).memberModifiers.length) {
    signature =
      accessModifier +
      ' ' +
      (parameterAware as MethodMirrorWithInheritance).memberModifiers.join(' ') +
      ' ' +
      signature;
  } else {
    signature = accessModifier + ' ' + signature;
  }
  const signatureParameters = parameterAware.parameters.map(
    (param) => `${param.typeReference.rawDeclaration} ${param.name}`,
  );
  signature += signatureParameters.join(', ');
  return `${signature})`;
}

function addParameters(
  markdownFile: MarkdownFile,
  methodModel: MethodMirrorWithInheritance | ConstructorMirror,
  startingHeadingLevel: number,
) {
  if (!methodModel.docComment?.paramAnnotations.length) {
    // If there are no parameters defined in the docs then we don't want to display this section
    return;
  }

  markdownFile.addTitle('Parameters', startingHeadingLevel + 3);
  markdownFile.initializeTable('Param', 'Description');

  methodModel.docComment?.paramAnnotations.forEach((paramAnnotation) => {
    const paramName = paramAnnotation.paramName;
    const paramDescription = paramAnnotation.bodyLines.join(' ');
    markdownFile.addTableRow(`\`${paramName}\``, paramDescription);
  });

  markdownFile.addBlankLine();
}

function addReturns(
  markdownFile: MarkdownFile,
  methodModel: MethodMirrorWithInheritance,
  startingHeadingLevel: number,
) {
  if (!methodModel.docComment?.returnAnnotation) {
    return;
  }

  markdownFile.addTitle('Returns', startingHeadingLevel + 3);
  markdownFile.initializeTable('Type', 'Description');
  markdownFile.addTableRow(
    `\`${methodModel.typeReference.rawDeclaration}\``,
    methodModel.docComment?.returnAnnotation.bodyLines.join(' '),
  );
  markdownFile.addBlankLine();
}

function addThrowsBlock(markdownFile: MarkdownFile, docCommentAware: DocCommentAware, startingHeadingLevel: number) {
  if (!docCommentAware.docComment?.throwsAnnotations.length) {
    return;
  }
  markdownFile.addTitle('Throws', startingHeadingLevel + 3);
  markdownFile.initializeTable('Exception', 'Description');

  docCommentAware.docComment?.throwsAnnotations.forEach((annotation) => {
    const exceptionName = annotation.exceptionName;
    const exceptionDescription = annotation.bodyLines.join(' ');

    markdownFile.addTableRow(`\`${exceptionName}\``, exceptionDescription);
  });

  markdownFile.addBlankLine();
}

function addExample(markdownFile: MarkdownFile, docCommentAware: DocCommentAware, startingHeadingLevel: number) {
  markdownFile.addTitle('Example', startingHeadingLevel + 3);
  markdownFile.startCodeBlock();
  docCommentAware.docComment?.exampleAnnotation.bodyLines.forEach((line) => {
    markdownFile.addText(line);
  });
  markdownFile.endCodeBlock();
  markdownFile.addBlankLine();
}

function isMethod(
  method: MethodMirrorWithInheritance | ConstructorMirror | ParameterAware,
): method is MethodMirrorWithInheritance {
  return (method as MethodMirrorWithInheritance).typeReference !== undefined;
}
