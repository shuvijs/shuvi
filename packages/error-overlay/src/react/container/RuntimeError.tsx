import * as React from 'react';
import { UnhandledError, UnhandledRejection } from '../errorTypeHandler';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader
} from '../components/Dialog';
import { NavigationBar } from '../components/NavigationBar';
import { Overlay } from '../components/Overlay';
import { Toast } from '../components/Toast';
import { getErrorByType, ReadyRuntimeError } from '../helpers/getErrorByType';
import { getErrorSource } from '../helpers/nodeStackFrames';
import { noop as css } from '../helpers/noop-template';
import { CloseIcon, WarningIcon } from '../components/Icons';
import { Errors } from '../components/Errors';
import {
  SERVER_TYPE_ERROR,
  TYPE_UNHANDLED_ERROR,
  TYPE_UNHANDLED_REJECTION
} from '../constants';

export type SupportedErrorEvent = {
  id: number;
  event: UnhandledError | UnhandledRejection;
};
export type RuntimeErrorProps = { errors: SupportedErrorEvent[] };

type ReadyErrorEvent = ReadyRuntimeError;

function getErrorSignature(ev: SupportedErrorEvent): string {
  const { event } = ev;
  switch (event.type) {
    case TYPE_UNHANDLED_ERROR:
    case TYPE_UNHANDLED_REJECTION: {
      return `${event.reason.name}::${event.reason.message}::${event.reason.stack}`;
    }
    default: {
    }
  }

  return '';
}

export const RuntimeError: React.FC<RuntimeErrorProps> = function RuntimeError({
  errors
}) {
  const [lookups, setLookups] = React.useState(
    {} as { [eventId: string]: ReadyErrorEvent }
  );

  const [readyErrors, nextError] = React.useMemo<
    [ReadyErrorEvent[], SupportedErrorEvent | null]
  >(() => {
    let ready: ReadyErrorEvent[] = [];
    let next: SupportedErrorEvent | null = null;

    // Ensure errors are displayed in the order they occurred in:
    for (let idx = 0; idx < errors.length; ++idx) {
      const e = errors[idx];
      const { id } = e;
      if (id in lookups) {
        ready.push(lookups[id]);
        continue;
      }

      // Check for duplicate errors
      if (idx > 0) {
        const prev = errors[idx - 1];
        if (getErrorSignature(prev) === getErrorSignature(e)) {
          continue;
        }
      }

      next = e;
      break;
    }

    return [ready, next];
  }, [errors, lookups]);

  const isLoading = React.useMemo<boolean>(() => {
    return readyErrors.length < 1 && Boolean(errors.length);
  }, [errors.length, readyErrors.length]);

  React.useEffect(() => {
    if (nextError == null) {
      return;
    }
    let mounted = true;

    getErrorByType(nextError).then(resolved => {
      // We don't care if the desired error changed while we were resolving,
      // thus we're not tracking it using a ref. Once the work has been done,
      // we'll store it.
      if (mounted) {
        setLookups(m => ({ ...m, [resolved.id]: resolved }));
      }
    });

    return () => {
      mounted = false;
    };
  }, [nextError]);

  const [displayState, setDisplayState] = React.useState<
    'minimized' | 'fullscreen' | 'hidden'
  >('fullscreen');
  const [activeIdx, setActiveIndex] = React.useState<number>(0);
  const previous = React.useCallback((e?: MouseEvent | TouchEvent) => {
    e?.preventDefault();
    setActiveIndex(v => Math.max(0, v - 1));
  }, []);
  const next = React.useCallback(
    (e?: MouseEvent | TouchEvent) => {
      e?.preventDefault();
      setActiveIndex(v => Math.max(0, Math.min(readyErrors.length - 1, v + 1)));
    },
    [readyErrors.length]
  );

  const activeError = React.useMemo<ReadyErrorEvent | null>(
    () => readyErrors[activeIdx] ?? null,
    [activeIdx, readyErrors]
  );

  const minimize = React.useCallback((e?: MouseEvent | TouchEvent) => {
    e?.preventDefault();
    setDisplayState('minimized');
  }, []);
  const hide = React.useCallback((e?: MouseEvent | TouchEvent) => {
    e?.preventDefault();
    setDisplayState('hidden');
  }, []);
  const fullscreen = React.useCallback(
    (e?: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e?.preventDefault();
      setDisplayState('fullscreen');
    },
    []
  );

  if (isLoading) {
    return <Overlay />;
  }

  if (errors.length < 1 || activeError == null || displayState === 'hidden') {
    return null;
  }

  if (displayState === 'minimized') {
    return (
      <Toast className="shuvi-toast-errors-parent" onClick={fullscreen}>
        <div className="shuvi-toast-errors">
          <WarningIcon />
          <span>
            {readyErrors.length} error{readyErrors.length > 1 ? 's' : ''}
          </span>
          <button
            data-shuvi-toast-errors-hide-button
            className="shuvi-toast-errors-hide-button"
            type="button"
            onClick={e => {
              e.stopPropagation();
              hide();
            }}
            aria-label="Hide Errors"
          >
            <CloseIcon />
          </button>
        </div>
      </Toast>
    );
  }

  const isServerError = getErrorSource(activeError.error) === SERVER_TYPE_ERROR;

  return (
    <Overlay>
      <Dialog
        type="error"
        aria-labelledby="shuvi__container_errors_label"
        aria-describedby="shuvi__container_errors_desc"
        onClose={isServerError ? undefined : minimize}
      >
        <DialogContent>
          <DialogHeader className="shuvi-container-errors-header">
            <NavigationBar
              previous={activeIdx > 0 ? previous : null}
              next={activeIdx < readyErrors.length - 1 ? next : null}
              close={isServerError ? undefined : minimize}
            >
              <small>
                <span>{activeIdx + 1}</span> of{' '}
                <span>{readyErrors.length}</span> runtime error
                {readyErrors.length < 2 ? '' : 's'}
              </small>
            </NavigationBar>
            <h1 id="shuvi__container_errors_label">
              {isServerError
                ? 'Server Runtime Error'
                : 'Unhandled Runtime Error'}
            </h1>
            <p id="shuvi__container_errors_desc">
              {activeError.error.name}: {activeError.error.message}
            </p>
            {isServerError ? (
              <div>
                <small>
                  This error happened while generating the page. Any console
                  logs will be displayed in the terminal window.
                </small>
              </div>
            ) : undefined}
          </DialogHeader>
          <DialogBody className="shuvi-container-errors-body">
            <Errors key={activeError.id.toString()} error={activeError} />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </Overlay>
  );
};

