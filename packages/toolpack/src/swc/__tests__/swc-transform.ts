// @ts-ignore
import { transform } from '../load-sources';

export default async function swcTransform(
  inputSource: string,
  options: Record<string, any>
) {
  return await (
    transform(inputSource, options) as Promise<{ code: string }>
  ).then(output => {
    return output.code;
  });
}
