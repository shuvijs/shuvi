const content = `import user404 from '@shuvi/app/user/404'
import { page404 as platform404 } from '@shuvi/app/core/platform'
import userError from '@shuvi/app/user/error'
export default user404 || userError || platform404
`;
export default {
  content: () => content
};
