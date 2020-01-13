import react from "react";
import { FileProps } from "../internal";
declare function File(props: FileProps): react.ReactElement<FileProps, string | ((props: any) => react.ReactElement<any, string | any | (new (props: any) => react.Component<any, any, any>)> | null) | (new (props: any) => react.Component<any, any, any>)>;
declare namespace File {
    var displayName: string;
}
export default File;
