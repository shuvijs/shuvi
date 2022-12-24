import * as path from 'path';
import * as fs from 'fs';
import logger from '@shuvi/utils/logger';
import {
  eventBuildOptimize,
  eventPackageDetected,
  eventBuildFeatureUsage
} from './events';
import { recursiveReadDir } from '@shuvi/utils/recursiveReaddir';
import { getJavaScriptInfo } from '../bundler/typescript';
import { IPluginContext, Telemetry } from '../core';

export const analysis = async ({
  context,
  telemetry
}: {
  context: IPluginContext;
  telemetry: Telemetry;
}) => {
  if (!telemetry || !context) {
    return;
  }
  logger.info('Start collecting data...');

  const analysisBegin = process.hrtime();
  const routesExtensions = ['ts', 'tsx', 'js', 'jsx'];

  const routePaths = await recursiveReadDir(context.paths.routesDir, {
    filter: new RegExp(`\\.(?:${routesExtensions.join('|')})$`)
  });

  const middlewareCount = routePaths.filter(path =>
    /middleware\..*/i.test(path)
  ).length;

  const srcDirFiles = await fs.promises.readdir(context.paths.srcDir, {
    encoding: 'utf-8'
  });

  const hasStatic404 = srcDirFiles.some(value => /error/i.test(value));
  const pageLoadersPath = path.join(
    context.paths.appDir,
    '/files/page-loaders.js'
  );

  const pageLoadersFile = await fs.promises.readFile(pageLoadersPath, {
    encoding: 'utf8'
  });

  const totalLoaderCount = pageLoadersFile
    .toString()
    .split('\n')
    .filter(loader => loader.startsWith('import')).length;

  const { useTypeScript } = getJavaScriptInfo();

  const analysisEnd = process.hrtime(analysisBegin);

  const packageDetectedEvents = await eventPackageDetected(
    context.paths.rootDir
  );
  telemetry.record(packageDetectedEvents);
  telemetry.record(
    eventBuildFeatureUsage({
      compiler: context.config?.compiler,
      experimental: context.config?.experimental
    })
  );
  telemetry.record(
    eventBuildOptimize(routePaths, {
      durationInSeconds: analysisEnd[0],
      hasStatic404,
      middlewareCount,
      totalLoaderCount,
      useTypeScript
    })
  );
};
