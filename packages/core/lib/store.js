"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zustand_1 = __importDefault(require("zustand"));
const immer_1 = __importDefault(require("immer"));
function getDirAndName(path) {
    const segs = path.split("/");
    const [name] = segs.splice(-1, 1);
    return {
        name,
        dirname: segs.join("/")
    };
}
function findByPath(path, files) {
    path = path.replace(/^\//, "");
    let node = {
        name: "root",
        $$type: "dir",
        children: files
    };
    if (path === "") {
        return node;
    }
    const segs = path.split("/").reverse();
    while (segs.length) {
        if (!node || node.$$type !== "dir")
            return;
        const searchName = segs.pop();
        node = node.children.find(file => file.name === searchName);
    }
    return node;
}
function ensureDir(path, files) {
    const node = findByPath(path, files);
    if (node) {
        if (node.$$type !== "dir") {
            throw new Error(`File "${node.name}" existed`);
        }
        return;
    }
    else {
        const { dirname, name } = getDirAndName(path);
        ensureDir(dirname, files);
        addFile(name, "dir", { children: [] }, files);
    }
}
function addFile(path, type, props, files) {
    const { dirname, name } = getDirAndName(path);
    const node = findByPath(dirname, files);
    if (!node || node.$$type !== "dir")
        return;
    node.children.push(Object.assign(Object.assign({}, props), { $$type: type, name }));
}
const [useStore, store] = zustand_1.default(_set => {
    const set = (fn) => _set(immer_1.default(state => {
        fn(state);
    }));
    return {
        bootstrapSrc: "",
        files: [],
        set,
        addFile(path, props) {
            set(state => {
                const { dirname, name } = getDirAndName(path);
                ensureDir(dirname, state.files);
                addFile(path, "file", props, state.files);
            });
        },
        removeFile(path) {
            set(state => {
                const { dirname, name } = getDirAndName(path);
                const node = findByPath(dirname, state.files);
                if (!node || node.$$type !== "dir")
                    return;
                const index = node.children.findIndex(file => file.name === name);
                if (index >= 0) {
                    node.children.splice(index, 1);
                }
            });
        },
        updateFile(path, updateFn) {
            set(state => {
                const node = findByPath(path, state.files);
                if (!node || node.$$type !== "dir")
                    return;
                updateFn(node);
            });
        }
    };
});
exports.useStore = useStore;
function updateStore(fn) {
    store.getState().set(fn);
}
function initBootstrap(options) {
    updateStore(state => (state.bootstrapSrc = options.bootstrapSrc));
}
exports.initBootstrap = initBootstrap;
function addGatewayFile(path, files) {
    store.getState().addFile(path, {
        files,
        type: "gateway"
    });
}
exports.addGatewayFile = addGatewayFile;
