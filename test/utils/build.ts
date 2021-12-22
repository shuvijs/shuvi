import { IBuildOptions, build as shuviBuild } from 'shuvi/lib/tasks/build';

export async function build(options: IBuildOptions = {}) {
  return await shuviBuild(options);
}
