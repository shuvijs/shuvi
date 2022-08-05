import * as React from 'react';

import { ShadowPortal } from './components/ShadowPortal';
import { BuildError, RuntimeError } from './container';

export const ReactDevOverlay: React.FunctionComponent =
  function ReactDevOverlay() {
    let hasBuildError = false;
    let hasRuntimeErrors = false;

    return (
      <ShadowPortal>
        {hasBuildError ? (
          <BuildError errors={'build error'} />
        ) : hasRuntimeErrors ? (
          <RuntimeError errors={'runtime error'} />
        ) : undefined}
      </ShadowPortal>
    );
  };
