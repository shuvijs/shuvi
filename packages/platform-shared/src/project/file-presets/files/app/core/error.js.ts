import { createFileWithoutName } from '@shuvi/service/lib/project';

const content = `import userError from '@shuvi/app/user/error'
export default userError
`;
export default () =>
  createFileWithoutName({
    content: () => content
  });
