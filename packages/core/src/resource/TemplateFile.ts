import Handlebars from "handlebars";
import { Resource, createElement } from "./resource";

export interface TemplateData {
  [x: string]: any;
}

export interface TemplateFileProps {
  name: string;
  template: string;
  data?: TemplateData;
}

export default class TemplateFile extends Resource<TemplateFileProps> {
  private _template!: Handlebars.TemplateDelegate;

  constructor(props: TemplateFileProps) {
    super(props);
  }

  build() {
    this._template = Handlebars.compile(this.props.template);

    return createElement("file", {
      name: this.props.name,
      content: this._template(this.props.data || {})
    });
  }
}
