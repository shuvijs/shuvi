import { tsDeclareModule } from '../../file-snippets';
import { ProjectContext } from '../../projectContext';

export default {
  content: (context: ProjectContext) =>
    tsDeclareModule(Object.fromEntries(context.exports.entries()), '@shuvi/app')
};
