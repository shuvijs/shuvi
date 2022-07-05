import * as React from 'react';
import { createContext, useMemo, Context } from 'react';
import {
  IStoreManager,
  IPageError,
  errorModel
} from '@shuvi/platform-shared/esm/runtime';
import { createContainer } from '@shuvi/redox-react';

const { Provider, useSharedModel } = createContainer();

export interface IAppContext {
  appContext: { [x: string]: any };
}

const AppContext = createContext<IAppContext>(null as any);
const AppStoreContext: Context<IStoreManager> = createContext<IStoreManager>(
  null as any
);

export { AppContext, AppStoreContext };

function checkError(
  errorState: IPageError,
  ErrorComp?: React.ComponentType<IPageError>
) {
  if (errorState.errorCode !== undefined) {
    return ErrorComp && <ErrorComp {...errorState} />;
  }
  return null;
}

function AppStore({
  children = null,
  errorComp
}: {
  children: React.ReactNode;
  errorComp?: React.ComponentType<IPageError>;
}) {
  const [errorState] = useSharedModel(errorModel);
  return <>{checkError(errorState, errorComp) || children}</>;
}

export default function AppContainer({
  children,
  appContext,
  errorComp,
  storeManager,
  ...appProps
}: IAppContext & {
  children: React.ReactElement;
  errorComp?: React.ComponentType<IPageError>;
  storeManager: IStoreManager;
}) {
  const appCtx: IAppContext = useMemo(() => ({ appContext }), [appContext]);
  return (
    <AppContext.Provider value={appCtx}>
      <Provider storeManager={storeManager}>
        <AppStore errorComp={errorComp}>
          {React.cloneElement(children, {
            ...children.props,
            ...appProps
          })}
        </AppStore>
      </Provider>
    </AppContext.Provider>
  );
}
