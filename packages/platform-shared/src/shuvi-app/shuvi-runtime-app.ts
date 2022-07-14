/**
 * export for users
 *
 * eg:
 *  import {} from '@shuvi/runtime/app'
 *
 */
import { IAppModule as _IAppModule } from '../shared/lifecycle';

type AppModule = Required<_IAppModule>;

export type InitFunction = AppModule['init'];

export type AppComponentFunction = AppModule['appComponent'];

export type AppContextFunction = AppModule['appContext'];

export type DisposeFunction = AppModule['dispose'];
