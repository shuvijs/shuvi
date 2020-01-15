import React from "react";
import ReactReconciler from "react-reconciler";
import { ReactFsReconciler } from "./reconciler";

const rootsMap = new Map<string, ReactReconciler.FiberRoot>();

export function render(
  reactElement: React.ReactElement,
  rootDir: string,
  callback?: () => void | null | undefined
) {
  let root = rootsMap.get(rootDir);
  // Create a root Container if it doesnt exist
  if (!root) {
    root = ReactFsReconciler.createContainer({ dir: rootDir }, false, false);
    rootsMap.set(rootDir, root!);
  }

  // update the root Container
  return ReactFsReconciler.updateContainer(reactElement, root, null, () => {
    callback && callback();
  });
}
