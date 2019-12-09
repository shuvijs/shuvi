import { PluginItem } from "@babel/core";
declare type CustomPresetOptions = {
    "preset-env"?: any;
    "preset-react"?: any;
    "transform-runtime"?: any;
};
declare type BabelPreset = {
    presets?: PluginItem[] | null;
    plugins?: PluginItem[] | null;
    sourceType?: "script" | "module" | "unambiguous";
    overrides?: any[];
};
declare const _default: (api: any, options?: CustomPresetOptions) => BabelPreset;
export default _default;
