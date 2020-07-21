import { ReactClientView } from './ReactView.client';
import { createHashHistory } from '../router/history';

export default new ReactClientView(createHashHistory);
