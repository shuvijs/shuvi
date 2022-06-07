import * as ejs from 'ejs';
import { TemplateFunction } from 'ejs';
import * as fs from 'fs';

export { TemplateFunction };

function parseTemplateFile(templateFile: string): TemplateFunction {
  const content = fs.readFileSync(templateFile, 'utf8');
  return ejs.compile(content);
}

function renderTemplate(templateFn: TemplateFunction, data: any): string {
  return templateFn(data);
}

export { parseTemplateFile, renderTemplate };
