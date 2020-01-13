export type Type = "file" | "dir";

export type FsNode = JSX.Element | null | undefined;

export interface DirProps {
  name: string;
  children?: FsNode[] | FsNode | null | undefined;
}

export interface FileProps {
  name: string;
  content: string;
}

export const Types: Record<string, Type> = {
  Directory: "dir",
  File: "file"
};
