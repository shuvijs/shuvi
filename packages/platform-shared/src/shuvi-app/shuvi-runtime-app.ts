/**
 * export for users
 *
 * eg:
 *  import {} from '@shuvi/runtime/app'
 *
 */
import { IAppModule } from '../shared/lifecycle';

export type InitFunction = IAppModule['init'];

export type AppComponentFunction = IAppModule['appComponent'];

export type AppContextFunction = IAppModule['appContext'];

export type DisposeFunction = IAppModule['dispose'];
