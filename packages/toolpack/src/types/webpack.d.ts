import webpack, { Compiler } from 'webpack';
import * as webpack4 from '@types/webpack';

declare module 'webpack' {
  namespace loader {
    export type Loader = webpack4.loader.Loader;
    export type LoaderContext = webpack4.loader.LoaderContext;
  }
}
