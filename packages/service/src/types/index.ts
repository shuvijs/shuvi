import { Api, ICliContext } from '../api';

// TODO: types
export type IRuntime = { install: (api: Api) => void } & any;
export type IPlatform = (context: ICliContext) => Promise<any[]> | any[];
