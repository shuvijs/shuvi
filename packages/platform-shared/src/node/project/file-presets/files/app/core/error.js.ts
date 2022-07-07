import { defineFile } from '../../..';

const content = `import userError from '@shuvi/app/user/error'
export default userError
`;
export default () =>
  defineFile({
    content: () => content
  });
