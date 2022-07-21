import { defineFile } from '../..';
import { ProjectContext } from '../../../projectContext';
import { getContentProxyObj } from '../../../file-utils';

export default defineFile({
  content: (context: ProjectContext) => {
    const proxyObj: { [key: string]: string | undefined } = {};
    for (const [k, r] of context.resources) {
      proxyObj[k] = r;
    }

    return getContentProxyObj(proxyObj);
  }
});
