import * as React from 'react';

import * as ErrorTypeHandler from './errorTypeHandler';
import { ShadowPortal } from './components/ShadowPortal';
import { BuildError } from './container/BuildError';
import { RuntimeError, SupportedErrorEvent } from './container/RuntimeError';
import {
  TYPE_BUILD_OK,
  TYPE_REFRESH,
  TYPE_BUILD_ERROR,
  TYPE_UNHANDLED_ERROR,
  TYPE_UNHANDLED_REJECTION
} from '../constants';

import { Base } from './styles/Base';
import { ComponentStyles } from './styles/ComponentStyles';
import { CssReset } from './styles/CssReset';

type OverlayState = {
  nextId: number;
  buildError: string | null;
  errors: SupportedErrorEvent[];
};

function reducer(
  state: OverlayState,
  ev: ErrorTypeHandler.ErrorTypeEvent
): OverlayState {
  switch (ev.type) {
    case TYPE_BUILD_OK: {
      return { ...state, buildError: null };
    }
    case TYPE_REFRESH: {
      return { ...state, buildError: null, errors: [] };
    }
    case TYPE_BUILD_ERROR: {
      return { ...state, buildError: ev.message };
    }
    case TYPE_UNHANDLED_ERROR:
    case TYPE_UNHANDLED_REJECTION: {
      return {
        ...state,
        nextId: state.nextId + 1,
        errors: [
          ...state.errors.filter(err => {
            // Filter out duplicate errors
            return err.event.reason !== ev.reason;
          }),
          { id: state.nextId, event: ev }
        ]
      };
    }
    default: {
      return state;
    }
  }
}

export type ErrorOverlayProps = {
  dismissRuntimeErrors: () => void;
};

export const ErrorOverlay: React.FC<ErrorOverlayProps> = function ErrorOverlay({
  dismissRuntimeErrors
}) {
  const [state, dispatch] = React.useReducer<
    React.Reducer<OverlayState, ErrorTypeHandler.ErrorTypeEvent>
  >(reducer, {
    nextId: 1,
    buildError: null,
    errors: []
  });

  React.useEffect(() => {
    ErrorTypeHandler.on(dispatch);
    return function () {
      ErrorTypeHandler.off(dispatch);
    };
  }, [dispatch]);

  const hasBuildError = state.buildError != null;
  const hasRuntimeErrors = Boolean(state.errors.length);

  const isMounted = hasBuildError || hasRuntimeErrors;

  return (
    <React.Fragment>
      {isMounted ? (
        <ShadowPortal>
          <CssReset />
          <Base />
          <ComponentStyles />

          {hasBuildError ? (
            <BuildError error={state.buildError!} />
          ) : hasRuntimeErrors ? (
            <RuntimeError errors={state.errors} close={dismissRuntimeErrors} />
          ) : undefined}
        </ShadowPortal>
      ) : undefined}
    </React.Fragment>
  );
};
