export default function resolveExtensionsWithSuffix(
  extensions: string[],
  suffix?: string
) {
  if (!suffix) return extensions;
  return [...extensions.map(ext => `.${suffix}${ext}`), ...extensions];
}
