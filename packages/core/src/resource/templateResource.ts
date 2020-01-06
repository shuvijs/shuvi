import Handlebars from "handlebars";
import fse from "fs-extra";
import { Application } from "../application";
import { Resource, ResourceConstructionOptions } from "./resource";

export interface TemplateContextData {
  [x: string]: any;
}

export interface TemplateContext<
  T extends TemplateContextData = TemplateContextData
> {
  set<K extends keyof T>(key: K, value: T[K]): void;
  getContext(): T;
}

export interface TemplateResourceConstructionOptions
  extends ResourceConstructionOptions {
  context: TemplateContext;
}

export function createTemplateContext<
  T = TemplateContextData
>(): TemplateContext<T> {
  const data = Object.create(null);

  return {
    set(key, value) {
      data[key] = value;
    },
    getContext() {
      return data;
    }
  };
}

export type TemplateResource = TemplateResourceClass;

export class TemplateResourceClass extends Resource {
  private _context: TemplateContext;
  private _template!: Handlebars.TemplateDelegate;

  constructor({ context, ...parentOpts }: TemplateResourceConstructionOptions) {
    super(parentOpts);
    this._context = context;
  }

  async build(app: Application) {
    if (!this._template) {
      const content = await fse.readFile(this.src, 'utf8');
      this._template = Handlebars.compile(content);
    }

    return this._template(this._context.getContext());
  }
}
