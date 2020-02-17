import { useObserver } from "mobx-react";
import { ModelApp } from "./ModelApp";

type Store = ModelApp;

export const store = new ModelApp();

export function useStore(): Store {
  return store as Store;
}

export function useSelector<P>(selector: (state: Store) => P): P {
  return useObserver(() => selector(store));
}
