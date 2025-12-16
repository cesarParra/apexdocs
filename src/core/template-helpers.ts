import type { CodeBlock, RenderableContent, StringOrLink, InlineCode } from './renderables/types';
import { isEmptyLine, isCodeBlock, isInlineCode } from './markdown/adapters/type-utils';
import type { TemplateHelpers } from './shared/types';

/**
 * Simple HTML escaping for safety when rendering content that may contain HTML.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Convert a StringOrLink to a markdown link string.
 * If the source is a string, it's returned as-is (with HTML escaping).
 * If it's a Link object, returns markdown link syntax: [title](url).
 */
export function link(source: StringOrLink): string {
  if (typeof source === 'string') {
    return escapeHtml(source);
  } else {
    return `[${escapeHtml(source.title)}](${escapeHtml(source.url)})`;
  }
}

/**
 * Convert a CodeBlock to a markdown code block string.
 */
export function code(codeBlock: CodeBlock): string {
  return `
\`\`\`${codeBlock.language}
${codeBlock.content.join('\n')}
\`\`\`
`.trim();
}

/**
 * Convert InlineCode to a markdown inline code string.
 */
function inlineCodeToString(inlineCode: InlineCode): string {
  return `\`${inlineCode.content}\``;
}

/**
 * Render RenderableContent array to a markdown string.
 */
export function renderContent(content?: RenderableContent[] | null): string {
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
      return acc + link(curr as StringOrLink).trim() + ' ';
    }
  }

  return content.reduce(reduceDescription, '').trim();
}

/**
 * Create a markdown heading with the given level and text.
 */
export function heading(level: number, text: string): string {
  if (level < 1 || level > 6) {
    throw new Error(`Heading level must be between 1 and 6, got ${level}`);
  }
  return `${'#'.repeat(level)} ${escapeHtml(text)}`;
}

/**
 * Create markdown inline code.
 */
export function inlineCode(text: string): string {
  return `\`${escapeHtml(text)}\``;
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
  renderContent,
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
