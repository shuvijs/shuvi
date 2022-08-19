export function getSourcePath(source: string) {
  // Webpack prefixes certain source paths with this path
  if (source.startsWith('webpack:///')) {
    return source.substring(11);
  }

  if (source.startsWith('webpack://')) {
    return source.replace(
      /^webpack:\/\/[^/]+/ /* webpack://namaspcae/resourcepath */,
      ''
    );
  }

  if (source.startsWith('/')) {
    return source.substring(1);
  }

  return source;
}
