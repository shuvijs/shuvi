import { IncomingMessage, ServerResponse } from 'http';
import { Stream } from 'stream';
import querystring from 'querystring';
import cookie from 'cookie';
import getRawBody from 'raw-body';
import contentType from 'content-type';
import { IParams, ParsedQuery } from '@shuvi/router';
import { IResponse, IRequest } from '../types/runtime';

export interface IApiReq {
  pathname: string;
  query: ParsedQuery;
  params: IParams;
  cookies: { [key: string]: string };
  body?: { [key: string]: any };
}

export type IApiRequest = IRequest & IApiReq;

type Send<T> = (body: T) => void;

type IApiRes<T = any> = {
  send: Send<T>;
  json: Send<T>;
  status: (statusCode: number) => IResponse;
  redirect(url: string): IResponse;
  redirect(status: number, url: string): IResponse;
};

export type IApiResponse<T = any> = ServerResponse & IApiRes<T>;

export type IApiRequestHandler<T = any> = (
  req: IApiRequest,
  res: IApiResponse<T>
) => void | Promise<void>;

export async function apiRouteHandler(
  req: IRequest,
  res: IResponse,
  resolver: IApiRequestHandler,
  apiRoutesConfig: any
): Promise<void> {
  try {
    const { bodyParser } = apiRoutesConfig || {};

    const { pathname, query, params } = req;

    const apiReq: IApiReq = {
      pathname,
      query,
      params,
      // Parsing of cookies
      cookies: getCookieParser(req)
    };

    // Parsing of body
    if (bodyParser && !apiReq.body) {
      apiReq.body = await parseBody(
        req,
        bodyParser && bodyParser.sizeLimit ? bodyParser.sizeLimit : '1mb'
      );
    }

    const apiRes: IApiRes = {
      status: (statusCode: number) => sendStatusCode(res, statusCode),
      send: (data: any) => sendData(req, res, data),
      json: (data: any) => sendJson(req, res, data),
      redirect: (statusOrUrl: number | string, url?: string) =>
        redirect(res, statusOrUrl, url)
    };

    let wasPiped = false;

    if (process.env.NODE_ENV !== 'production') {
      // listen for pipe event and don't show resolve warning
      res.once('pipe', () => (wasPiped = true));
    }

    // Call API route method
    await resolver(Object.assign(req, apiReq), Object.assign(res, apiRes));

    if (
      process.env.NODE_ENV !== 'production' &&
      !(res.finished || res.headersSent) &&
      !wasPiped
    ) {
      console.warn(
        `API resolved without sending a response for ${req.url}, this may result in stalled requests.`
      );
    }
  } catch (err) {
    throw err;
  }
}

/**
 * Parse incoming message like `json` or `urlencoded`
 * @param req request object
 */
export async function parseBody(
  req: IRequest,
  limit: string | number
): Promise<any> {
  let contentTypeObj;
  try {
    contentTypeObj = contentType.parse(
      req.headers['content-type'] || 'text/plain'
    );
  } catch {
    contentTypeObj = contentType.parse('text/plain');
  }
  const { type, parameters } = contentTypeObj;
  const encoding =
    (parameters.charset && parameters.charset.toLowerCase()) || 'utf-8';

  let buffer;

  try {
    buffer = await getRawBody(req, { encoding, limit });
  } catch (e: any) {
    if (e.type === 'entity.too.large') {
      throw new ApiError(413, `Body exceeded ${limit} limit`);
    } else {
      throw new ApiError(400, 'Invalid body');
    }
  }

  const body = buffer.toString();

  if (type === 'application/json' || type === 'application/ld+json') {
    return parseJson(body);
  } else if (type === 'application/x-www-form-urlencoded') {
    return querystring.decode(body);
  } else {
    return body;
  }
}

/**
 * Parse `JSON` and handles invalid `JSON` strings
 * @param str `JSON` string
 */
function parseJson(str: string): object {
  if (str.length === 0) {
    // special-case empty json body, as it's a common client-side mistake
    return {};
  }

  try {
    return JSON.parse(str);
  } catch (e) {
    throw new ApiError(400, 'Invalid JSON');
  }
}

/**
 * Parse cookies from `req` header
 * @param req request object
 */

export function getCookieParser(req: IncomingMessage): {
  [key: string]: string;
} {
  const header: undefined | string | string[] = req.headers.cookie;
  if (!header) {
    return {};
  }
  return cookie.parse(Array.isArray(header) ? header.join(';') : header);
}

/**
 *
 * @param res response object
 * @param statusCode `HTTP` status code of response
 */
export function sendStatusCode(res: IResponse, statusCode: number): IResponse {
  res.statusCode = statusCode;
  return res;
}

/**
 *
 * @param res response object
 * @param [statusOrUrl] `HTTP` status code of redirect
 * @param url URL of redirect
 */
export function redirect(
  res: IResponse,
  statusOrUrl: string | number,
  url?: string
): IResponse {
  if (typeof statusOrUrl === 'string') {
    url = statusOrUrl;
    statusOrUrl = 307;
  }
  if (typeof statusOrUrl !== 'number' || typeof url !== 'string') {
    throw new Error(
      `Invalid redirect arguments. Please use a single argument URL, e.g. res.redirect('/destination') or use a status code and URL, e.g. res.redirect(307, '/destination').`
    );
  }
  res.writeHead(statusOrUrl, { Location: url });
  res.write('');
  res.end();
  return res;
}

/**
 * Send `any` body to response
 * @param req request object
 * @param res response object
 * @param body of response
 */
export function sendData(req: IRequest, res: IResponse, body: any): void {
  if (body === null || body === undefined) {
    res.end();
    return;
  }

  const contentType = res.getHeader('Content-Type');

  if (body instanceof Stream) {
    if (!contentType) {
      res.setHeader('Content-Type', 'application/octet-stream');
    }
    body.pipe(res);
    return;
  }

  const isJSONLike = ['object', 'number', 'boolean'].includes(typeof body);
  const stringifiedBody = isJSONLike ? JSON.stringify(body) : body;

  if (Buffer.isBuffer(body)) {
    if (!contentType) {
      res.setHeader('Content-Type', 'application/octet-stream');
    }
    res.setHeader('Content-Length', body.length);
    res.end(body);
    return;
  }

  if (isJSONLike) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }

  res.setHeader('Content-Length', Buffer.byteLength(stringifiedBody));
  res.end(stringifiedBody);
}

/**
 * Send `JSON` object
 * @param res response object
 * @param jsonBody of data
 */
export function sendJson(req: IRequest, res: IResponse, jsonBody: any): void {
  // Set header to application/json
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // Use send to handle request
  return sendData(req, res, jsonBody);
}

/**
 * Custom error class
 */
export class ApiError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}
