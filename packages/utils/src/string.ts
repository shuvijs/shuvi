export function joinPath(lead: string, ...paths: string[]): string {
  if (paths.length < 1) {
    return lead;
  }

  return (
    lead.replace(/\/+$/, '') +
    '/' +
    paths.join('/').replace(/\\/g, '/').replace(/\/+/g, '/').replace(/^\/+/, '')
  );
}
