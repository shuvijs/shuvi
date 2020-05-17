export interface ICodeSnippet {
  imports: string;
  body: string;
}

export interface ITemplateData {
  [x: string]: any;
}

export interface IBuildOptions {
  dir: string;
}

export type ISpecifier =
  | string //  imported === local
  | {
      imported: string;
      local: string;
    };
