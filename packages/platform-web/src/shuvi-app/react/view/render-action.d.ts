import { ReactNode } from 'react';
declare type RenderActionParam = {
  ssr?: boolean;
  isInitialRender?: boolean;
  root?: ReactNode;
  callback?: () => unknown;
  appContainer?: Element | Document;
};
declare let renderAction: (options: RenderActionParam) => void;
export { renderAction };
