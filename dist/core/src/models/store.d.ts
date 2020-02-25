import { ModelApp } from "./ModelApp";
declare type Store = ModelApp;
export declare const store: ModelApp;
export declare function useStore(): Store;
export declare function useSelector<P>(selector: (state: Store) => P): P;
export {};
