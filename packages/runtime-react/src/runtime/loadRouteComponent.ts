import React from "react";
import { parse as parseQuerystring } from "querystring";
import { RouteComponentProps } from "react-router-dom";
import { RouteComponent } from "@shuvi/core";
import dynamic, { DynamicOptions } from "./dynamic";
import { getDisplayName } from "./utils";

type Data = Record<string, any>;

type Props = RouteComponentProps & {
  __initialProps?: Data;
};

function withInitialPropsServer(
  WrappedComponent: RouteComponent<React.ComponentType<any>>
): RouteComponent<React.ComponentType<Props>> {
  return ({ __initialProps, ...rest }: Props) => {
    return React.createElement(WrappedComponent, {
      ...rest,
      ...__initialProps
    });
  };
}

function withInitialPropsClient<P = {}>(
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

    constructor(props: Props & P) {
      super(props);

      const propsResolved = typeof props.__initialProps !== "undefined";
      this.state = {
        propsResolved: propsResolved,
        initialProps: props.__initialProps || {}
      };

      if (!propsResolved) {
        this._getInitialProps();
      }
    }

    getSnapshotBeforeUpdate(prevProps: Props) {
      return prevProps.match;
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
        query: parseQuerystring(location.search),
        params: match.params
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

      const { __initialProps, ...rest } = this.props;

      return React.createElement(WrappedComponent, {
        ...rest,
        ...this.state.initialProps
      });
    }
  };

  if (WrappedComponent.getInitialProps) {
    hoc.getInitialProps = WrappedComponent.getInitialProps;
  }

  return hoc;
}

export function loadRouteComponent(
  loader: () => Promise<any>,
  options?: DynamicOptions
) {
  const dynamicComp = dynamic(
    () =>
      loader().then(mod => {
        const comp = mod.default || mod;
        if (comp.getInitialProps) {
          (dynamicComp as RouteComponent<React.ComponentType>).getInitialProps =
            comp.getInitialProps;

          // make getInitialProps work in browser
          if (typeof window !== "undefined") {
            return withInitialPropsClient(comp);
          }

          return withInitialPropsServer(comp);
        }

        return comp;
      }),
    options
  );

  return dynamicComp;
}