export const styles = css`
  .shuvi-container-errors-header > h1 {
    font-size: var(--size-font-big);
    line-height: var(--size-font-bigger);
    font-weight: bold;
    margin: 0;
    margin-top: calc(var(--size-gap-double) + var(--size-gap-half));
  }
  .shuvi-container-errors-header small {
    font-size: var(--size-font-small);
    color: var(--color-accents-1);
    margin-left: var(--size-gap-double);
  }
  .shuvi-container-errors-header small > span {
    font-family: var(--font-stack-monospace);
  }
  .shuvi-container-errors-header > p {
    font-family: var(--font-stack-monospace);
    font-size: var(--size-font-small);
    line-height: var(--size-font-big);
    font-weight: bold;
    margin: 0;
    margin-top: var(--size-gap-half);
    color: var(--color-ansi-red);
    white-space: pre-wrap;
  }
  .shuvi-container-errors-header > div > small {
    margin: 0;
    margin-top: var(--size-gap-half);
  }
  .shuvi-container-errors-header > p > a {
    color: var(--color-ansi-red);
  }

  .shuvi-container-errors-body > h5:not(:first-child) {
    margin-top: calc(var(--size-gap-double) + var(--size-gap));
  }
  .shuvi-container-errors-body > h5 {
    margin-bottom: var(--size-gap);
  }

  .shuvi-toast-errors-parent {
    cursor: pointer;
    transition: transform 0.2s ease;
  }
  .shuvi-toast-errors-parent:hover {
    transform: scale(1.1);
  }
  .shuvi-toast-errors {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
  .shuvi-toast-errors > svg {
    margin-right: var(--size-gap);
  }
  .shuvi-toast-errors-hide-button {
    margin-left: var(--size-gap-triple);
    border: none;
    background: none;
    color: var(--color-ansi-bright-white);
    padding: 0;
    transition: opacity 0.25s ease;
    opacity: 0.7;
  }
  .shuvi-toast-errors-hide-button:hover {
    opacity: 1;
  }
`;
