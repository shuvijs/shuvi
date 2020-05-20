import { IDENTITY_RUNTIME_PUBLICPATH } from '@shuvi/shared/lib/constants';

export function onDocumentProps(documentProps) {
  documentProps.headTags.push({
    tagName: 'script',
    attrs: {
      name: 'test',
    },
    innerHTML: `${IDENTITY_RUNTIME_PUBLICPATH} = "/client-overwrite/"`
  });

  return documentProps;
}
