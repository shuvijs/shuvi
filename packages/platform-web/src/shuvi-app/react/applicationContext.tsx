import * as React from 'react';
import { IApplication } from '@shuvi/platform-shared/shared';

export const ApplicationContext = React.createContext<IApplication>(
  null as any
);

export function AppProvider({
  app,
  children
}: React.PropsWithChildren<{
  app: IApplication;
}>) {
  return (
    <ApplicationContext.Provider value={app}>
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApp() {
  return React.useContext(ApplicationContext);
}
