import { ProjectContext } from '../../projectContext';

export default {
  content: (context: ProjectContext) => {
    const codes = context.entryCodes;
    return codes.join('\n');
  }
};
