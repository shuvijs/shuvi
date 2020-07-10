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
import PluginFile from './components/PluginFile';
import PluginsHashFile from './components/PluginsHashFile';

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
        <PluginFile />
        <PluginsHashFile />
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
