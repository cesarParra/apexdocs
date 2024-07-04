import Handlebars from 'handlebars';
import wespa from './wespa.md';

export function convertCodeBlock(language: string, lines: string[]): Handlebars.SafeString {
  console.log(wespa);
  return new Handlebars.SafeString(
    `
\`\`\`${language}
${lines.join('\n')}
\`\`\`
  `.trim(),
  );
}
