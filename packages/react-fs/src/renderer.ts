import path from 'path';
import fse from 'fs-extra';
import * as React from 'react';
import TestRenderer from 'react-test-renderer';
import ReactReconciler from 'react-reconciler';
import { ReactFsReconciler } from './reconciler';
import { Type } from './types';

interface VNode {
  type: Type;
  props: Record<string, any>;
  children?: VNode[];
}

const rootsMap = new Map<string, ReactReconciler.FiberRoot>();

export function unmount(rootDir: string): boolean {
  const root = rootsMap.get(rootDir);
  if (root) {
    ReactFsReconciler.updateContainer(null, root, null, () => {
      rootsMap.delete(rootDir);
    });
    return true;
  }

  return false;
}

export function render(
  reactElement: React.ReactElement,
  rootDir: string,
  callback?: () => any
) {
  let root = rootsMap.get(rootDir);
  // Create a root Container if it doesnt exist
  if (!root) {
    fse.emptyDirSync(rootDir);
    root = ReactFsReconciler.createContainer({ dir: rootDir }, false, false);
    rootsMap.set(rootDir, root!);
  }

  // update the root Container
  return ReactFsReconciler.updateContainer(reactElement, root, null, () => {
    callback && callback();
  });
}

export async function renderOnce(
  reactElement: React.ReactElement,
  rootDir: string
) {
  const exist = await fse.pathExists(rootDir);
  if (exist) {
    await fse.emptyDir(rootDir);
  } else {
    await fse.mkdirp(rootDir);
  }

  const testRenderer = TestRenderer.create(reactElement);
  const vnodeTree = testRenderer.toJSON();
  testRenderer.unmount();
  if (Array.isArray(vnodeTree)) {
    await renderVnodes(vnodeTree as VNode[], rootDir);
  } else if (vnodeTree) {
    await renderVnode(vnodeTree as VNode, rootDir);
  }
}

async function renderVnode(vnode: VNode, dir: string) {
  if (typeof vnode !== 'object') return;

  const { type, props, children } = vnode;
  const fspath = path.join(dir, props.name);

  if (type === 'file') {
    await fse.writeFile(fspath, props.content);
  } else if (type === 'dir') {
    try {
      await fse.mkdir(fspath);
    } catch (error) {
      // dir already exists safely ignore
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  if (children && children.length) {
    await renderVnodes(children, fspath);
  }
}

async function renderVnodes(vnodes: VNode[], dir: string) {
  await Promise.all(vnodes.map((v) => renderVnode(v, dir)));
}
