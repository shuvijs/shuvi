import * as React from 'react';
import { ModelApp } from './ModelApp';

export type Store = ModelApp;

export function createStore(): Store {
  const store = new ModelApp();
  return store;
}

export function useStore(): Store {
  const store = React.useContext(storeContext);
  if (!store) {
    // this is especially useful in TypeScript so you don't need to be checking for null all the time
    throw new Error('useStore must be used within a StoreProvider.');
  }
  return store;
}

export function useSelector<P>(selector: (state: Store) => P): P {
  const store = useStore();
  return selector(store);
}

const storeContext = React.createContext<Store | null>(null);

export const StoreProvider = ({
  children,
  store
}: {
  store: Store;
  children?: React.ReactNode;
}) => {
  return (
    <storeContext.Provider value={store}>{children}</storeContext.Provider>
  );
};
