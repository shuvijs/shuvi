import { IConfig } from '@shuvi/types';
import { IBuildOptions, build as shuviBuild } from 'shuvi/lib/cli/build';

export async function build(config: IConfig, options?: IBuildOptions) {
  await shuviBuild(config, options);
}
