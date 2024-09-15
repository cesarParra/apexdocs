export const camel2title = (camelCase: string) =>
  camelCase
    .replace(/\//g, ' ')
    .replace(/([A-Z])/g, (match) => ` ${match}`)
    .replace(/\b\w/g, (match) => match.toUpperCase())
    .replace(/^./, (match) => match.toUpperCase())
    .trim();
