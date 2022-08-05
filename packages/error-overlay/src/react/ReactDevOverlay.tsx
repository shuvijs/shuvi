import * as React from 'react';

import { ShadowPortal } from './components/ShadowPortal';
import { BuildError, RuntimeError } from './container';
import { Base, ComponentStyles, CssReset } from './styles';

export const ReactDevOverlay: React.FunctionComponent =
  function ReactDevOverlay() {
    let hasBuildError = true;
    let hasRuntimeErrors = false;

    return (
      <ShadowPortal>
        <CssReset />
        <Base />
        <ComponentStyles />
        {hasBuildError ? (
          <BuildError error={'build error'} />
        ) : hasRuntimeErrors ? (
          <RuntimeError errors={'runtime error'} />
        ) : undefined}
      </ShadowPortal>
    );
  };
