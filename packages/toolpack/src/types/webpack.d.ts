import webpack from 'webpack';
import { loader as l } from '@types/webpack';

declare module 'webpack' {
  namespace loader {
    export type Loader = l.Loader;
    export type LoaderContext = l.LoaderContext;
  }
}
