export interface ITemplateData {
  [x: string]: any;
}

export interface IBuildOptions {
  dir: string;
}

export type ISpecifier =
  | true    // export all
  | string  //  imported === local
  | {
      imported: string;
      local: string;
    };
