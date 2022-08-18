import { SourceMapConsumer, NullableMappedPosition } from 'source-map';

export async function findOriginalSourcePositionAndContent(
  webpackSource: any,
  position: { line: number; column: number | null }
) {
  const consumer = await new SourceMapConsumer(webpackSource.map());

  try {
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
    // Note: There are some issues with the source-map library, so choose version 0.5.7 here, same as react-error-overlay.
    // consumer.destroy();
  }
}
