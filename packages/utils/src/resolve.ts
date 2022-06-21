import * as path from 'path';
import * as _resolve from 'resolve';

export function resolve(id: string, options?: _resolve.AsyncOpts) {
  return new Promise((resolve, reject) => {
    _resolve.default(id, options || {}, (err, res) => {
      if (err) {
        return reject(err);
      }

      resolve(res);
    });
  });
}

export function resolveSync(id: string, options?: _resolve.SyncOpts) {
  return _resolve.sync(id, options);
}

export function resolveLocal(
  m: string,
  { sub, basedir }: { sub?: string; basedir?: string } = {}
) {
  const pck = path.dirname(
    resolveSync(`${m}/package.json`, basedir ? { basedir } : {})
  );
  return sub ? `${pck}/${sub}` : pck;
}
