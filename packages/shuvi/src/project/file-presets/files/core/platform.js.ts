import { ProjectContext } from '../../../projectContext';

export default {
  content: (context: ProjectContext) =>
    `export * from "${context.platformDir}/shuvi-app"`
};
