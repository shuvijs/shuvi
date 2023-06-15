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
