import { SourceMapConsumer, NullableMappedPosition } from 'source-map';
// @ts-ignore
import { parseSourceMapInput } from 'source-map/lib/util';

export async function findOriginalSourcePositionAndContent(
  webpackSource: any,
  position: { line: number; column: number | null }
) {
  let consumer;
  let content;
  // the webpackSource.map() may be broken, check the validity in advance
  try {
    content = parseSourceMapInput(webpackSource.map());
  } catch (e) {
    return null;
  }

  try {
    consumer = await new SourceMapConsumer(content);
    const sourcePosition: NullableMappedPosition = consumer.originalPositionFor(
      {
        line: position.line,
        column: position.column ?? 0
      }
    );

    if (!sourcePosition.source) {
      return null;
    }

    const sourceContent: string | null =
      consumer.sourceContentFor(
        sourcePosition.source,
        /* returnNullOnMissing */ true
      ) ?? null;

    return {
      sourcePosition,
      sourceContent
    };
  } finally {
    consumer && consumer.destroy();
  }
}
