declare module 'launch-editor' {
  declare function launchEditor(
    file: string,
    specifiedEditor?: string,
    onErrorCallback?: (fileName: string, errorMsg: string) => void
  ): void;

  export default launchEditor;
}
