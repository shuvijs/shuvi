import { ReactClientView } from './ReactView.client';
import { ReactServerView } from './ReactView.server';
import { IViewClient, IViewServer } from '@shuvi/types/src/runtime';
import { createHashHistory } from './router/history';

declare const __BROWSER__: boolean;

let view: IViewClient | IViewServer;

if (__BROWSER__) {
  view = new ReactClientView(createHashHistory);
} else {
  view = new ReactServerView();
}

export default view;
