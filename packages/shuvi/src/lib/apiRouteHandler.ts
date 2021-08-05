import { IncomingMessage } from 'http';
import { Stream } from 'stream';
import querystring from 'querystring';
import cookie from 'cookie';
import getRawBody from 'raw-body';
import contentType from 'content-type';
import {
  IRequest,
  IResponse,
  IApiRequest,
  IApiResponse,
  IApiRouteRequestHandler
} from '@shuvi/types';

export async function apiRouteHandler(
  req: IRequest,
  res: IResponse,
  resolver: IApiRouteRequestHandler,
  apiRoutesConfig: any
): Promise<void> {
  const apiReq = req as IApiRequest;
  const apiRes = res as IApiResponse;

  try {
    const { bodyParser, externalResolver = false } = apiRoutesConfig || {};

    // Parsing of cookies
    apiReq.cookies = getCookieParser(req);

    // Parsing of body
    if (bodyParser && !apiReq.body) {
      apiReq.body = await parseBody(
        apiReq,
        bodyParser && bodyParser.sizeLimit ? bodyParser.sizeLimit : '1mb'
      );
    }

    apiRes.status = (statusCode: number) => sendStatusCode(apiRes, statusCode);
    apiRes.send = (data: any) => sendData(apiReq, apiRes, data);
    apiRes.json = (data: any) => sendJson(apiRes, data);
    apiRes.redirect = (statusOrUrl: number | string, url?: string) =>
      redirect(apiRes, statusOrUrl, url);

    let wasPiped = false;

    if (process.env.NODE_ENV !== 'production') {
      // listen for pipe event and don't show resolve warning
      res.once('pipe', () => (wasPiped = true));
    }

    // Call API route method
    await resolver(apiReq, apiRes);

    if (
      process.env.NODE_ENV !== 'production' &&
      !externalResolver &&
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
  req: IApiRequest,
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
  } catch (e) {
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

export function getCookieParser(
  req: IncomingMessage
): { [key: string]: string } {
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
export function sendStatusCode(
  res: IApiResponse,
  statusCode: number
): IApiResponse<any> {
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
  res: IApiResponse,
  statusOrUrl: string | number,
  url?: string
): IApiResponse<any> {
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
export function sendData(req: IApiRequest, res: IApiResponse, body: any): void {
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
export function sendJson(res: IApiResponse, jsonBody: any): void {
  // Set header to application/json
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // Use send to handle request
  res.send(jsonBody);
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
