/// <reference lib="dom" />

import React from "react";
import { Switch, Route, RouteComponentProps } from "react-router-dom";
import { RouteConfig, RouteComponent } from "@shuvi/types/core";

type Data = Record<string, any>;

// type Props = RouteComponentProps & {
//   component: RouteComponent<React.ComponentType<any>>;
//   initialProps?: Data;
// };

// class RouteWithInitialProps extends React.Component<
//   Props,
//   { propsResolved: boolean; initialProps: Data }
// > {
//   private _unlisten!: () => void;

//   constructor(props: Props) {
//     super(props);

//     const propsResolved = typeof props.initialProps !== "undefined";
//     this.state = {
//       propsResolved: propsResolved,
//       initialProps: props.initialProps || {}
//     };
//     if (!propsResolved) {
//       this._getInitialProps();
//     }

//     this._handleLocationChange = this._handleLocationChange.bind(this);
//   }

//   async componentDidMount() {
//     const { history } = this.props;
//     this._unlisten = history.listen(this._handleLocationChange);
//     if (history.action !== "POP") {
//       this._getInitialProps();
//     }
//   }

//   componentWillUnmount() {
//     this._unlisten();
//   }

//   private async _getInitialProps() {
//     const { match, location, component } = this.props;
//     const initialProps = await component.getInitialProps!({
//       isServer: false,
//       pathname: location.pathname,
//       query: match.params
//     });
//     this.setState({
//       initialProps
//     });
//   }

//   private _handleLocationChange() {
//     this._getInitialProps();
//   }

//   render() {
//     if (!this.state.propsResolved) {
//       return null;
//     }

//     return React.createElement(this.props.component, {
//       ...this.props,
//       ...this.state.initialProps
//     });
//   }
// }

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
