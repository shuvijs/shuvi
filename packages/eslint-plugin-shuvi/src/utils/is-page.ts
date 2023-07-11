const PAGEREG = /routes\/.*page\.(j|t)sx?$/;

export function isPage(path: string) {
  return PAGEREG.test(path);
}
