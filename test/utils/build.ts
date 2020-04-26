import { IApiConfig } from '@shuvi/types';
import { IBuildOptions, build as shuviBuild } from 'shuvi/lib/cli/apis/build';

export async function build(config: IApiConfig, options?: IBuildOptions) {
  await shuviBuild(config, options);
}
