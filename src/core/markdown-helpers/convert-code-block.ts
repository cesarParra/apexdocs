import Handlebars from 'handlebars';

export function convertCodeBlock(language: string, lines: string[]): Handlebars.SafeString {
  console.log('lines', lines);
  return new Handlebars.SafeString(
    `
\`\`\`${language}
${lines.join('\n')}
\`\`\`
  `.trim(),
  );
}
