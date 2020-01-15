import ReactReconciler from "react-reconciler";
declare type Type = "file" | "dir";
declare type Container = {
    dir: string;
};
declare type Instance = {
    type: Type;
    dir: string;
    name: string;
    fd?: number;
    content?: string;
};
export declare const ReactFsReconciler: ReactReconciler.Reconciler<Instance, null, Container, Instance>;
export {};
