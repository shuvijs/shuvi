import { Runtime } from "@shuvi/types";

export type IReactAppData = {
  routeProps: IRouteProps;
  dynamicIds: Array<string | number>;
};

export type IRouteProps = {
  [x: string]: any;
};

export interface IAppProps {
  routeProps: IRouteProps;
}

export type IReactRenderer = Runtime.IRenderer<
  React.ComponentType,
  IReactAppData
>;
