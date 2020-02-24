export function joinPath(...paths: string[]): string {
  return paths
    .join("/")
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/");
}
