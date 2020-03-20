import TemplateFile, {
  Props as TemplateFileProps
} from "../../components/files/Template";
import ModuleCollection, {
  IModules,
  Props as ModuleCollectionProps
} from "../../components/files/ModuleCollection";
import { File } from "./FileNode";

export { Dir, IFileNode, isDir, isFile, File } from "./FileNode";

export function createFile(
  name: string,
  props: Omit<TemplateFileProps, "name">
) {
  return new File(name, TemplateFile, props);
}

export function createModuleCollection<T extends IModules = {}>(
  name: string,
  props: Omit<ModuleCollectionProps<T>, "name">
) {
  return new File(name, ModuleCollection, props);
}

export function createCustomFile<Props = {}>(
  name: string,
  type: React.ComponentType<Props>,
  props: Omit<Props, "name">
) {
  return new File(name, type, props);
}
