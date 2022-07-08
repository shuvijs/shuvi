import { IDENTITY_RUNTIME_PUBLICPATH } from '@shuvi/shared/lib/constants';

export function modifyHtml(document) {
  document.scriptTags.splice(1, 0, {
    tagName: 'script',
    attrs: {
      name: 'test'
    },
    innerHTML: `${IDENTITY_RUNTIME_PUBLICPATH} = "/client-overwrite/"`
  });
}
