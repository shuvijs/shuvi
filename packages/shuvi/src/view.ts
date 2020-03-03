import ejs, { TemplateFunction } from "ejs";

export class View {
  parseTemplate(templateStr: string): TemplateFunction {
    return ejs.compile(templateStr);
  }

  renderTemplate(templateFn: TemplateFunction, data: any): string {
    return templateFn(data);
  }
}
