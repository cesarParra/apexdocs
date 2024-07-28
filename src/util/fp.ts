export function apply<T extends unknown[], U extends unknown[], R>(fn: (...args: [...T, ...U]) => R, ...front: T) {
  return (...tailArgs: U) => fn(...front, ...tailArgs);
}
