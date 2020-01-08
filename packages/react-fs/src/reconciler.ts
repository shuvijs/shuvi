import React from "react";
import path from "path";
import fse from "fs-extra";
import ReactReconciler, { OpaqueHandle } from "react-reconciler";

export interface BuiltInElements {
  file: {
    name: string;
    content: string;
  };
  dir: {
    name: string;
    children?: JSX.Element | JSX.Element[] | null;
  };
}

type Type = "file" | "dir";
type Props = {
  name: string;
} & {
  [x: string]: any;
};
type Container = { dir: string };
type Instance = {
  type: Type;
  dir: string;
  name: string;
  fd?: number;
  content?: string;
};
type TextInstance = null;
type HydratableInstance = unknown;
type PublicInstance = Instance;
type HostContext = {
  dir: string | null;
};
type UpdatePayload = {
  newName?: string;
  newContent?: string;
};

function traverseUp(tree: OpaqueHandle, visitor: (node: OpaqueHandle) => void) {
  let parent: OpaqueHandle | null = tree;
  while ((parent = parent.return) !== null) {
    visitor(parent);
  }
}

function getDir(rootDir: string, internalInstanceHandle: OpaqueHandle) {
  let pathSegments: string[] = [];
  traverseUp(internalInstanceHandle, node => {
    if (node.elementType === "dir") {
      pathSegments.push(node.memoizedProps.name);
    }
  });
  return path.join(rootDir, ...pathSegments.reverse());
}

function appendChild(child: Instance) {
  const fsPath = path.join(child.dir, child.name);
  switch (child.type) {
    case "file":
      fse.ensureDirSync(child.dir);
      const fd = (child.fd = fse.openSync(fsPath, "w+"));
      fse.writeSync(fd, child.content, 0);
      break;
    case "dir":
      fse.ensureDirSync(fsPath);
      break;
    default:
      break;
  }
}

function removeChild(child: Instance) {
  const fsPath = path.join(child.dir, child.name);
  fse.removeSync(fsPath);
}

const ReactFileSystem = ReactReconciler(({
  supportsMutation: true,
  getPublicInstance(instance: Instance): PublicInstance {
    return instance;
  },
  getRootHostContext(rootContainerInstance: Container): HostContext {
    return {
      dir: rootContainerInstance.dir
    };
  },
  getChildHostContext(
    parentHostContext: HostContext,
    type: Type,
    rootContainerInstance: Container
  ): HostContext {
    if (type === "dir") {
      return {
        dir: null
      };
    }

    return parentHostContext;
  },

  createInstance(
    type: Type,
    props: Props,
    rootContainerInstance: Container,
    hostContext: HostContext,
    internalInstanceHandle: OpaqueHandle
  ): Instance {
    if (hostContext.dir === null) {
      hostContext.dir = getDir(
        rootContainerInstance.dir,
        internalInstanceHandle
      );
    }

    return {
      dir: hostContext.dir,
      name: props.name,
      type: type,
      content: props.content
    };
  },

  appendInitialChild(parentInstance: Instance, child: Instance) {
    appendChild(child);
  },
  appendChild(parentInstance: Instance, child: Instance) {
    appendChild(child);
  },
  appendChildToContainer(container: Container, child: Instance) {
    appendChild(child);
  },
  removeChild(parentInstance: Instance, child: Instance): void {
    removeChild(child);
  },
  removeChildFromContainer(container: Container, child: Instance): void {
    removeChild(child);
  },

  prepareUpdate(
    instance: Instance,
    type: Type,
    oldProps: Props,
    newProps: Props,
    rootContainerInstance: Container,
    hostContext: HostContext
  ): UpdatePayload | null {
    let hasUpdate = false;
    const updatePayload: UpdatePayload = {};

    if (newProps.name !== oldProps.name) {
      hasUpdate = true;
      updatePayload.newName = newProps.name;
    }

    if (type === "file") {
      if (newProps.content !== oldProps.content) {
        hasUpdate = true;
        updatePayload.newContent = newProps.content;
      }
    }

    return hasUpdate ? updatePayload : null;
  },
  commitUpdate(
    instance: Instance,
    updatePayload: UpdatePayload,
    type: Type,
    oldProps: Props,
    newProps: Props,
    internalInstanceHandle: OpaqueHandle
  ): void {
    const fsPath: string = path.join(instance.dir, instance.name);
    if (updatePayload.newContent) {
      if (instance.fd) {
        fse.writeSync(instance.fd, updatePayload.newContent, 0);
      } else {
        const fsPath = path.join(instance.dir, instance.name);
        fse.writeFileSync(fsPath, updatePayload.newContent);
      }
    }

    if (updatePayload.newName) {
      const newPath = path.join(instance.dir, updatePayload.newName);
      if (instance.fd) {
        fse.closeSync(instance.fd);
      }
      fse.renameSync(fsPath, newPath);
    }
  },

  finalizeInitialChildren(
    parentInstance: Instance,
    type: Type,
    props: Props,
    rootContainerInstance: Container,
    hostContext: HostContext
  ): boolean {
    return false;
  },
  createTextInstance(
    text: string,
    rootContainerInstance: Container,
    hostContext: HostContext,
    internalInstanceHandle: OpaqueHandle
  ): TextInstance {
    return null;
  },
  shouldSetTextContent(type: Type, props: Props): boolean {
    return false;
  },
  resetTextContent(instance: Instance): void {},
  prepareForCommit(containerInfo: Container): void {},
  resetAfterCommit(containerInfo: Container): void {}
} as any) as ReactReconciler.HostConfig<Type, Props, Container, Instance, TextInstance, HydratableInstance, PublicInstance, HostContext, UpdatePayload, unknown, unknown, unknown>);

const rootsMap = new Map<string, ReactReconciler.FiberRoot>();

export default {
  render(
    reactElement: React.ReactElement,
    rootDir: string,
    callback?: () => void | null | undefined
  ) {
    let root = rootsMap.get(rootDir);
    // Create a root Container if it doesnt exist
    if (!root) {
      root = ReactFileSystem.createContainer({ dir: rootDir }, false, false);
      rootsMap.set(rootDir, root!);
    }

    // update the root Container
    return ReactFileSystem.updateContainer(reactElement, root, null, () => {
      callback && callback();
    });
  }
};
