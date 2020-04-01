export function getTemplateData() {
  return { test: 1 };
}

export function onDocumentProps(documentProps) {
  documentProps.headTags.push({
    tagName: "meta",
    attrs: {
      name: "test",
      content: "1"
    }
  });

  return documentProps;
}
