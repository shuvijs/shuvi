"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const react_reconciler_1 = __importDefault(require("react-reconciler"));
function traverseUp(tree, visitor) {
    let parent = tree;
    while ((parent = parent.return) !== null) {
        visitor(parent);
    }
}
function getDir(rootDir, internalInstanceHandle) {
    let pathSegments = [];
    traverseUp(internalInstanceHandle, node => {
        if (node.elementType === "dir") {
            pathSegments.push(node.memoizedProps.name);
        }
    });
    return path_1.default.join(rootDir, ...pathSegments.reverse());
}
function appendChild(child) {
    const fsPath = path_1.default.join(child.dir, child.name);
    switch (child.type) {
        case "file":
            fs_extra_1.default.ensureDirSync(child.dir);
            const fd = (child.fd = fs_extra_1.default.openSync(fsPath, "w+"));
            fs_extra_1.default.writeSync(fd, child.content, 0);
            break;
        case "dir":
            fs_extra_1.default.ensureDirSync(fsPath);
            break;
        default:
            break;
    }
}
function removeChild(child) {
    const fsPath = path_1.default.join(child.dir, child.name);
    fs_extra_1.default.removeSync(fsPath);
}
const ReactFileSystem = react_reconciler_1.default({
    supportsMutation: true,
    getPublicInstance(instance) {
        return instance;
    },
    getRootHostContext(rootContainerInstance) {
        return {
            dir: rootContainerInstance.dir
        };
    },
    getChildHostContext(parentHostContext, type, rootContainerInstance) {
        if (type === "dir") {
            return {
                dir: null
            };
        }
        return parentHostContext;
    },
    createInstance(type, props, rootContainerInstance, hostContext, internalInstanceHandle) {
        if (hostContext.dir === null) {
            hostContext.dir = getDir(rootContainerInstance.dir, internalInstanceHandle);
        }
        return {
            dir: hostContext.dir,
            name: props.name,
            type: type,
            content: props.content
        };
    },
    appendInitialChild(parentInstance, child) {
        appendChild(child);
    },
    appendChild(parentInstance, child) {
        appendChild(child);
    },
    appendChildToContainer(container, child) {
        appendChild(child);
    },
    removeChild(parentInstance, child) {
        removeChild(child);
    },
    removeChildFromContainer(container, child) {
        removeChild(child);
    },
    prepareUpdate(instance, type, oldProps, newProps, rootContainerInstance, hostContext) {
        let hasUpdate = false;
        const updatePayload = {};
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
    commitUpdate(instance, updatePayload, type, oldProps, newProps, internalInstanceHandle) {
        const fsPath = path_1.default.join(instance.dir, instance.name);
        if (updatePayload.newContent) {
            if (instance.fd) {
                fs_extra_1.default.ftruncateSync(instance.fd, 0);
                fs_extra_1.default.writeSync(instance.fd, updatePayload.newContent, 0);
            }
            else {
                const fsPath = path_1.default.join(instance.dir, instance.name);
                fs_extra_1.default.writeFileSync(fsPath, updatePayload.newContent);
            }
        }
        if (updatePayload.newName) {
            const newPath = path_1.default.join(instance.dir, updatePayload.newName);
            if (instance.fd) {
                fs_extra_1.default.closeSync(instance.fd);
            }
            fs_extra_1.default.renameSync(fsPath, newPath);
        }
    },
    finalizeInitialChildren(parentInstance, type, props, rootContainerInstance, hostContext) {
        return false;
    },
    createTextInstance(text, rootContainerInstance, hostContext, internalInstanceHandle) {
        return null;
    },
    shouldSetTextContent(type, props) {
        return false;
    },
    resetTextContent(instance) { },
    prepareForCommit(containerInfo) { },
    resetAfterCommit(containerInfo) { }
});
const rootsMap = new Map();
exports.default = {
    render(reactElement, rootDir, callback) {
        let root = rootsMap.get(rootDir);
        // Create a root Container if it doesnt exist
        if (!root) {
            root = ReactFileSystem.createContainer({ dir: rootDir, }, false, false);
            rootsMap.set(rootDir, root);
        }
        // update the root Container
        return ReactFileSystem.updateContainer(reactElement, root, null, () => {
            callback && callback();
        });
    }
};
