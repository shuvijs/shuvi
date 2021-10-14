const content = `import user404 from '@shuvi/app/user/404'
import userError from '@shuvi/app/user/error'
export default user404 || userError
`;
export default {
  content: () => content
};
