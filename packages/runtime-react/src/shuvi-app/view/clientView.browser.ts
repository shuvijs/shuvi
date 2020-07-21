import { ReactClientView } from './ReactView.client';
import { createBrowserHistory } from '../router/history';

export default new ReactClientView(createBrowserHistory);
