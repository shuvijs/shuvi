export interface ITemplateData {
  [x: string]: any;
}

export interface IBuildOptions {
  dir: string;
}

export type ISpecifier =
  | string
  | {
      local: string;
      imported: string;
    };
