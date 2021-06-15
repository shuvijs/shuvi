import { exportsFromObject } from '../../file-snippets';
import { ProjectContext } from '../../projectContext';

export default {
  content: (context: ProjectContext) =>
    exportsFromObject(Object.fromEntries(context.exports.entries()))
};
