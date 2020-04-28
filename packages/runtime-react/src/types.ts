import { Runtime } from '@shuvi/types';

export type IReactAppData = {
  appProps?: Record<string, any>;
  dynamicIds?: Array<string | number>;
  routeProps: IRouteProps;
};

export interface IAppContainerProps {
  routeProps: IRouteProps;
}

export type IRouteProps = {
  [x: string]: any;
};

export type IAppComponent = Runtime.IAppComponent<React.Component, any>;

export type IRouteComponent = Runtime.IRouteComponent<React.Component, any>;

export type IReactRenderer = Runtime.IRenderer<
  React.ComponentType,
  IReactAppData
>;
