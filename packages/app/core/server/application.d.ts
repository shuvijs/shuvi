import { Runtime } from '@shuvi/service';
import { IAppState } from '@shuvi/platform-core';

import IApplicationModule = Runtime.IApplicationModule;

export const create: IApplicationModule<IAppState>['create'];
