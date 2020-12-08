import { File } from '@shuvi/react-fs';
import { IExports } from '../../../types';
import { useGetExportsContent } from '../../hooks/useGetExportsContent';

export interface Props {
  name: string;
  exports: IExports;
}

function Module({ name, exports = {} }: Props) {
  const content = useGetExportsContent(exports);
  return <File name={name} content={content} />;
}

export default Module;
