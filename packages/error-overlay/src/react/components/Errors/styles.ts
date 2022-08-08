import { noop as css } from '../../helpers/noop-template';

export const styles = css`
  button[data-runtime-error-collapsed-action] {
    background: none;
    border: none;
    padding: 0;
    font-size: var(--size-font-small);
    line-height: var(--size-font-bigger);
    color: var(--color-accents-3);
  }

  [data-call-stack-frame]:not(:last-child) {
    margin-bottom: var(--size-gap-double);
  }

  [data-call-stack-frame] > h6 {
    margin-top: 0;
    margin-bottom: var(--size-gap);
    font-family: var(--font-stack-monospace);
    color: #222;
  }
  [data-call-stack-frame] > h6[data-frame-expanded='false'] {
    color: #666;
  }
  [data-call-stack-frame] > div {
    display: flex;
    align-items: center;
    padding-left: calc(var(--size-gap) + var(--size-gap-half));
    font-size: var(--size-font-small);
    color: #999;
  }
  [data-call-stack-frame] > div > svg {
    width: auto;
    height: var(--size-font-small);
    margin-left: var(--size-gap);

    display: none;
  }

  [data-call-stack-frame] > div[data-has-source] {
    cursor: pointer;
  }
  [data-call-stack-frame] > div[data-has-source]:hover {
    text-decoration: underline dotted;
  }
  [data-call-stack-frame] > div[data-has-source] > svg {
    display: unset;
  }

  [data-codeframe] {
    overflow: auto;
    border-radius: var(--size-gap-half);
    background-color: var(--color-ansi-bg);
    color: var(--color-ansi-fg);
  }
  [data-codeframe]::selection,
  [data-codeframe] *::selection {
    background-color: var(--color-ansi-selection);
  }
  [data-codeframe] * {
    color: inherit;
    background-color: transparent;
    font-family: var(--font-stack-monospace);
  }

  [data-codeframe] > * {
    margin: 0;
    padding: calc(var(--size-gap) + var(--size-gap-half))
      calc(var(--size-gap-double) + var(--size-gap-half));
  }
  [data-codeframe] > div {
    display: inline-block;
    width: auto;
    min-width: 100%;
    border-bottom: 1px solid var(--color-ansi-bright-black);
  }
  [data-codeframe] > div > p {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    margin: 0;
  }
  [data-codeframe] > div > p:hover {
    text-decoration: underline dotted;
  }
  [data-codeframe] div > p > svg {
    width: auto;
    height: 1em;
    margin-left: 8px;
  }
  [data-codeframe] div > pre {
    overflow: hidden;
    display: inline-block;
  }
`;
