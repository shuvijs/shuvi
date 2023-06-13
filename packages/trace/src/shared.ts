export type SpanId = number;

export type Reporter = (
  timestamp: number,
  spanName: string,
  duration: number,
  startTime: number,
  id: SpanId,
  parentId?: SpanId,
  attrs?: Object
) => void;

export let reporter: Reporter | undefined = undefined;
export function setReporter(r: Reporter) {
  reporter = r;
}
export function getReporter() {
  return reporter;
}
