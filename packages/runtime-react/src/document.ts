import { UrlWithParsedQuery } from "url";
import { Runtime, IApi } from "@shuvi/types";

import IDocumentProps = Runtime.IDocumentProps;
import ITemplateData = Runtime.ITemplateData;

export function modifyDocumentProps(documentProps: IDocumentProps) {
  return documentProps;
}

export function getTemplateData(req: any): ITemplateData {
  return {};
}

export function getDocumentProps(api: IApi, req: { url: UrlWithParsedQuery }): ITemplateData {
  return {};
}
