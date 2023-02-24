import { IReactServerView, IReactAppData } from '../types';

export class ReactServerView implements IReactServerView {
  renderApp: IReactServerView['renderApp'] = async () => {
    const htmlContent = '';

    const appData: IReactAppData = {
      dynamicIds: []
    };

    return {
      appData,
      content: htmlContent,
      htmlAttrs: {},
      headBeginTags: [],
      headEndTags: [],
      bodyBeginTags: [],
      bodyEndTags: []
    };
  };
}
