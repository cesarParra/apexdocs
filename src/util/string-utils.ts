export function stringUtils(str: string, n: number) {
  return str.length > n ? str.substr(0, n - 1) + '&hellip;' : str;
}

export const camel2title = (camelCase: string) =>
  camelCase
    .replace(/([A-Z])/g, (match) => ` ${match}`)
    .replace(/^./, (match) => match.toUpperCase())
    .trim();
