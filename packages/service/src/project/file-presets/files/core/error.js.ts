const content = `import userError from '@shuvi/app/user/error'
import Error as platformError } from '@shuvi/app/core/platform'
export default userError || platformError
`;
export default {
  content: () => content
};
