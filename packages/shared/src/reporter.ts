export type SpanId = number;

export type traceData = {
  timestamp: number;
  name: string;
  duration: number;
  startTime: number;
  id: SpanId;
  parentId?: SpanId;
  attrs?: Object;
};

export type Reporter = (data: traceData) => void;
