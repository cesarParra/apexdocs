import Handlebars from 'handlebars';

export const splitAndCapitalize = (text: string) => {
  const words = text.split(/[-_]+/);
  const capitalizedWords = [];
  for (const word of words) {
    capitalizedWords.push(word.charAt(0).toUpperCase() + word.slice(1));
  }
  return capitalizedWords.join(' ');
};

export const heading = (level: number, text: string) => {
  return `${'#'.repeat(level)} ${text}`;
};

export const heading2 = (currentLevel: number, text: string) => {
  return heading(currentLevel + 1, text);
};

export const heading3 = (currentLevel: number, text: string) => {
  return heading(currentLevel + 2, text);
};

export const inlineCode = (text: string) => {
  return new Handlebars.SafeString(`\`${text}\``);
};
