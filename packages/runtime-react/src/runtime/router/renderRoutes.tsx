/// <reference lib="dom" />

import React from "react";
import { Switch, Route, RouteComponentProps } from "react-router-dom";
import { RouteConfig, RouteComponent } from "@shuvi/types/core";
import { getDisplayName } from "../utils";

type Data = Record<string, any>;

type Props = RouteComponentProps & {
  initialProps?: Data;
};

export function withInitialProps<P = {}>(
  WrappedComponent: RouteComponent<React.ComponentType<any>>
): RouteComponent<React.ComponentClass<Props & P>> {
  const hoc: RouteComponent<React.ComponentClass<
    Props & P
  >> = class WithInitialProps extends React.Component<
    Props & P,
    { propsResolved: boolean; initialProps: Data }
  > {
    static displayName = `WithInitialProps(${getDisplayName(
      WrappedComponent
    )})`;

    static getSnapshotBeforeUpdate(prevProps: Props) {
      return prevProps.match;
    }

    constructor(props: Props & P) {
      super(props);

      const propsResolved = typeof props.initialProps !== "undefined";
      this.state = {
        propsResolved: propsResolved,
        initialProps: props.initialProps || {}
      };

      if (!propsResolved) {
        this._getInitialProps();
      }
    }

    componentDidUpdate(prevProps: Readonly<Props>) {
      const shallow = false;
      const isUrlChanged = prevProps.match.url !== this.props.match.url;
      if (isUrlChanged) {
        if (shallow) {
          const isRouteMatchChange =
            prevProps.match.path !== this.props.match.path;
          if (isRouteMatchChange) {
            this._getInitialProps();
          }
        } else {
          this._getInitialProps();
        }
      }
    }

    private async _getInitialProps() {
      const { match, location } = this.props;
      const initialProps = await WrappedComponent.getInitialProps!({
        isServer: false,
        pathname: location.pathname,
        query: match.params
      });
      this.setState({
        propsResolved: true,
        initialProps
      });
    }

    render() {
      if (!this.state.propsResolved) {
        return null;
      }

      return React.createElement(WrappedComponent, {
        ...this.props,
        ...this.state.initialProps
      });
    }
  };

  if (WrappedComponent.getInitialProps) {
    hoc.getInitialProps = WrappedComponent.getInitialProps;
  }

  return hoc;
}

function renderRoutes(
  routes?: RouteConfig[],
  initialProps: Data = {},
  switchProps: Data = {}
) {
  return routes ? (
    <Switch {...switchProps}>
      {routes.map((route, i) => (
        <Route
          key={route.key || i}
          path={route.path}
          exact={route.exact}
          strict={route.strict}
          sensitive={route.sensitive}
          render={props => {
            const childRoutes = renderRoutes(route.routes, initialProps, {
              location: props.location
            });
            let { component: Component } = route;
            if (Component) {
              return <Component {...props}>{childRoutes}</Component>;
            }

            return childRoutes;
          }}
        />
      ))}
    </Switch>
  ) : null;
}

export default renderRoutes;
