import path from "path";
import fse from "fs-extra";
import React from "react";
import TestRenderer from "react-test-renderer";
import ReactReconciler from "react-reconciler";
import { ReactFsReconciler } from "./reconciler";
import { Type } from "./types";

interface VNode {
  type: Type;
  props: Record<string, any>;
  children?: VNode[];
}

const rootsMap = new Map<string, ReactReconciler.FiberRoot>();

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
    await renderVnodes(vnodeTree, rootDir);
  } else {
    await renderVnode(vnodeTree, rootDir);
  }
}

async function renderVnode({ type, props, children }: VNode, dir: string) {
  const fspath = path.join(dir, props.name);

  if (type === "file") {
    await fse.writeFile(fspath, props.content);
  } else if (type === "dir") {
    await fse.mkdir(fspath);
  }

  if (children && children.length) {
    await renderVnodes(children, fspath);
  }
}

async function renderVnodes(vnodes: VNode[], dir: string) {
  await Promise.all(vnodes.map(v => renderVnode(v, dir)));
}
