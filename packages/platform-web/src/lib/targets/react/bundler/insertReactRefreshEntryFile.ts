import { createServerPlugin } from '@shuvi/service';
import { BUILD_CLIENT_RUNTIME_REACT_REFRESH } from '../constants';
export default createServerPlugin({
  modifyHtml: (documentProps, appContext, context) => {
    if (context.mode === 'development') {
      documentProps.scriptTags.unshift({
        tagName: 'script',
        attrs: {
          src: context.getAssetPublicUrl(
            BUILD_CLIENT_RUNTIME_REACT_REFRESH + '.js'
          )
        }
      });
    }
    return documentProps;
  }
});
