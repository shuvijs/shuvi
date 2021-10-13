const content = `import user500 from '@shuvi/app/user/500'
import { page500 as platform500 } from '@shuvi/app/core/platform'
import userError from '@shuvi/app/user/error'
export default user500 || userError || platform500
`;
export default {
  content: () => content
};
