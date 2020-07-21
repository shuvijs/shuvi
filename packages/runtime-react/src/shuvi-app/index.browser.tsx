import { ReactClientView } from './ReactView.client';
import { ReactServerView } from './ReactView.server';
import { IView } from '@shuvi/types/src/runtime';
import { createBrowserHistory } from './router/history';

declare const __BROWSER__: boolean;

let view: IView['server'] | IView['client'];

if (__BROWSER__) {
  view = new ReactClientView(createBrowserHistory);
} else {
  view = new ReactServerView();
}

export default view;
