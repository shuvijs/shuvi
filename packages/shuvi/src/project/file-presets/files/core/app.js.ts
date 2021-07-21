const content = `import userApp from '@shuvi/app/user/app'
import { app as platformApp } from '@shuvi/app/core/platform'
export default userApp || platformApp
`;
export default {
  content: () => content
};
