import parseRange from 'range-parser';

import { IRequest, IExtendedResponse } from '../types';

export default function handleRangeHeaders(
  content: Buffer,
  req: IRequest,
  res: IExtendedResponse
) {
  res.setHeader('Accept-Ranges', 'bytes');

  const { range } = req.headers;

  if (range) {
    const ranges = parseRange(content.length, range);

    // unsatisfiable
    if (ranges === -1) {
      res.statusCode = 416;
      res.setHeader('Content-Range', `bytes */${content.length}`);
    } else if (ranges === -2) {
      // malformed header treated as regular response
      console.log(
        'A malformed Range header was provided. A regular response will be sent for this request.'
      );
    } else if (ranges.length !== 1) {
      // multiple ranges treated as regular response
      console.log(
        'A Range header with multiple ranges was provided. Multiple ranges are not supported, so a regular response will be sent for this request.'
      );
    } else {
      // valid range header
      const { length } = content;
      // Content-Range
      res.statusCode = 206;
      res.setHeader(
        'Content-Range',
        `bytes ${ranges[0].start}-${ranges[0].end}/${length}`
      );

      content = content.slice(ranges[0].start, ranges[0].end + 1);
    }
  }

  return content;
}
