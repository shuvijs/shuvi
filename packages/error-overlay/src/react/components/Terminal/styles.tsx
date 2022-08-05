import { noop as css } from '../../helpers/noop-template';

const styles = css`
  [shuvi-terminal] {
    border-radius: var(--size-gap-half);
    background-color: var(--color-ansi-bg);
    color: var(--color-ansi-fg);
  }
  [shuvi-terminal]::selection,
  [shuvi-terminal] *::selection {
    background-color: var(--color-ansi-selection);
  }
  [shuvi-terminal] * {
    color: inherit;
    background-color: transparent;
    font-family: var(--font-stack-monospace);
  }
  [shuvi-terminal] > * {
    margin: 0;
    padding: calc(var(--size-gap) + var(--size-gap-half))
      calc(var(--size-gap-double) + var(--size-gap-half));
  }

  [shuvi-terminal] pre {
    white-space: pre-wrap;
    word-break: break-word;
  }
`;

export { styles };
