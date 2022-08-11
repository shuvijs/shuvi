export function getSourcePath(source: string) {
  // Webpack prefixes certain source paths with this path
  if (source.startsWith('webpack:///')) {
    return source.substring(11);
  }

  // Make sure library name is filtered out as well
  if (source.startsWith('webpack://_N_E/')) {
    return source.substring(15);
  }

  if (source.startsWith('webpack://')) {
    return source.substring(10);
  }

  if (source.startsWith('/')) {
    return source.substring(1);
  }

  return source;
}
