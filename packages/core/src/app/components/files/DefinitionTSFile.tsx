import React from 'react';
import { File } from '@shuvi/react-fs';
import { ISpecifier } from '../../../types';
import { useGetExportsContent } from '../../hooks/useGetExportsContent';

export interface Props {
  name: string;
  exports: { [source: string]: ISpecifier | ISpecifier[] };
  typeName: string;
}

function DefinitionTSFile({ name, exports = {}, typeName }: Props) {
  const content = `declare module '${typeName}' {
    ${useGetExportsContent(exports, true)}
}`;

  return <File name={name} content={content} />;
}

export default DefinitionTSFile;
