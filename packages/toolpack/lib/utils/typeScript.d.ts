interface ProjectInfo {
    useTypeScript: boolean;
    typeScriptPath?: string;
    tsConfigPath?: string;
}
export declare function getProjectInfo(projectRoot: string): ProjectInfo;
export {};
