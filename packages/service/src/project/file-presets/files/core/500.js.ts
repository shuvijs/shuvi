const content = `import user500 from '@shuvi/app/user/500'
import userError from '@shuvi/app/user/error'
export default user500 || userError
`;
export default {
  content: () => content
};
