export function enhancedExts(extensions: string[], target: string): string[] {
  return extensions.map(extend => `.${target}${extend}`).concat(extensions);
}
