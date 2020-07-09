import { execSync, ExecSyncOptions } from 'child_process';

export function runShuviCommand(
  command: string,
  args: string[],
  options?: ExecSyncOptions
) {
  const result = execSync(`yarn shuvi ${command} ${args.join(' ')}`, {
    stdio: 'pipe',
    ...options
  });
  return result.toString();
}
