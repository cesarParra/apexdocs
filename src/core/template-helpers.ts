import type { CodeBlock, RenderableContent, StringOrLink, InlineCode } from './renderables/types';
import { isEmptyLine, isCodeBlock, isInlineCode } from './markdown/adapters/type-utils';
import type { TemplateHelpers } from './shared/types';

/**
 * Convert a StringOrLink to a Markdown link string.
 * If the source is a string, it's returned as-is.
 * If it's a Link object, returns Markdown link syntax: [title](url).
 */
export function link(source: StringOrLink): string {
  if (typeof source === 'string') {
    return source;
  } else {
    return `[${source.title}](${source.url})`;
  }
}

/**
 * Convert a CodeBlock to a Markdown code block string.
 */
export function code(codeBlock: CodeBlock): string {
  return `
\`\`\`${codeBlock.language}
${codeBlock.content.join('\n')}
\`\`\`
`.trim();
}

/**
 * Convert InlineCode to a Markdown inline code string.
 */
function inlineCodeToString(inlineCode: InlineCode): string {
  return `\`${inlineCode.content}\``;
}

/**
 * Render RenderableContent array to a markdown string.
 *
 * @param content - The content to render
 * @param escapeFunction - Optional function to escape dangerous expressions for security.
 *                         When used in template contexts like Handlebars, pass Handlebars.escapeExpression
 *                         to prevent XSS attacks by escaping HTML special characters in user-provided content.
 *                         When used outside of templates, this can be omitted.
 *
 * @example
 * // In a Handlebars template context (with escaping):
 * renderContent(content, Handlebars.escapeExpression);
 *
 * @example
 * // For direct markdown generation (without escaping):
 * renderContent(content);
 */
export function renderContent(content?: RenderableContent[] | null, escapeFunction?: (text: string) => string): string {
  if (!content || content.length === 0) {
    return '';
  }

  function reduceDescription(acc: string, curr: RenderableContent): string {
    if (isEmptyLine(curr)) {
      return acc + '\n';
    }
    if (isCodeBlock(curr)) {
      return acc + code(curr) + '\n';
    }
    if (isInlineCode(curr)) {
      return acc + inlineCodeToString(curr) + ' ';
    } else {
      // For strings or links, use the link function which handles both
      const linkResult = link(curr as StringOrLink);
      // Apply escape function if provided (for security in template contexts)
      const escapedLink = escapeFunction ? escapeFunction(linkResult) : linkResult;
      return acc + escapedLink.trim() + ' ';
    }
  }

  return content.reduce(reduceDescription, '').trim();
}

/**
 * Create a Markdown heading with the given level and text.
 */
export function heading(level: number, text: string): string {
  if (level < 1 || level > 6) {
    throw new Error(`Heading level must be between 1 and 6, got ${level}`);
  }
  return `${'#'.repeat(level)} ${text}`;
}

/**
 * Create Markdown inline code.
 */
export function inlineCode(text: string): string {
  return `\`${text}\``;
}

/**
 * Equality comparison helper.
 */
export function eq(a: unknown, b: unknown): boolean {
  return a === b;
}

/**
 * Addition helper.
 */
export function add(a: number, b: number): number {
  return a + b;
}

/**
 * Array lookup helper.
 */
export function lookup<T>(array: T[], index: number): T | undefined {
  return array[index];
}

/**
 * Parse JSON string, returns null on error.
 */
export function parseJSON(jsonString: string): unknown | null {
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

/**
 * Check if string starts with prefix.
 */
export function startsWith(str: string, prefix: string): boolean {
  return str.startsWith(prefix);
}

/**
 * Extract substring from string.
 */
export function substring(str: string, start: number, length?: number): string {
  if (length !== undefined) {
    return str.substring(start, start + length);
  }
  return str.substring(start);
}

/**
 * Split text by hyphens or underscores and capitalize each word.
 */
export function splitAndCapitalize(text: string): string {
  const words = text.split(/[-_]+/);
  const capitalizedWords = [];
  for (const word of words) {
    capitalizedWords.push(word.charAt(0).toUpperCase() + word.slice(1));
  }
  return capitalizedWords.join(' ');
}

/**
 * Get all template helpers as an object matching TemplateHelpers type.
 */
export const templateHelpers: TemplateHelpers = {
  link,
  code,
  renderContent: (content) => renderContent(content), // Wrap to match TemplateHelpers signature
  heading,
  inlineCode,
  eq,
  add,
  lookup,
  parseJSON,
  startsWith,
  substring,
  splitAndCapitalize,
};

// Re-export TemplateHelpers type for convenience
export type { TemplateHelpers };
