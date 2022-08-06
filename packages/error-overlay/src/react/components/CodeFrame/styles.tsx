import { noop as css } from '../../helpers/noop-template';

const styles = css`
  [shuvi-codeframe] {
    overflow: auto;
    border-radius: var(--size-gap-half);
    background-color: var(--color-ansi-bg);
    color: var(--color-ansi-fg);
  }
  [shuvi-codeframe]::selection,
  [shuvi-codeframe] *::selection {
    background-color: var(--color-ansi-selection);
  }
  [shuvi-codeframe] * {
    color: inherit;
    background-color: transparent;
    font-family: var(--font-stack-monospace);
  }

  [shuvi-codeframe] > * {
    margin: 0;
    padding: calc(var(--size-gap) + var(--size-gap-half))
      calc(var(--size-gap-double) + var(--size-gap-half));
  }
  [shuvi-codeframe] > div {
    display: inline-block;
    width: auto;
    min-width: 100%;
    border-bottom: 1px solid var(--color-ansi-bright-black);
  }
  [shuvi-codeframe] > div > p {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    margin: 0;
  }
  [shuvi-codeframe] > div > p:hover {
    text-decoration: underline dotted;
  }
  [shuvi-codeframe] div > p > svg {
    width: auto;
    height: 1em;
    margin-left: 8px;
  }
  [shuvi-codeframe] div > pre {
    overflow: hidden;
    display: inline-block;
  }
`;

export { styles };
