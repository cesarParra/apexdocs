import Handlebars from 'handlebars';
import { CodeBlock, RenderableContent, StringOrLink } from './renderables/types';
import { isCodeBlock, isEmptyLine, isInlineCode } from './markdown/adapters/type-utils';
import { typeDocPartial } from './markdown/templates/type-doc-partial';
import { documentablePartialTemplate } from './markdown/templates/documentable-partial-template';
import { methodsPartialTemplate } from './markdown/templates/methods-partial-template';
import { groupedMembersPartialTemplate } from './markdown/templates/grouped-members-partial-template';
import { constructorsPartialTemplate } from './markdown/templates/constructors-partial-template';
import { fieldsPartialTemplate } from './markdown/templates/fieldsPartialTemplate';
import { classMarkdownTemplate } from './markdown/templates/class-template';
import { enumMarkdownTemplate } from './markdown/templates/enum-template';
import { interfaceMarkdownTemplate } from './markdown/templates/interface-template';

export type CompilationRequest = {
  template: string;
  source: unknown;
};

export class Template {
  private static instance: Template;

  private constructor() {
    Handlebars.registerPartial('typeDocumentation', typeDocPartial);
    Handlebars.registerPartial('documentablePartialTemplate', documentablePartialTemplate);
    Handlebars.registerPartial('methodsPartialTemplate', methodsPartialTemplate);
    Handlebars.registerPartial('constructorsPartialTemplate', constructorsPartialTemplate);
    Handlebars.registerPartial('groupedMembersPartialTemplate', groupedMembersPartialTemplate);
    Handlebars.registerPartial('fieldsPartialTemplate', fieldsPartialTemplate);
    Handlebars.registerPartial('classTemplate', classMarkdownTemplate);
    Handlebars.registerPartial('enumTemplate', enumMarkdownTemplate);
    Handlebars.registerPartial('interfaceTemplate', interfaceMarkdownTemplate);

    Handlebars.registerHelper('link', link);
    Handlebars.registerHelper('code', convertCodeBlock);
    Handlebars.registerHelper('renderContent', resolveRenderableContent);
    Handlebars.registerHelper('heading', heading);
    Handlebars.registerHelper('inlineCode', inlineCode);
    Handlebars.registerHelper('splitAndCapitalize', splitAndCapitalize);
  }

  public static getInstance(): Template {
    if (!Template.instance) {
      Template.instance = new Template();
    }
    return Template.instance;
  }

  compile(request: CompilationRequest): string {
    const compiled = Handlebars.compile(request.template);
    return (
      compiled(request.source)
        .trim()
        // clean up extra newlines
        .replace(/\n{3,}/g, '\n\n')
    );
  }
}

const splitAndCapitalize = (text: string) => {
  const words = text.split(/[-_]+/);
  const capitalizedWords = [];
  for (const word of words) {
    capitalizedWords.push(word.charAt(0).toUpperCase() + word.slice(1));
  }
  return capitalizedWords.join(' ');
};

const heading = (level: number, text: string) => {
  return `${'#'.repeat(level)} ${text}`;
};

const inlineCode = (text: string) => {
  return new Handlebars.SafeString(`\`${text}\``);
};

const convertCodeBlock = (codeBlock: CodeBlock): Handlebars.SafeString => {
  return new Handlebars.SafeString(
    `
\`\`\`${codeBlock.language}
${codeBlock.content.join('\n')}
\`\`\`
  `.trim(),
  );
};

const resolveRenderableContent = (description?: RenderableContent[]): string => {
  if (!description) {
    return '';
  }

  function reduceDescription(acc: string, curr: RenderableContent) {
    if (isEmptyLine(curr)) {
      return acc + '\n';
    }
    if (isCodeBlock(curr)) {
      return acc + convertCodeBlock(curr) + '\n';
    }
    if (isInlineCode(curr)) {
      return acc + inlineCode(curr.content).toString() + ' ';
    } else {
      return acc + Handlebars.escapeExpression(link(curr)).trim() + ' ';
    }
  }

  return description.reduce(reduceDescription, '').trim();
};

const link = (source: StringOrLink): string => {
  if (typeof source === 'string') {
    return source;
  } else {
    return `[${source.title}](${source.url})`;
  }
};
