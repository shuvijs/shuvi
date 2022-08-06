import { noop as css } from '../../helpers/noop-template';

export const styles = css`
  button[shuvi-data-runtime-error-collapsed-action] {
    background: none;
    border: none;
    padding: 0;
    font-size: var(--size-font-small);
    line-height: var(--size-font-bigger);
    color: var(--color-accents-3);
  }

  [shuvi-call-stack-frame]:not(:last-child) {
    margin-bottom: var(--size-gap-double);
  }

  [shuvi-call-stack-frame] > h6 {
    margin-top: 0;
    margin-bottom: var(--size-gap);
    font-family: var(--font-stack-monospace);
    color: #222;
  }
  [shuvi-call-stack-frame] > h6[shuvi-frame-expanded='false'] {
    color: #666;
  }
  [shuvi-call-stack-frame] > div {
    display: flex;
    align-items: center;
    padding-left: calc(var(--size-gap) + var(--size-gap-half));
    font-size: var(--size-font-small);
    color: #999;
  }
  [shuvi-call-stack-frame] > div > svg {
    width: auto;
    height: var(--size-font-small);
    margin-left: var(--size-gap);

    display: none;
  }

  [shuvi-call-stack-frame] > div[data-has-source] {
    cursor: pointer;
  }
  [shuvi-call-stack-frame] > div[data-has-source]:hover {
    text-decoration: underline dotted;
  }
  [shuvi-call-stack-frame] > div[data-has-source] > svg {
    display: unset;
  }
`;
