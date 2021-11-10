import { Api, IApiRouteConfig, IUserRouteConfig } from '../api';

export { IUserRouteConfig, IApiRouteConfig };

export interface IRuntime {
  install(api: Api): void;
}
