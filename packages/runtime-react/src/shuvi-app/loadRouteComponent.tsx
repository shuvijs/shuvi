/// <reference lib="dom" />

import React, { useEffect, useState } from 'react';
import { Runtime } from '@shuvi/types';
import dynamic, { DynamicOptions } from './dynamic';
import { getDisplayName } from './utils/getDisplayName';
import { createRedirector } from './utils/createRedirector';

import RouteComponent = Runtime.IRouteComponent;
import { useNavigate, useCurrentRoute } from '@shuvi/router-react';

type Data = Record<string, any>;

export type IRouteProps = {
  __appContext: Data;
  __initialProps?: Data;
};

function withoutInitialProps(
  WrappedComponent: RouteComponent<React.ComponentType<any>>
): RouteComponent<React.ComponentType<IRouteProps>> {
  return ({ __appContext, ...rest }: IRouteProps) => {
    return React.createElement(WrappedComponent, {
      ...rest
    });
  };
}

function withInitialPropsServer(
  WrappedComponent: RouteComponent<React.ComponentType<any>>
): RouteComponent<React.ComponentType<IRouteProps>> {
  return ({ __initialProps, __appContext, ...rest }: IRouteProps) => {
    return React.createElement(WrappedComponent, {
      ...rest,
      ...__initialProps
    });
  };
}

function withInitialPropsClient<P = {}>(
  WrappedComponent: RouteComponent<React.ComponentType<any>>
): RouteComponent<React.FunctionComponent<IRouteProps & P>> {
  const hoc = function WithInitialProps(props: IRouteProps & P) {
    const [unmount, setUnmount] = useState(false);
    const { __appContext: appContext } = props;

    useEffect(() => () => setUnmount(true), []);

    const [initialProps, setInitialProps] = useState(
      props.__initialProps || {}
    );

    const [propsResolved, setPropsResolved] = useState(
      appContext.isFirstRender
        ? typeof props.__initialProps !== 'undefined'
        : false
    );

    const currentRoute = useCurrentRoute();
    const navigate = useNavigate();

    const getInitialProps = async () => {
      if (unmount) return;

      const redirector = createRedirector();

      const initialProps = await WrappedComponent.getInitialProps!({
        isServer: false,
        query: currentRoute.query,
        pathname: currentRoute.pathname,
        params: currentRoute.params,
        redirect: redirector.handler,
        appContext
      });

      if (redirector.redirected) {
        navigate(redirector.state!.path, { replace: true });
      } else {
        setPropsResolved(true);
        setInitialProps(initialProps);
      }
    };

    useEffect(() => {
      if (appContext.isFirstRender) {
        if (!propsResolved) getInitialProps();
      } else {
        getInitialProps();
      }
    }, [currentRoute]);

    if (!propsResolved) return null;

    const { __initialProps, __appContext, ...rest } = props;

    return React.createElement(WrappedComponent, {
      ...rest,
      ...initialProps
    });
  };

  hoc.displayName = `WithInitialProps(${getDisplayName(WrappedComponent)})`;

  if (WrappedComponent.getInitialProps) {
    hoc.getInitialProps = WrappedComponent.getInitialProps;
  }

  return hoc;
}

export function loadRouteComponent(
  loader: () => Promise<any>,
  options?: DynamicOptions<any>
) {
  const DynamicComp = dynamic<any>(
    () =>
      loader().then(mod => {
        const comp = mod.default || mod;
        if (comp.getInitialProps) {
          (DynamicComp as RouteComponent<React.ComponentType>).getInitialProps =
            comp.getInitialProps;

          // make getInitialProps work in browser
          if (typeof window !== 'undefined') {
            return withInitialPropsClient(comp);
          }

          return withInitialPropsServer(comp);
        }

        return withoutInitialProps(comp);
      }),
    options
  );

  return DynamicComp;
}
