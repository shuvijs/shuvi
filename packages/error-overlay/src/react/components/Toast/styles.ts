import { noop as css } from '../../helpers/noop-template';

const styles = css`
  [shuvi-toast] {
    position: fixed;
    bottom: var(--size-gap-double);
    left: var(--size-gap-double);
    max-width: 420px;
    z-index: 9000;
  }

  @media (max-width: 440px) {
    [shuvi-toast] {
      max-width: 90vw;
      left: 5vw;
    }
  }

  [shuvi-toast-wrapper] {
    padding: 16px;
    border-radius: var(--size-gap-half);
    font-weight: 500;
    color: var(--color-ansi-bright-white);
    background-color: var(--color-ansi-red);
    box-shadow: 0px var(--size-gap-double) var(--size-gap-quad)
      rgba(0, 0, 0, 0.25);
  }
`;

export { styles };
