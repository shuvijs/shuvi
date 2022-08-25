import { BuildInfo, FileId, FileInfo } from './types';

export const appendChangedFiles = (
  buildInfo: BuildInfo,
  changedFiles: ReadonlyMap<FileId, FileInfo>
) => {
  const { collectedChangedFiles } = buildInfo;
  for (const [file, info] of changedFiles) {
    collectedChangedFiles.set(file, info);
  }
};
