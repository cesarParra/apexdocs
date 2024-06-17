import { Settings } from '../settings';

export const splitAndCapitalize = (text: string) => {
  const words = text.split(/[-_]+/);
  const capitalizedWords = [];
  for (const word of words) {
    capitalizedWords.push(word.charAt(0).toUpperCase() + word.slice(1));
  }
  return capitalizedWords.join(' ');
};

export const namespace = () => {
  return Settings.getInstance().getNamespace();
};
