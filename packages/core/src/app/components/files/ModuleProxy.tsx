import React, { useMemo } from 'react';
import { File } from '@shuvi/react-fs';
import { useFileByOrder } from '../../hooks/useFileByOrder';

export interface Props {
  name: string;
  source: string | string[];
  defaultExport?: boolean;
}

function ModuleProxy({ name, source, defaultExport }: Props) {
  const lookups = useMemo(() => {
    if (Array.isArray(source)) {
      return source.slice(0, source.length - 1);
    } else {
      return [];
    }
  }, [source]);
  const fallback = Array.isArray(source) ? source[source.length - 1] : source;

  const file = useFileByOrder(lookups, fallback);

  let statements: string[] = [];
  if (defaultExport) {
    statements.push(`import temp from "${file}"`);
    statements.push(`export default temp`);
  } else {
    statements.push(`export * from "${file}"`);
  }

  return <File name={name} content={statements.join('\n')} />;
}

export default ModuleProxy;
