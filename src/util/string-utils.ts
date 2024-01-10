export function truncate(str: string, n: number) {
  return str.length > n ? str.substr(0, n - 1) + '&hellip;' : str;
}

export const camel2title = (camelCase: string) =>
  camelCase
    .replace(/\//g, ' ')
    .replace(/([A-Z])/g, (match) => ` ${match}`)
    .replace(/\b\w/g, (match) => match.toUpperCase())
    .replace(/^./, (match) => match.toUpperCase())
    .trim();
