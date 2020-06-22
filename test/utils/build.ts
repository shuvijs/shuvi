import { IBuildOptions, build as shuviBuild } from 'shuvi/lib/cli/apis/build';

export async function build(options: IBuildOptions = {}) {
  await shuviBuild(options);
}
