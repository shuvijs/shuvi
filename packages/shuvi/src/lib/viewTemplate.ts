import ejs, { TemplateFunction } from "ejs";
import fs from "fs";

export { TemplateFunction };

function parseTemplateFile(templateFile: string): TemplateFunction {
  const content = fs.readFileSync(templateFile, "utf8");
  return ejs.compile(content);
}

function renderTemplate(templateFn: TemplateFunction, data: any): string {
  return templateFn(data);
}

export { parseTemplateFile, renderTemplate };
