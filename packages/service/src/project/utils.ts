import fs from 'fs'
import path from 'path'
import { watch, WatchEvent } from '@shuvi/utils/lib/fileWatcher';
import { recursiveReadDirSync } from '@shuvi/utils/lib/recursiveReaddir';
import { getTypeScriptInfo } from '@shuvi/utils/lib/detectTypescript';
import { withExts } from '@shuvi/utils/lib/file';
import { reactive, FileOptions } from './file-manager'

export type CreateFileOptions = {
  name: string,
  content: (event: WatchEvent) => string
  dependencies?: string[]
}

export const createFile = (options: CreateFileOptions): FileOptions => {

  const { name, dependencies = [], content } = options
  const files: string[] = [];
  const directories: string[] = [];
  dependencies.forEach((filepath: string) => {
    if (fs.existsSync(filepath)) {
      if (fs.statSync(filepath).isDirectory()) {
        directories.push(filepath)
      } else {
        files.push(filepath)
      }
    } else {
      files.push(filepath)
    }
  });
  const getAllFiles = () => {
    const allFiles: string[] = []
    for (const dir of directories) {
      allFiles.push(...recursiveReadDirSync(dir, { rootDir: '' }))
    }
    return allFiles
  }
  const state = reactive({
    content: content({ changes: [], removals: [], getAllFiles })
  })

  let watcher: () => void
  const getWatcher = () => {
    return watch({ files, directories }, (event) => {
      state.content = content(event)
    })
  }
  const mounted = () => {
    watcher = getWatcher()
  }
  const unmounted = () => {
    watcher()
  }

  const getContent = () => state.content
  return {
    name,
    content: getContent,
    mounted,
    unmounted
  }
}

export const getUserCustomFileCandidates = (rootPath: string, fileName: string, fallbackType: 'nullish' | 'noop' | 'noopFn'): string[] => {
  const SRC_DIR = 'src'
  const { useTypeScript } = getTypeScriptInfo(rootPath);
  const moduleFileExtensions = useTypeScript
    ? ['.tsx', '.ts', '.js', '.jsx']
    : ['.js', '.jsx', '.tsx', '.ts'];
  const fallbackMap: Record<typeof fallbackType, string> = {
    nullish: require.resolve('@shuvi/utils/lib/nullish'),
    noop: require.resolve('@shuvi/utils/lib/noop'),
    noopFn: require.resolve('@shuvi/utils/lib/noopFn')
  }
  const fallback = fallbackMap[fallbackType] || fallbackMap['nullish']
  return [...withExts(path.join(rootPath, SRC_DIR, fileName), moduleFileExtensions), fallback]
}
