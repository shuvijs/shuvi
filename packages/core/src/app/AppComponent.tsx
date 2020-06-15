import React, { ErrorInfo } from 'react';
import { Dir } from '@shuvi/react-fs';
import IndexFile from './components/IndexFile';
import RendererFile from './components/RendererFile';
import EntryFile from './components/EntryFile';
import AppFile from './components/AppFile';
import Polyfill from './components/PolyfillFile';
import RoutesFile from './components/RoutesFile';
import UserFiles from './components/UserFiles';
import ApplicationFile from './components/ApplicationFile';
import PluginsFile from './components/PluginsFile';

function App() {
  return (
    <>
      <IndexFile />
      <EntryFile />
      <Dir name="core">
        <ApplicationFile />
        <RendererFile />
        <AppFile />
        <RoutesFile />
        <PluginsFile />
        <Polyfill />
      </Dir>
      <UserFiles />
    </>
  );
}

export default class AppContainer extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('error', error);
  }

  render() {
    return <App />;
  }
}
