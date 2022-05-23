import { createContext, Context } from 'react';

export interface LoadersData {
  [id: string]: {
    data: any;
    loading: boolean;
    error?: any;
  };
}

export interface ILoaderContext {
  loadersData: LoadersData;
  willHydrate?: boolean;
}

export const LoaderContext: Context<ILoaderContext> =
  createContext<ILoaderContext>({
    loadersData: {},
    willHydrate: true
  });
