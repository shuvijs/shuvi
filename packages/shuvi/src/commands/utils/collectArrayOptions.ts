export function collectArrayOptions(
  value: string,
  previous: string[]
): string[] {
  return previous.concat(value);
}
