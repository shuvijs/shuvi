import * as React from 'react';
import { CloseIcon, ArrowLeftIcon, ArrowRightIcon } from '../Icons';

export type NavigationBarProps = {
  className?: string;
  previous: (() => void) | null;
  next: (() => void) | null;
  close?: () => void;
  children: React.ReactNode;
};

const NavigationBar: React.FC<NavigationBarProps> = function NavigationBar({
  children,
  className,
  previous,
  next,
  close
}) {
  const buttonLeft = React.useRef<HTMLButtonElement | null>(null);
  const buttonRight = React.useRef<HTMLButtonElement | null>(null);
  const buttonClose = React.useRef<HTMLButtonElement | null>(null);

  const [nav, setNav] = React.useState<HTMLElement | null>(null);
  const onNav = React.useCallback((el: HTMLElement) => {
    setNav(el);
  }, []);

  React.useEffect(() => {
    if (nav == null) {
      return;
    }

    const root = nav.getRootNode();
    const d = self.document;

    function handler(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        e.stopPropagation();
        if (buttonLeft.current) {
          buttonLeft.current.focus();
        }
        previous && previous();
      } else if (e.key === 'ArrowRight') {
        e.stopPropagation();
        if (buttonRight.current) {
          buttonRight.current.focus();
        }
        next && next();
      } else if (e.key === 'Escape') {
        e.stopPropagation();
        if (root instanceof ShadowRoot) {
          const a = root.activeElement;
          if (a && a !== buttonClose.current && a instanceof HTMLElement) {
            a.blur();
            return;
          }
        }

        if (close) {
          close();
        }
      }
    }

    root.addEventListener('keydown', handler as EventListener);
    if (root !== d) {
      d.addEventListener('keydown', handler);
    }
    return function () {
      root.removeEventListener('keydown', handler as EventListener);
      if (root !== d) {
        d.removeEventListener('keydown', handler);
      }
    };
  }, [close, nav, next, previous]);

  // Unlock focus for browsers like Firefox, that break all user focus if the
  // currently focused item becomes disabled.
  React.useEffect(() => {
    if (nav == null) {
      return;
    }

    const root = nav.getRootNode();
    // Always true, but we do this for TypeScript:
    if (root instanceof ShadowRoot) {
      const a = root.activeElement;

      if (previous == null) {
        if (buttonLeft.current && a === buttonLeft.current) {
          buttonLeft.current.blur();
        }
      } else if (next == null) {
        if (buttonRight.current && a === buttonRight.current) {
          buttonRight.current.blur();
        }
      }
    }
  }, [nav, next, previous]);

  return (
    <div data-nav-bar className={className}>
      <nav ref={onNav}>
        <button
          ref={buttonLeft}
          type="button"
          disabled={previous == null ? true : undefined}
          aria-disabled={previous == null ? true : undefined}
          onClick={previous ?? undefined}
        >
          <ArrowLeftIcon />
        </button>
        <button
          ref={buttonRight}
          type="button"
          disabled={next == null ? true : undefined}
          aria-disabled={next == null ? true : undefined}
          onClick={next ?? undefined}
        >
          <ArrowRightIcon />
        </button>
        &nbsp;
        {children}
      </nav>
      {close ? (
        <button
          ref={buttonClose}
          type="button"
          onClick={close}
          aria-label="Close"
        >
          <span aria-hidden="true">
            <CloseIcon />
          </span>
        </button>
      ) : null}
    </div>
  );
};

export { NavigationBar };
