export * from './application';
export * from './runPlugins';
export * as AppHooks from './hooks';
export {
  getAppStore,
  IAppState,
  IAppStore,
  IErrorHandler,
  getErrorHandler
} from './appStore';
export { getAppData, getPageData } from './helper';

type Foo<A> = {
  //look the above 'A' is conflicting with the below 'A'
  map: <B>(f: (_: A) => B) => Foo<B>;
};

const makeFoo = <A>(a: A): Foo<A> => ({
  map: f => makeFoo(f(a)) //error!
});
