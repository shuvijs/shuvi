import TemplateFile, {
  Props as TemplateFileProps
} from "../../components/files/Template";
import Module, { Props as ModuleProps } from "../../components/files/Module";
import ModuleProxy, {
  Props as ModuleProxyProps
} from "../../components/files/ModuleProxy";
import { File } from "./FileNode";

export { Dir, IFileNode, isDir, isFile, File } from "./FileNode";

export function createFile(
  name: string,
  props: Omit<TemplateFileProps, "name">
) {
  return new File(name, TemplateFile, props);
}

export function createModule(name: string, props: Omit<ModuleProps, "name">) {
  return new File(name, Module, props);
}

export function createModuleProxy(
  name: string,
  props: Omit<ModuleProxyProps, "name">
) {
  return new File(name, ModuleProxy, props);
}

export function createCustomFile<Props = {}>(
  name: string,
  type: React.ComponentType<Props>,
  props: Omit<Props, "name">
) {
  return new File(name, type, props);
}
