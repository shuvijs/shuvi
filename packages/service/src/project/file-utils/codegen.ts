// we can't use path.win32.isAbsolute because it also matches paths starting with a forward slash
const matchNativeWin32Path = /^([A-Z]:[/\\])|^\\\\/i;
const win32Root = /^[A-Z]:[/\\]+/i;

export function urlToRequest(filepath: string) {
  if (matchNativeWin32Path.test(filepath)) {
    // turn "C:\" or "C:\\" into "c:/"
    filepath = `${filepath.replace(
      win32Root,
      root => `${root[0].toLowerCase()}:\\`
    )}`;

    // Error [ERR_UNSUPPORTED_ESM_URL_SCHEME]: Only URLs with a scheme in: file,
    // data are supported by the default ESM loader. On Windows, absolute paths
    // must be valid file:// URLs.'
    filepath = `file://${filepath}`;
  }

  filepath = filepath.replace(/\\/g, '/');

  return filepath;
}
