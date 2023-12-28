import * as React from 'react';
import { Application } from '../../shared';

export const ApplicationContext = React.createContext<Application>(null as any);

export function AppProvider({
  app,
  children
}: React.PropsWithChildren<{
  app: Application;
}>) {
  return (
    <ApplicationContext.Provider value={app}>
      {children}
    </ApplicationContext.Provider>
  );
}

export function useAppContext() {
  return React.useContext(ApplicationContext).context;
}
