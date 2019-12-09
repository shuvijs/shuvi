interface ProjectInfo {
    typeScriptPath: string;
    useTypeScript: boolean;
    tsConfigPath: string;
}
export declare function getProjectInfo(projectRoot: string): ProjectInfo;
export {};
