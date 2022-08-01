import { css } from '@emotion/react';

const color = 'white';

export default () => (
  <div
    id="emotion"
    css={css`
      padding: 32px;
      background-color: hotpink;
      font-size: 24px;
      border-radius: 4px;
      &:hover {
        color: ${color};
      }
    `}
  >
    Hover to change color.
  </div>
);
