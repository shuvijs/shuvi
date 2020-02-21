export function resolvePreferTarget(target: string, extensions: string[]) {
  return extensions.reduce((res, ext) => {
    res.push(`.${target}${ext}`);
    res.push(ext);

    return res;
  }, [] as string[]);
}
